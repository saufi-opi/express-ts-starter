import { Request, Response, NextFunction } from 'express'
import { MultipleItemResponse, SingleItemResponse } from '../../interfaces/response.interface'
import { Account, AccountRole } from './account.model'
import AccountService from './account.service'
import { withTransaction } from '../../utils/database'
import databaseNames from '../../databases/database.names'
import { AccountModel } from './account.model'
import { FLAGS } from '../../permissions/permissions.flags'
import { retrieveQuery } from '../../utils/query'
import { validateAction } from '../../permissions/permission.helper'
import { PermissionClaimService } from '../../permissions/permission.service'
import { PermissionClaimModel, PermissionClaimnOwnerType } from '../../permissions/permission.model'

export class AccountController {
  private accountService = new AccountService(AccountModel, { dbName: databaseNames.account })
  private permissionClaimService = new PermissionClaimService(PermissionClaimModel, { dbName: databaseNames.system.claim })

  public getAccounts = async (request: Request, response: Response<MultipleItemResponse<Account>>, next: NextFunction) => {
    const options = retrieveQuery(request)
    try {
      const items = await this.accountService.search(options)
      response.status(200).json({ success: true, counts: items.length, items })
    } catch (error) {
      next(error)
    }
  }

  public createAccount = async (request: Request, response: Response<SingleItemResponse<Account>>, next: NextFunction) => {
    try {
      const item = await withTransaction(async (session) => {
        const item = await this.accountService.insertOne(request.body, { session, projection: '-password' })
        return item
      })

      await request.permissionClaimBuilder
        .setResource(databaseNames.account)
        .setResourceRef(item.id)
        .grantAccount(item.id, FLAGS.READ | FLAGS.UPDATE | FLAGS.DELETE)
        .grantRole(AccountRole.ADMIN, FLAGS.READ | FLAGS.UPDATE | FLAGS.DELETE)
        .grantRole(AccountRole.USER, FLAGS.READ)
        .grantRole(AccountRole.GUEST, FLAGS.READ)
        .execute()

      response.status(201).json({ success: true, item })
    } catch (error) {
      next(error)
    }
  }

  public updateAccount = async (request: Request, response: Response<SingleItemResponse<Account>>, next: NextFunction) => {
    try {
      await validateAction({ request, resource: this.accountService.dbName, resourceRef: request.params.id, flag: FLAGS.UPDATE })
      const item = await withTransaction(async (session) => {
        const item = await this.accountService.updateOne({ id: request.params.id }, request.body, { session, projection: '-password' })
        if (!item) throw this.accountService.error(404, 'id-not-exist')
        return item
      })

      response.status(200).json({ success: true, item })
    } catch (error) {
      next(error)
    }
  }

  public deleteAccount = async (request: Request, response: Response<SingleItemResponse<Account>>, next: NextFunction) => {
    try {
      await validateAction({ request, resource: this.accountService.dbName, resourceRef: request.params.id, flag: FLAGS.DELETE })
      const item = await withTransaction(async (session) => {
        const item = await this.accountService.deleteOne({ id: request.params.id }, { session, projection: '-password' })
        if (!item) throw this.accountService.error(404, 'id-not-exist')

        // remove the claim of this account
        await this.permissionClaimService.deleteMany({ resource: this.accountService.dbName, resourceRef: request.params.id }, { session })
        // remove permission for other claims of this account
        await this.permissionClaimService.updateMany(
          {
            'items.ownerType': PermissionClaimnOwnerType.ACCOUNT,
            'items.ownerRef': request.params.id
          },
          {
            $pull: {
              items: {
                ownerType: PermissionClaimnOwnerType.ACCOUNT,
                ownerRef: request.params.id
              }
            }
          },
          { session }
        )

        return item
      })

      response.status(200).json({ success: true, item })
    } catch (error) {
      next(error)
    }
  }
}
