/**
 * @vafast/logger - High-performance logging plugin for Vafast
 * 
 * 零配置使用，通过环境变量配置：
 * - VAFAST_APP_NAME: 应用名称（默认 'app'）
 * - NODE_ENV: 'production' 时使用生产模式
 */
import pino from 'pino'
import type { Logger, LoggerOptions } from 'pino'

// ============ Types ============

export interface VafastLoggerConfig {
  level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent'
  production?: boolean
  name?: string
  pinoOptions?: LoggerOptions
  pretty?: boolean
  prettyOptions?: {
    colorize?: boolean
    translateTime?: string
    ignore?: string
  }
}

export interface LogContext {
  [key: string]: unknown
}

export interface LoggerSet {
  app: Logger
  route: Logger
  db: Logger
  middleware: Logger
  auth: Logger
  external: Logger
}

// ============ Logger Factory ============

function createLogger(config: VafastLoggerConfig = {}): Logger {
  const {
    level = 'info',
    production = false,
    name,
    pinoOptions = {},
    pretty = true,
    prettyOptions = {}
  } = config

  const options: LoggerOptions = {
    level: production ? 'info' : level,
    ...(name && { name }),
    ...pinoOptions,
  }

  if (!production && pretty) {
    options.transport = {
      target: 'pino-pretty',
      options: {
        colorize: prettyOptions.colorize ?? true,
        translateTime: prettyOptions.translateTime ?? 'SYS:standard',
        ignore: prettyOptions.ignore ?? 'pid,hostname',
      }
    }
  }

  return pino(options)
}

function createChildLogger(parent: Logger, module: string): Logger {
  return parent.child({ module })
}

export function createLoggerSet(config: VafastLoggerConfig = {}): LoggerSet {
  const app = createLogger(config)
  return {
    app,
    route: createChildLogger(app, 'route'),
    db: createChildLogger(app, 'db'),
    middleware: createChildLogger(app, 'middleware'),
    auth: createChildLogger(app, 'auth'),
    external: createChildLogger(app, 'external'),
  }
}

// ============ 默认全局 Logger（零配置） ============

// 从环境变量自动配置
const defaultLoggers = createLoggerSet({
  name: process.env.VAFAST_APP_NAME || 'app',
  production: process.env.NODE_ENV === 'production',
})

// 直接导出，无需初始化
export const appLogger = defaultLoggers.app
export const routeLogger = defaultLoggers.route
export const dbLogger = defaultLoggers.db
export const middlewareLogger = defaultLoggers.middleware
export const authLogger = defaultLoggers.auth
export const externalLogger = defaultLoggers.external

// ============ Utility ============

export function logError(
  logger: Logger,
  error: Error,
  message?: string,
  context?: LogContext
): void {
  logger.error({
    err: {
      message: error.message,
      name: error.name,
      stack: error.stack,
    },
    ...context,
  }, message ?? error.message)
}

// ============ Re-exports ============

export { pino, createLogger, createChildLogger }
export type { Logger, LoggerOptions } from 'pino'
export default createLogger
