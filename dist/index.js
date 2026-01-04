// src/index.ts
import pino from "pino";
function createLogger(config = {}) {
  const {
    level = "info",
    production = false,
    name,
    pinoOptions = {},
    pretty = true,
    prettyOptions = {}
  } = config;
  const options = {
    level: production ? "info" : level,
    ...name && { name },
    ...pinoOptions
  };
  if (!production && pretty) {
    options.transport = {
      target: "pino-pretty",
      options: {
        colorize: prettyOptions.colorize ?? true,
        translateTime: prettyOptions.translateTime ?? "SYS:standard",
        ignore: prettyOptions.ignore ?? "pid,hostname"
      }
    };
  }
  return pino(options);
}
function createChildLogger(parent, module) {
  return parent.child({ module });
}
function logError(logger, error, message, context) {
  logger.error({
    err: {
      message: error.message,
      name: error.name,
      stack: error.stack
    },
    ...context
  }, message ?? error.message);
}
function logRequest(logger, method, path, status, duration, context) {
  const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
  logger[level]({
    method,
    path,
    status,
    duration,
    ...context
  }, `${method} ${path} ${status} ${duration}ms`);
}
function createLoggerSet(config = {}) {
  const app = createLogger(config);
  return {
    app,
    route: createChildLogger(app, "route"),
    db: createChildLogger(app, "db"),
    middleware: createChildLogger(app, "middleware"),
    auth: createChildLogger(app, "auth"),
    external: createChildLogger(app, "external")
  };
}
var index_default = createLogger;
export {
  createChildLogger,
  createLogger,
  createLoggerSet,
  index_default as default,
  logError,
  logRequest,
  pino
};
//# sourceMappingURL=index.js.map