/**
 * @vafast/logger - High-performance logging plugin for Vafast
 * 
 * Based on Pino for maximum performance
 */
import pino from 'pino'
import type { Logger, LoggerOptions } from 'pino'

// ============ Types ============

export interface VafastLoggerConfig {
  /** 日志级别 @default 'info' */
  level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent'
  /** 是否为生产环境 @default false */
  production?: boolean
  /** 应用名称，会添加到每条日志 */
  name?: string
  /** 自定义 pino 配置 */
  pinoOptions?: LoggerOptions
  /** 是否启用美化输出（开发环境） @default true */
  pretty?: boolean
  /** 美化输出配置 */
  prettyOptions?: {
    colorize?: boolean
    translateTime?: string
    ignore?: string
  }
}

export interface LogContext {
  [key: string]: unknown
}

// ============ Logger Factory ============

/**
 * 创建 Vafast Logger 实例
 * 
 * @example
 * ```typescript
 * import { createLogger } from '@vafast/logger'
 * 
 * const logger = createLogger({
 *   name: 'my-app',
 *   level: 'debug',
 *   production: process.env.NODE_ENV === 'production'
 * })
 * 
 * logger.info('Server started')
 * logger.error({ err }, 'Request failed')
 * ```
 */
export function createLogger(config: VafastLoggerConfig = {}): Logger {
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

  // 开发环境启用美化输出
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

// ============ Child Logger Factory ============

/**
 * 创建子 Logger（带模块标识）
 * 
 * @example
 * ```typescript
 * const logger = createLogger({ name: 'my-app' })
 * const dbLogger = createChildLogger(logger, 'database')
 * const authLogger = createChildLogger(logger, 'auth')
 * 
 * dbLogger.info('Connected')  // [my-app] [database] Connected
 * authLogger.warn('Token expired')  // [my-app] [auth] Token expired
 * ```
 */
export function createChildLogger(parent: Logger, module: string): Logger {
  return parent.child({ module })
}

// ============ Utility Functions ============

/**
 * 记录错误日志（结构化）
 */
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

/**
 * 记录请求日志
 */
export function logRequest(
  logger: Logger,
  method: string,
  path: string,
  status: number,
  duration: number,
  context?: LogContext
): void {
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
  logger[level]({
    method,
    path,
    status,
    duration,
    ...context,
  }, `${method} ${path} ${status} ${duration}ms`)
}

// ============ Pre-configured Loggers ============

/**
 * 预配置的 Logger 模块
 * 
 * @example
 * ```typescript
 * import { createLoggerSet } from '@vafast/logger'
 * 
 * const loggers = createLoggerSet({
 *   name: 'ones-server',
 *   production: process.env.NODE_ENV === 'production'
 * })
 * 
 * loggers.app.info('Server started')
 * loggers.db.debug('Query executed')
 * loggers.route.info('GET /api/users')
 * ```
 */
export interface LoggerSet {
  /** 主应用日志 */
  app: Logger
  /** 路由请求日志 */
  route: Logger
  /** 数据库操作日志 */
  db: Logger
  /** 中间件日志 */
  middleware: Logger
  /** 认证日志 */
  auth: Logger
  /** 外部服务日志（AI、第三方 API 等） */
  external: Logger
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

// ============ Re-exports ============

export { pino }
export type { Logger, LoggerOptions } from 'pino'

// Default export
export default createLogger

