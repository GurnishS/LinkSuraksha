import AuthLogger from "./auth-logger.js";
import TransactionLogger from "./transaction-logger.js";
import BaseLogger from "./base-logger.js";
import { httpLogger, loggers } from "./config.js";

// Create singleton instances
const authLogger = new AuthLogger();
const transactionLogger = new TransactionLogger();

export {
  AuthLogger,
  TransactionLogger,
  BaseLogger,
  authLogger,
  transactionLogger,
  httpLogger,
  loggers,
};
