# @vafast/logger

基于 [Pino](https://getpino.io/) 的日志工厂：`createLogger` / `createLoggerSet` / `logError`。

> **不是 HTTP 中间件。** 没有 `logger()`、不会自动记访问日志。HTTP 请求日志请用 [`@vafast/request-logger`](https://www.npmjs.com/package/@vafast/request-logger)。

## 安装

```bash
npm install @vafast/logger
```

开发美化输出使用 `pino-pretty`（本包已依赖；也可在项目中显式安装）：

```bash
npm install -D pino-pretty
```

## 快速开始

```typescript
import { createLogger } from '@vafast/logger'

export const logger = createLogger({ name: 'my-app' })

logger.info('Server started')
logger.error({ err, module: 'db' }, 'Query failed')
```

## 用法

### 模块化 Logger

```typescript
import { createLoggerSet } from '@vafast/logger'

const loggers = createLoggerSet({ name: 'my-app' })

loggers.db.info('Query')     // { module: 'db' }
loggers.auth.info('Login')   // { module: 'auth' }
```

集合：`app` / `route` / `db` / `middleware` / `auth` / `external`。

### 结构化错误

```typescript
import { createLogger, logError } from '@vafast/logger'

const logger = createLogger({ name: 'my-app' })

try {
  await doWork()
} catch (error) {
  if (error instanceof Error) {
    logError(logger, error, 'doWork failed', { userId: 'u_1' })
  }
}
```

## API 完整参数

### `createLogger(config?)` / `createLoggerSet(config?)`

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `name` | `string` | — | 应用名 |
| `level` | Pino level | `'info'` | 非生产级别 |
| `production` | `boolean` | `NODE_ENV === 'production'` | 生产固定 `info` 且关闭 pretty |
| `pretty` | `boolean` | `true` | 非生产启用 `pino-pretty` |
| `pinoOptions` | `LoggerOptions` | `{}` | 透传 Pino |

### `logError(logger, error, message?, context?)`

将 `error.message` / `name` / `stack` 写入 `err` 字段后调用 `logger.error`。

### 再导出

`pino`、`Logger`、`LoggerOptions`。

## 最佳实践

- 应用内单例 `createLogger`，按路径复用
- HTTP 访问日志交给 `@vafast/request-logger`
- 需要按模块过滤时用 `createLoggerSet` 或手动 `{ module }`
- 生产使用 JSON 行日志（关闭 pretty）

## 注意事项

- **仅**工厂函数，不是 `app.use` 中间件
- 不存在 `logRequest` API
- `production: true` 会忽略自定义 `level`（固定 `info`）
- 不感知 `requestId`；需自行写入日志字段

## 相关链接

- 文档：[`docs/middleware/logger.md`](../vafast-doc/docs/middleware/logger.md)
- [@vafast/request-logger](https://www.npmjs.com/package/@vafast/request-logger)
- [@vafast/request-id](https://www.npmjs.com/package/@vafast/request-id)

## License

MIT
