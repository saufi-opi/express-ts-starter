import { randomUUID } from 'crypto'
import mongoose, { ClientSession } from 'mongoose'

export function appendDoc(docs: any) {
  docs.id = randomUUID()
  return docs
}

export async function withTransaction<T>(callback: (session: ClientSession) => Promise<T>) {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const item = await callback(session)
    await session.commitTransaction()
    return item
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}
