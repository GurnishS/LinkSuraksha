import pino from "pino";
import path from "path";
import pinoHttp from "pino-http";

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function getLogFilePath(type = "transaction") {
  const today = getTodayString();
  return path.join("logs", `${type}-${today}.log`);
}

const baseConfig = {
  level: "info",
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
};

const loggers = {
  transaction: pino(
    baseConfig,
    pino.destination({
      dest: getLogFilePath("transaction"),
      mkdir: true,
      sync: false,
    })
  ),

  auth: pino(
    baseConfig,
    pino.destination({
      dest: getLogFilePath("auth"),
      mkdir: true,
      sync: false,
    })
  ),

  http: pino(
    baseConfig,
    pino.destination({
      dest: getLogFilePath("http"),
      mkdir: true,
      sync: false,
    })
  ),
};

//HTTP logger middleware config
const httpLoggerConfig = {
  logger: loggers.http,

  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) return "warn";
    if (res.statusCode >= 500 || err) return "error";

    return "info";
  },

  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} - ${res.statusCode}`;
  },

  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`;
  },

  //request serializers
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      hostname: req.hostname,
      remoteAddress: req.ip,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },

  logAttributeKeys: {
    req: "request",
    res: "response",
    err: "error",
    responseTime: "responseTime",
  },
};

const httpLogger = pinoHttp(httpLoggerConfig);
export { loggers, httpLogger, getTodayString, getLogFilePath };
