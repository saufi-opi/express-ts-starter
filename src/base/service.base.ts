import { AggregateOptions, ClientSession, FilterQuery, Model, PipelineStage, QueryOptions, UpdateQuery } from 'mongoose'
import { createError, createErrorFactory } from '../utils/error'
import { appendDoc } from '../utils/database'
import { Resources } from '../interfaces/response.interface'
import { FLAGS } from '../permissions/permissions.flags'
import { PermissionClaimnOwnerType } from '../permissions/permission.model'
import databaseNames from '../databases/database.names'

export interface ServiceOptions {
  dbName: string
  primaryKey?: string
}

export interface SearchQueryOptions {
  search?: string | Record<string, unknown>
  filter?: string | Record<string, unknown>
  sort?: string
  page?: number
  pageSize?: number
}

export interface ExtendedSearchQueryOptions extends SearchQueryOptions {
  account?: string
  role?: string
}

export class BaseService<T extends { id: string }> {
  public readonly model: Model<T>
  public error: typeof createError
  public dbName: string
  public primaryKey: string

  constructor(model: Model<T>, options: ServiceOptions) {
    options.primaryKey ??= 'id'

    this.model = model
    this.error = createErrorFactory(options.dbName)
    this.dbName = options.dbName
    this.primaryKey = options.primaryKey
  }

  public aggregationPipeline(_options: ExtendedSearchQueryOptions): PipelineStage[] {
    const pipeline: PipelineStage[] = []
    return pipeline
  }

  public async search(query: ExtendedSearchQueryOptions = {}, options?: AggregateOptions): Promise<T[]> {
    options ??= {}
    const items = await this.model.aggregate(this.computePipeline(query), options)
    return items
  }

  // TODO: get total counts based on filter and search
  public async count() {}

  public async insertOne(docs: Partial<T>, options?: QueryOptions<T>): Promise<T | null> {
    options ??= {}
    options.upsert = true
    options.returnDocument = 'after'
    docs = appendDoc(docs)
    const filter = { id: docs.id } as FilterQuery<T>
    const item = await this.model.findOneAndReplace(filter, docs, options)
    return item
  }

  public async findOne(filter: FilterQuery<T>, options?: QueryOptions<T>): Promise<T | null> {
    options ??= {}
    const item = await this.model.findOne(filter, options.projection, options)
    return item
  }

  public async findById(id: string, options?: QueryOptions<T>): Promise<T | null> {
    options ??= {}
    const filter = { id } as FilterQuery<T>
    const item = await this.model.findOne(filter, options.projection, options)
    return item
  }

  public async updateOne(filter: FilterQuery<T>, docs: Partial<T> | UpdateQuery<T>, options?: QueryOptions<T>): Promise<T | null> {
    options ??= {}
    options.returnDocument = 'after'
    const item = await this.model.findOneAndUpdate(filter, docs, options)
    return item
  }

  public async updateMany(filter: FilterQuery<T>, docs: Partial<T> | UpdateQuery<T>, options?: QueryOptions<T>): Promise<T[]> {
    options ??= {}
    const items = await this.model.find(filter, options.projection, options)
    await this.model.updateMany(filter, docs, { session: options?.session })
    const results = await this.model.find({ id: { $in: items.map((o) => o.id) } }, {}, options)
    return results
  }

  public async deleteOne(filter: FilterQuery<T>, options?: QueryOptions<T>): Promise<T | null> {
    options ??= {}
    options.returnDocument = 'after'
    const item = await this.model.findOneAndDelete(filter, options)
    return item
  }

  public async deleteMany(filter: FilterQuery<T>, options?: QueryOptions<T>): Promise<T[]> {
    options ??= {}
    const items = await this.model.find(filter, options.projection, options)
    await this.model.deleteMany(filter, { session: options.session })
    return items
  }

  public async resources(_docs: T, _session: ClientSession) {
    const resources: Resources = {}
    return resources
  }

  // TODO: make searching, filtering

  private applySortPipeline(pipeline: PipelineStage[], sort: SearchQueryOptions['sort']): void {
    if (sort) {
      const stage: PipelineStage.Sort = {
        $sort: {}
      }
      for (const s of sort.split(',')) {
        const symbol = s.startsWith('-') ? '-' : '+'
        const field = s.replace(symbol, '').trim()
        const order = symbol === '-' ? -1 : 1
        stage.$sort[field] = order
      }
      pipeline.push(stage)
    }
  }

  private applyPaginationPipeline(pipeline: PipelineStage[], options: Pick<SearchQueryOptions, 'page' | 'pageSize'>) {
    options ??= {}
    let { page, pageSize } = options

    if (typeof page !== 'undefined' && typeof pageSize !== 'undefined') {
      page = Number(page)
      pageSize = Number(pageSize)

      let skipPipeline: PipelineStage.Skip, limitPipeline: PipelineStage.Limit
      const skip = page > 0 ? (page - 1) * pageSize : 0
      limitPipeline = { $limit: pageSize + skip }
      skipPipeline = { $skip: skip }

      pipeline.push(limitPipeline, skipPipeline)
    }
  }

  private applyPermissionClaimPipeline(pipeline: PipelineStage[], options: ExtendedSearchQueryOptions): void {
    const $or = []
    if (options.account) {
      $or.push({
        $and: [
          { 'items.flag': { $bitsAllSet: FLAGS.READ } },
          { $expr: { $eq: ['$items.ownerType', PermissionClaimnOwnerType.ACCOUNT] } },
          { $expr: { $eq: ['$items.ownerRef', options.account] } }
        ]
      })
    }
    if (options.role) {
      $or.push({
        $and: [
          { 'items.flag': { $bitsAllSet: FLAGS.READ } },
          { $expr: { $eq: ['$items.ownerType', PermissionClaimnOwnerType.ROLE] } },
          { $expr: { $eq: ['$items.ownerRef', options.role] } }
        ]
      })
    }
    if ($or.length > 0) {
      pipeline.push(
        // 1. lookup from permission claim collection
        {
          $lookup: {
            from: databaseNames.system.claim,
            let: { [this.primaryKey]: `$${this.primaryKey}` },
            pipeline: [
              {
                $match: {
                  $and: [{ $expr: { $eq: ['$resourceRef', `$$${this.primaryKey}`] } }, { $expr: { $eq: ['$resource', this.dbName] } }]
                }
              },
              {
                $unwind: {
                  path: '$items'
                }
              },
              {
                $match: {
                  $or
                }
              }
            ],
            as: 'resources.claim'
          }
        },
        // 2. add resources.claimNum field
        {
          $addFields: {
            'resources.claimNum': {
              $size: '$resources.claim'
            }
          }
        },
        // 3. filter out item without read permission
        {
          $match: {
            'resources.claimNum': { $gt: 0 }
          }
        },
        // 4. cleanup
        {
          $unset: ['resources.claim', 'resources.claimNum']
        }
      )
    }
  }

  private computePipeline(options: ExtendedSearchQueryOptions): PipelineStage[] {
    const pipeline: PipelineStage[] = []
    // 1. apply search and filter
    // 2. apply permision claim pipeline
    this.applyPermissionClaimPipeline(pipeline, options)
    // 3. apply this.aggregationPipeline
    pipeline.push(...this.aggregationPipeline(options))
    // 4. apply sort
    this.applySortPipeline(pipeline, options.sort)
    // 5. apply page and pageSize
    this.applyPaginationPipeline(pipeline, options)

    return pipeline
  }
}

export default BaseService
