import { Schema, model } from 'mongoose'
import databaseNames from '../../databases/database.names'

export enum AccountRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

export interface Account {
  id: string
  email: string
  password: string
  role: Exclude<AccountRole, AccountRole.GUEST>
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
      enum: [AccountRole.ADMIN, AccountRole.USER],
      required: true,
      default: AccountRole.USER
    }
  },
  { timestamps: true, collection: databaseNames.account }
)

export const AccountModel = model(databaseNames.account, AccountSchema)
