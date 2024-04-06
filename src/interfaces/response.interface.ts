export type Resources = Record<string, unknown>

export type ItemWithResources<T> = T & { resources?: Resources }

export interface SingleItemResponse<T> {
  success: boolean
  item: T
  resources?: Resources
}

export interface MultipleItemResponse<T> {
  success: boolean
  items: ItemWithResources<T>[]
  counts: number
}

export interface ErrorResponse {
  statusCode: number
  success: boolean
  message: string
}
