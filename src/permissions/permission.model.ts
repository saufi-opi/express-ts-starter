import { Schema, model } from 'mongoose'
import databaseNames from '../databases/database.names'

export enum PermissionClaimnOwnerType {
  ACCOUNT = 'account',
  ROLE = 'role'
}

export interface PermissionClaimItem {
  ownerType: PermissionClaimnOwnerType
  ownerRef: string
  flag: number
}

export interface PermissionClaim {
  id: string
  resource: string
  resourceRef: string
  items: PermissionClaimItem[]
}

const PermissionClaimSchema = new Schema<PermissionClaim>(
  {
    id: {
      _id: true,
      type: String,
      required: true,
      unique: true,
      index: true
    },
    resource: {
      type: String,
      required: true
    },
    resourceRef: {
      type: String,
      required: true
    },
    items: [
      {
        ownerType: {
          type: String,
          enum: [PermissionClaimnOwnerType.ACCOUNT, PermissionClaimnOwnerType.ROLE],
          required: true
        },
        ownerRef: {
          type: String,
          required: true
        },
        flag: {
          type: Number,
          required: true
        },
        _id: false
      }
    ]
  },
  { timestamps: true, collection: databaseNames.system.claim, versionKey: false }
)

export const PermissionClaimModel = model(databaseNames.system.claim, PermissionClaimSchema)
