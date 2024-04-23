import BaseService from '../base/service.base'
import databaseNames from '../databases/database.names'
import { PermissionClaim, PermissionClaimModel } from './permission.model'

class PermissionClaimService extends BaseService<PermissionClaim> {}

export default new PermissionClaimService(PermissionClaimModel, { dbName: databaseNames.system.claim })
