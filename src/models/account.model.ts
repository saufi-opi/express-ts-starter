import { Schema, model } from "mongoose"
import { Account } from "../interfaces/user.interface"
import databaseNames from "../databases/database.names"

const AccountSchema = new Schema<Account>(
  {
    id: {
      _id: true,
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

export const AccountModel = model(databaseNames.account, AccountSchema)
