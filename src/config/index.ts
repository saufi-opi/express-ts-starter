import dotenv from "dotenv"
dotenv.config()

const defaults = {
  PORT: 3000,
  MONGODB_URL: "mongodb://localhost:27017",
  MONGODB_DB_NAME: "default",
  SMTP_CONNECTION_STRING: "smtp://127.0.0.1:25",
  SMTP_SENDER: "NoReply <noreply@localhost>",
  JWT_SECRET: "jwt-secret",
}
let config = {
  PORT: +process.env.PORT ?? defaults.PORT,
  MONGODB_URL: process.env.MONGODB_URL ?? defaults.MONGODB_URL,
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME ?? defaults.MONGODB_DB_NAME,
  SMTP_CONNECTION_STRING: process.env.SMTP_CONNECTION_STRING ?? defaults.SMTP_CONNECTION_STRING,
  SMTP_SENDER: process.env.SMTP_SENDER ?? defaults.SMTP_SENDER,
  JWT_SECRET: process.env.JWT_SECRET ?? defaults.JWT_SECRET,
}

export const {
  PORT,
  MONGODB_URL,
  MONGODB_DB_NAME,
  JWT_SECRET,
  SMTP_CONNECTION_STRING,
  SMTP_SENDER,
} = config
