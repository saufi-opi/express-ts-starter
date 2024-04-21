import { Schema, model } from 'mongoose'
import databaseNames from '../../databases/database.names'

export interface Account {
  id: string
  email: string
  password: string
  role: string
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
    },
    role: {
      type: String,
      required: true,
      default: 'user'
    }
  },
  { timestamps: true, collection: databaseNames.account }
)

export const AccountModel = model(databaseNames.account, AccountSchema)
