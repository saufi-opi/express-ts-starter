import { ClientSession, FilterQuery, Model } from 'mongoose'
import { createError, createErrorFactory } from '../utils/error'
import { appendDoc } from '../utils/database'

export interface ServiceOptions {
  session?: ClientSession
  projection?: Record<string, boolean>
}

export class BaseService<T extends { id: string }> {
  protected model: Model<T>
  public error: typeof createError

  constructor(model: Model<T>, dbName: string) {
    this.model = model
    this.error = createErrorFactory(dbName)
  }

  public async search(filter: FilterQuery<T> = {}): Promise<T[]> {
    const items = await this.model.find(filter, { password: false })
    return items
  }

  public async insertOne(docs: Partial<T>, options?: ServiceOptions): Promise<T | null> {
    docs = appendDoc(docs)
    const item = await this.model.findOneAndReplace({ id: docs.id }, docs, {
      ...options,
      upsert: true,
      returnDocument: 'after'
    })

    return item
  }

  public async findOne(filter: FilterQuery<T>, options?: ServiceOptions): Promise<T | null> {
    const item = await this.model.findOne(filter, options, options)
    return item
  }

  public async updateOne(filter: FilterQuery<T>, docs: Partial<T>, options?: ServiceOptions): Promise<T | null> {
    const item = await this.model.findOneAndUpdate(filter, docs, {
      ...options,
      returnDocument: 'after'
    })
    return item
  }

  public async updateMany(filter: FilterQuery<T>, docs: Partial<T>, options?: ServiceOptions): Promise<T[]> {
    const items = await this.model.find(filter, {}, options)
    await this.model.updateMany(filter, docs, options)
    const results = await this.model.find({ id: { $in: items.map((o) => o.id) } }, options, options)
    return results
  }

  public async deleteOne(filter: FilterQuery<T>, options?: ServiceOptions): Promise<T | null> {
    const item = await this.model.findOneAndDelete(filter, {
      ...options,
      returnDocument: 'after'
    })
    return item
  }

  public async deleteMany(filter: FilterQuery<T>, options?: ServiceOptions): Promise<T[]> {
    const items = await this.model.find(filter, options, options)
    await this.model.deleteMany(filter, options)
    return items
  }
}

export default BaseService
