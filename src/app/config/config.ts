import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });

export const config = {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  backend_url: process.env.BACKEND_URL,
  DB: process.env.DATABASE_URL,
  origin: process.env.ORIGIN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  access_token_expiration: process.env.ACCESS_TOKEN_EXPIRATION,
  refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
  refresh_token_expiration: process.env.REFRESH_TOKEN_EXPIRATION,
  salt_rounds: process.env.SALT_ROUNDS,
};
