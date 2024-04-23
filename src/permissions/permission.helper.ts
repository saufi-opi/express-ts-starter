import { createErrorFactory } from '../utils/error'
import { PermissionClaimnOwnerType } from './permission.model'
import { Request } from 'express'
import PermissionService from './permission.service'

interface ValidateActionOptions {
  request: Request
  resource: string
  resourceRef: string
  flag: number
  message?: string
}

export async function validateAction(options: ValidateActionOptions) {
  const { request, resource, resourceRef, flag, message } = options
  const errorMessage = message ?? 'id-not-exist'
  const claim = await PermissionService.findOne({ resource, resourceRef })
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
    throw createError(403, errorMessage)
  }
}
