import { LoggerOptions, Logger } from 'pino';
export { Logger, LoggerOptions, default as pino } from 'pino';

/**
 * @vafast/logger - High-performance logging plugin for Vafast
 *
 * Based on Pino for maximum performance
 */

interface VafastLoggerConfig {
    /** 日志级别 @default 'info' */
    level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent';
    /** 是否为生产环境 @default false */
    production?: boolean;
    /** 应用名称，会添加到每条日志 */
    name?: string;
    /** 自定义 pino 配置 */
    pinoOptions?: LoggerOptions;
    /** 是否启用美化输出（开发环境） @default true */
    pretty?: boolean;
    /** 美化输出配置 */
    prettyOptions?: {
        colorize?: boolean;
        translateTime?: string;
        ignore?: string;
    };
}
interface LogContext {
    [key: string]: unknown;
}
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
declare function createLogger(config?: VafastLoggerConfig): Logger;
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
declare function createChildLogger(parent: Logger, module: string): Logger;
/**
 * 记录错误日志（结构化）
 */
declare function logError(logger: Logger, error: Error, message?: string, context?: LogContext): void;
/**
 * 记录请求日志
 */
declare function logRequest(logger: Logger, method: string, path: string, status: number, duration: number, context?: LogContext): void;
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
interface LoggerSet {
    /** 主应用日志 */
    app: Logger;
    /** 路由请求日志 */
    route: Logger;
    /** 数据库操作日志 */
    db: Logger;
    /** 中间件日志 */
    middleware: Logger;
    /** 认证日志 */
    auth: Logger;
    /** 外部服务日志（AI、第三方 API 等） */
    external: Logger;
}
declare function createLoggerSet(config?: VafastLoggerConfig): LoggerSet;

export { type LogContext, type LoggerSet, type VafastLoggerConfig, createChildLogger, createLogger, createLoggerSet, createLogger as default, logError, logRequest };
