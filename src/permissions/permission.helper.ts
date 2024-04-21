import { createErrorFactory } from '../utils/error'
import { PermissionClaimModel, PermissionClaimnOwnerType } from './permission.model'
import { Request } from 'express'

interface ValidateActionOptions {
  request: Request
  resource: string
  resourceRef: string
  flag: number
}

export async function validateAction(options: ValidateActionOptions) {
  const { request, resource, resourceRef, flag } = options
  const claim = await PermissionClaimModel.findOne({ resource, resourceRef })
  let hasPermission = false
  if (claim) {
    for (const item of claim.items) {
      if (item.ownerType === PermissionClaimnOwnerType.ROLE && item.ownerRef === request.role && (item.flag & flag) === flag) {
        hasPermission = true
        break
      }
      if (item.ownerType === PermissionClaimnOwnerType.ACCOUNT && item.ownerRef === request.account?.id && (item.flag & flag) === flag) {
        hasPermission = true
        break
      }
    }
  }
  if (!hasPermission) {
    const createError = createErrorFactory(resource)
    throw createError(403, 'no-permission')
  }
}
