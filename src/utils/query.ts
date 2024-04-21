import { Request } from 'express'

export function retrieveQuery(request: Request) {
  const query = request.query
  query.account = request.account?.id
  query.role = request.account?.role ?? 'guest'
  return query
}
