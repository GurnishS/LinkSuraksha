export const DB_NAME = "BankDB";

import dotenv from "dotenv";
import os from "os";

dotenv.config();

const config = {
  MODE: process.env.MODE,
  CORS_ORIGIN: "*",
  GATEWAY_BACKEND_URL: process.env.GATEWAY_BACKEND_URL,
  GATEWAY_FRONTEND_URL: process.env.GATEWAY_FRONTEND_URL,
};

console.log("Configuration:", config);

export default config;
