import dotenv from 'dotenv'
dotenv.config()

const defaults = {
  PORT: 3000,
  MONGODB_URL: 'mongodb://localhost:27017',
  MONGODB_DB_NAME: 'default',
  SMTP_CONNECTION_STRING: 'smtp://127.0.0.1:25',
  SMTP_SENDER: 'NoReply <noreply@localhost>',
  JWT_SECRET: 'jwt-secret',
  REFRESH_TOKEN_EXP: '3d',
  ACCESS_TOKEN_EXP: '5m'
}
let config: typeof defaults = {
  PORT: +process.env.PORT ?? defaults.PORT,
  MONGODB_URL: process.env.MONGODB_URL ?? defaults.MONGODB_URL,
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME ?? defaults.MONGODB_DB_NAME,
  SMTP_CONNECTION_STRING: process.env.SMTP_CONNECTION_STRING ?? defaults.SMTP_CONNECTION_STRING,
  SMTP_SENDER: process.env.SMTP_SENDER ?? defaults.SMTP_SENDER,
  JWT_SECRET: process.env.JWT_SECRET ?? defaults.JWT_SECRET,
  REFRESH_TOKEN_EXP: process.env.JWT_SECRET ?? defaults.REFRESH_TOKEN_EXP,
  ACCESS_TOKEN_EXP: process.env.JWT_SECRET ?? defaults.ACCESS_TOKEN_EXP
}

export const { PORT, MONGODB_URL, MONGODB_DB_NAME, JWT_SECRET, SMTP_CONNECTION_STRING, SMTP_SENDER, REFRESH_TOKEN_EXP, ACCESS_TOKEN_EXP } = config
