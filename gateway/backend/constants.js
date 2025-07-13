export const DB_NAME = "LinkSuraksha";

import dotenv from "dotenv";
import os from "os";

dotenv.config();

const config = {
  MODE: process.env.MODE,
  //   CORS_ORIGIN: replaceLocalhost(process.env.CORS_ORIGIN),
  BANK_BACKEND_URL: process.env.BANK_BACKEND_URL,
  BANK_FRONTEND_URL: process.env.BANK_FRONTEND_URL,
  GATEWAY_FRONTEND_URL: process.env.GATEWAY_FRONTEND_URL,
};

console.log("Configuration:", config);

export default config;
