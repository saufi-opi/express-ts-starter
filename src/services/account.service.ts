import { FilterQuery } from 'mongoose'
import { Account } from '../interfaces/account.interface'
import { createHash } from 'crypto'
import BaseService, { ServiceOptions } from '../base/service.base'

export class AccountService extends BaseService<Account> {
  // TODO: use aggregate for find the docs using query passed
  public async search(): Promise<Account[]> {
    const items = await this.model.find({}, { password: false })
    return items
  }

  public async insertOne(docs: Partial<Account>, options?: ServiceOptions): Promise<Account | null> {
    docs.password = this.hashedPassword(docs.password)
    const exist = await this.findOne({ email: docs.email }, options)
    if (exist) throw this.error(400, 'duplicate-email')

    const item = await super.insertOne(docs, this.appendOptions(options))
    return item
  }

  public async findOne(filter: FilterQuery<Account>, options?: ServiceOptions): Promise<Account | null> {
    const item = await super.findOne(filter, this.appendOptions(options))
    return item
  }

  public async updateOne(filter: FilterQuery<Account>, docs: Partial<Account>, options?: ServiceOptions): Promise<Account | null> {
    if (docs.password) {
      docs.password = this.hashedPassword(docs.password)
    }

    const item = await super.updateOne(filter, docs, this.appendOptions(options))
    return item
  }

  public async updateMany(filter: FilterQuery<Account>, docs: Partial<Account>, options?: ServiceOptions): Promise<Account[]> {
    if (docs.password) {
      docs.password = this.hashedPassword(docs.password)
    }

    const items = await super.deleteMany(filter, this.appendOptions(options))
    return items
  }

  public async deleteOne(filter: FilterQuery<Account>, options?: ServiceOptions): Promise<Account | null> {
    const item = await super.deleteOne(filter, this.appendOptions(options))
    return item
  }

  public async deleteMany(filter: FilterQuery<Account>, options?: ServiceOptions): Promise<Account[]> {
    const items = await super.deleteMany(filter, this.appendOptions(options))
    return items
  }

  hashedPassword(password: string, salt = 'default-salt') {
    const hash = createHash('sha256')
    hash.update(password + salt)
    return hash.digest('hex')
  }

  appendOptions(options: ServiceOptions) {
    options.projection = { password: false }
    return options
  }
}

export default AccountService
