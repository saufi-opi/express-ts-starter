import { FilterQuery, PipelineStage, QueryOptions } from 'mongoose'
import { Account } from '../models/account.model'
import { createHash } from 'crypto'
import BaseService, { ExtendedSearchQueryOptions } from '../base/service.base'

export class AccountService extends BaseService<Account> {
  public aggregationPipeline(options: ExtendedSearchQueryOptions): PipelineStage[] {
    const pipeline = super.aggregationPipeline(options)
    pipeline.push({
      $project: {
        password: false
      }
    })
    return pipeline
  }

  public async insertOne(docs: Partial<Account>, options?: QueryOptions<Account>): Promise<Account | null> {
    docs.password = this.hashedPassword(docs.password)
    const exist = await this.findOne({ email: docs.email }, options)
    if (exist) throw this.error(400, 'duplicate-email')

    const item = await super.insertOne(docs, options)
    return item
  }

  public async findOne(filter: FilterQuery<Account>, options?: QueryOptions<Account>): Promise<Account | null> {
    const item = await super.findOne(filter, options)
    return item
  }

  public async updateOne(filter: FilterQuery<Account>, docs: Partial<Account>, options?: QueryOptions<Account>): Promise<Account | null> {
    if (docs.password) {
      docs.password = this.hashedPassword(docs.password)
    }
    if (docs.email) {
      const exist = await this.findOne({ email: docs.email, id: { $ne: docs.id } }, options)
      if (exist) throw this.error(400, 'duplicate-email')
    }

    const item = await super.updateOne(filter, docs, options)
    return item
  }

  public async updateMany(filter: FilterQuery<Account>, docs: Partial<Account>, options?: QueryOptions<Account>): Promise<Account[]> {
    if (docs.password) {
      docs.password = this.hashedPassword(docs.password)
    }
    if (docs.email) {
      const exist = await this.findOne({ email: docs.email, id: { $ne: docs.id } }, options)
      if (exist) throw this.error(400, 'duplicate-email')
    }

    const items = await super.deleteMany(filter, options)
    return items
  }

  public async deleteOne(filter: FilterQuery<Account>, options?: QueryOptions<Account>): Promise<Account | null> {
    const item = await super.deleteOne(filter, options)
    return item
  }

  public async deleteMany(filter: FilterQuery<Account>, options?: QueryOptions<Account>): Promise<Account[]> {
    const items = await super.deleteMany(filter, options)
    return items
  }

  hashedPassword(password: string, salt = 'default-salt') {
    const hash = createHash('sha256')
    hash.update(password + salt)
    return hash.digest('hex')
  }
}

export default AccountService
