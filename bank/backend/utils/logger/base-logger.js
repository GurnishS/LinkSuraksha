import { loggers } from "./config.js";

class BaseLogger {
  constructor(loggerType = "app") {
    this.logger = loggers[loggerType];
    this.loggerType = loggerType;
  }

  //info level log
  info(data, message) {
    this.logger.info(data, message);
  }

  //error level log
  error(data, message) {
    this.logger.error(data, message);

    if (this.loggerType != "error") {
      loggers.error?.error(data, message);
    }
  }

  warn(data, message) {
    this.logger.warn(data, message);
  }

  debug(data, message) {
    this.logger.debug(data, message);
  }

  log(level, data, message) {
    this.logger[level](data, message);
  }
}

export default BaseLogger;
