/**
 * @vafast/logger - 基于 Pino 的高性能日志插件
 * 
 * 推荐使用方式：
 * 
 * 1. 创建配置文件 src/utils/logger.ts：
 *    import { createLogger } from '@vafast/logger'
 *    export const logger = createLogger({ name: 'my-app' })
 * 
 * 2. 任何地方使用：
 *    import { logger } from '~/utils/logger'
 *    logger.info('hello')
 * 
 * 高级用法（需要模块化日志时）：
 *    import { createLoggerSet } from '@vafast/logger'
 *    export const loggers = createLoggerSet({ name: 'my-app' })
 *    // 使用 loggers.app, loggers.db 等（自动带 module 字段）
 */
import pino from 'pino'
import type { Logger, LoggerOptions } from 'pino'

// ============ Types ============

export interface LoggerConfig {
  /** 应用名称 */
  name?: string
  /** 日志级别 @default 'info' */
  level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent'
  /** 是否为生产环境（影响格式化） @default process.env.NODE_ENV === 'production' */
  production?: boolean
  /** 是否启用美化输出 @default true */
  pretty?: boolean
  /** 自定义 Pino 配置 */
  pinoOptions?: LoggerOptions
}

export interface LoggerSet {
  app: Logger
  route: Logger
  db: Logger
  middleware: Logger
  auth: Logger
  external: Logger
}

// ============ Factory Functions ============

/**
 * 创建单个 Logger 实例（推荐）
 * 
 * 简单直接，适合大多数场景。
 * 需要模块区分时，可在日志数据中添加 module 字段。
 * 
 * @example
 * ```typescript
 * const logger = createLogger({ name: 'my-app' })
 * logger.info('Server started')
 * logger.error({ err, module: 'db' }, 'Query failed')
 * ```
 */
export function createLogger(config: LoggerConfig = {}): Logger {
  const {
    name,
    level = 'info',
    production = process.env.NODE_ENV === 'production',
    pretty = true,
    pinoOptions = {},
  } = config

  const options: LoggerOptions = {
    level: production ? 'info' : level,
    ...(name && { name }),
    ...pinoOptions,
  }

  // 非生产环境启用美化输出
  if (!production && pretty) {
    options.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      }
    }
  }

  return pino(options)
}

/**
 * 创建预配置的 Logger 集合（高级功能）
 * 
 * 为不同模块创建子 logger，每个自动绑定 module 字段。
 * 适合需要按模块过滤日志的大型应用。
 * 
 * @example
 * ```typescript
 * const loggers = createLoggerSet({ name: 'my-app' })
 * loggers.db.info('Query')  // 自动包含 { module: 'db' }
 * loggers.auth.info('Login') // 自动包含 { module: 'auth' }
 * ```
 */
export function createLoggerSet(config: LoggerConfig = {}): LoggerSet {
  const app = createLogger(config)
  return {
    app,
    route: app.child({ module: 'route' }),
    db: app.child({ module: 'db' }),
    middleware: app.child({ module: 'middleware' }),
    auth: app.child({ module: 'auth' }),
    external: app.child({ module: 'external' }),
  }
}

// ============ Utilities ============

/**
 * 记录错误（结构化格式）
 */
export function logError(
  logger: Logger,
  error: Error,
  message?: string,
  context?: Record<string, unknown>
): void {
  logger.error({
    err: { message: error.message, name: error.name, stack: error.stack },
    ...context,
  }, message ?? error.message)
}

// ============ Re-exports ============

export { pino }
export type { Logger, LoggerOptions } from 'pino'
