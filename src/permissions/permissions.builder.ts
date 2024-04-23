import { AnyBulkWriteOperation, Model, MongooseBulkWriteOptions } from 'mongoose'
import { createError } from '../utils/error'
import { randomUUID } from 'crypto'
import { PermissionClaim, PermissionClaimnOwnerType } from './permission.model'
import PermissionClaimService from './permission.service'

class PermissionClaimBuilder {
  operations: Array<AnyBulkWriteOperation<PermissionClaim>>
  resource: string
  resourceRef: string
  model: Model<PermissionClaim>

  constructor() {
    this.operations = []
    this.model = PermissionClaimService.model
  }

  setResource(resource: string): this {
    this.resource = resource
    return this
  }

  setResourceRef(resourceRef: string): this {
    this.resourceRef = resourceRef
    return this
  }

  grantAccount(account: string, flag: number): this {
    if (!this.resource) throw createError(400, 'missing-resource')
    if (!this.resourceRef) throw createError(400, 'missing-resource-ref')
    if (!account) return this

    const currentDate = new Date() as never as string
    this.operations.push({
      updateOne: {
        filter: { resource: this.resource, resourceRef: this.resourceRef },
        update: {
          $set: {
            id: randomUUID(),
            resource: this.resource,
            resourceRef: this.resourceRef,
            createdAt: currentDate,
            updatedAt: currentDate
          },
          $addToSet: {
            items: {
              ownerType: PermissionClaimnOwnerType.ACCOUNT,
              ownerRef: account,
              flag
            }
          }
        },
        upsert: true
      }
    })
    return this
  }

  grantRole(role: string, flag: number): this {
    if (!this.resource) throw createError(400, 'missing-resource')
    if (!this.resourceRef) throw createError(400, 'missing-resource-ref')
    if (!role) return this

    const currentDate = new Date() as never as string
    // we use upsert for account claim
    this.operations.push({
      updateOne: {
        filter: { resource: this.resource, resourceRef: this.resourceRef },
        update: {
          $set: {
            id: randomUUID(),
            resource: this.resource,
            resourceRef: this.resourceRef,
            createdAt: currentDate,
            updatedAt: currentDate
          },
          $addToSet: {
            items: {
              ownerType: PermissionClaimnOwnerType.ROLE,
              ownerRef: role,
              flag
            }
          }
        },
        upsert: true
      }
    })
    return this
  }

  async execute(options?: MongooseBulkWriteOptions): Promise<void> {
    // skip when no operation
    if (this.operations.length === 0) return
    await this.model.bulkWrite(this.operations, options)
  }
}

export default PermissionClaimBuilder
