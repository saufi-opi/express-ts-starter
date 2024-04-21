import { AggregateOptions, ClientSession, FilterQuery, Model, PipelineStage, QueryOptions } from 'mongoose'
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
  protected model: Model<T>
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

  public aggregationPipeline(options: ExtendedSearchQueryOptions): PipelineStage[] {
    const pipeline: PipelineStage[] = []
    // TODO: make filtering, pagination, sort

    // generate permission claim pipeline
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
      pipeline.push({
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
      })
      pipeline.push({
        $addFields: {
          'resources.claimNum': {
            $size: '$resources.claim'
          }
        }
      })
      pipeline.push({
        $match: {
          'resources.claimNum': { $gt: 0 }
        }
      })
      pipeline.push({
        $unset: ['resources.claim', 'resources.claimNum']
      })
    }

    return pipeline
  }

  public async search(query: ExtendedSearchQueryOptions = {}, options?: AggregateOptions): Promise<T[]> {
    options ??= {}
    const items = await this.model.aggregate(this.aggregationPipeline(query), options)
    return items
  }

  public async insertOne(docs: Partial<T>, options?: QueryOptions<T>): Promise<T | null> {
    options ??= {}
    options.upsert = true
    options.returnDocument = 'after'
    docs = appendDoc(docs)
    const item = await this.model.findOneAndReplace({ id: docs.id }, docs, options)
    return item
  }

  public async findOne(filter: FilterQuery<T>, options?: QueryOptions<T>): Promise<T | null> {
    options ??= {}
    const item = await this.model.findOne(filter, {}, options)
    return item
  }

  public async findById(id: string, options?: QueryOptions<T>): Promise<T | null> {
    const item = await this.model.findOne({ id }, {}, options)
    return item
  }

  public async updateOne(filter: FilterQuery<T>, docs: Partial<T>, options?: QueryOptions<T>): Promise<T | null> {
    options ??= {}
    options.returnDocument = 'after'
    const item = await this.model.findOneAndUpdate(filter, docs, options)
    return item
  }

  public async updateMany(filter: FilterQuery<T>, docs: Partial<T>, options?: QueryOptions<T>): Promise<T[]> {
    options ??= {}
    const items = await this.model.find(filter, {}, options)
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
    const items = await this.model.find(filter, options, options)
    await this.model.deleteMany(filter, { session: options?.session })
    return items
  }

  public async resources(docs: T, session: ClientSession) {
    const resources: Resources = {}
    return resources
  }
}

export default BaseService
