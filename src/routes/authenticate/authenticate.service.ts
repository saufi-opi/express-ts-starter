import BaseService from '../../base/service.base'
import databaseNames from '../../databases/database.names'
import { Authenticate, AuthenticateModel } from './authenticate.model'

class AuthenticateService extends BaseService<Authenticate> {}

export default new AuthenticateService(AuthenticateModel, { dbName: databaseNames.authenticate })
