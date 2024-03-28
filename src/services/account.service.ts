import { Account } from '../interfaces/account.interface'
import { AccountModel } from '../models/account.model'

export class AccountService {
  public async search() {
    // const items = await AccountModel.aggregate([])
    const items = await AccountModel.find({})
    return items
  }

  public async counts() {}

  public async insertOne(docs: Partial<Account>): Promise<Account> {
    const item = new AccountModel(docs).save()
    return item
  }

  public async findOne (filter: Record<string, unknown>): Promise<Account> {
    const item = await AccountModel.findOne(filter)
    return item
  }
  
  // TODO: finish up
  public async updateOne (filter: Record<string, unknown>) {
    const item = await AccountModel.updateOne(filter)
    return null
  }
}

export default AccountService
