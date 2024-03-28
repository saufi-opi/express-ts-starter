export interface SingleItemResponse<T> {
  success: boolean
  item: T
}

export interface MultipleItemResponse<T> {
  success: boolean
  items: T[]
  counts: number
}

export interface ErrorResponse {
  statusCode: number
  success: boolean
  message: string
}
