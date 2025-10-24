import dotenv from "dotenv";

const env = process.env.NODE_ENV || "development";

dotenv.config({ path: `.env.${env}.local` });

export const {
  PORT,
  ARCJET_KEY,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  NODE_ENV,
  DB_URI,
  RESEND_API_KEY,
  RESEND_FROM,
} = process.env;
