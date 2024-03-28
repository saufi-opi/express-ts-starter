export interface SingleResponseBody<T> {
  success: boolean
  item: T
}

export interface MultipleResponseBody<T> {
  success: boolean
  items: T[]
  counts: number
}

export interface ErrorResponse {
  statusCode: number
  success: boolean
  message: string
}
