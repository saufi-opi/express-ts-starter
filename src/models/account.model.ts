import { Schema, model } from 'mongoose'
import databaseNames from '../databases/database.names'

export interface Account {
  id: string
  email: string
  password: string
}

const AccountSchema = new Schema<Account>(
  {
    id: {
      _id: true,
      type: String,
      required: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true, collection: databaseNames.account }
)

export const AccountModel = model(databaseNames.account, AccountSchema)
