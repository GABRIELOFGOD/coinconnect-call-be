import { config } from 'dotenv';

config({
  path: `.env.${process.env.NODE_ENV || 'development'}.local`,
});

export const { 
  PORT,
  CLIENT_URL,
  DB_HOST, DB_USER, DB_PASSWORD, DB_NAME,
  JWT_SECRET,
} = process.env;
