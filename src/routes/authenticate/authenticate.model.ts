import { Schema, model } from 'mongoose'
import databaseNames from '../../databases/database.names'

export interface Authenticate {
  id: string
  token: string
  account: string
  exp: Date
}

const AuthenticateSchema = new Schema<Authenticate>(
  {
    id: {
      _id: true,
      type: String,
      required: true,
      unique: true,
      index: true
    },
    token: {
      type: String,
      required: true
    },
    account: {
      type: String,
      required: true
    },
    exp: {
      type: Date,
      required: true,
      expires: 0
    }
  },
  { timestamps: true, collection: databaseNames.authenticate }
)

export const AuthenticateModel = model(databaseNames.authenticate, AuthenticateSchema)
