import { Request } from 'express'
import { AccountRole } from '../routes/account/account.model'

export function retrieveQuery(request: Request) {
  const query = request.query
  query.account = request.account?.id
  query.role = request.account?.role ?? AccountRole.GUEST
  return query
}
