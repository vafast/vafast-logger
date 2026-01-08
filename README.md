# @vafast/logger

High-performance logging plugin for Vafast framework based on [Pino](https://github.com/pinojs/pino).

## Features

- 🚀 High performance (Pino is the fastest Node.js logger)
- 📦 Zero configuration for quick start
- 🎨 Pretty output in development
- 📊 JSON output in production (ready for log aggregation)
- 🔧 Child loggers for different modules
- 📝 TypeScript support

## Installation

```bash
npm install @vafast/logger
# or
npm install @vafast/logger
```

## Quick Start

```typescript
import { createLogger } from '@vafast/logger'

const logger = createLogger({
  name: 'my-app',
  production: process.env.NODE_ENV === 'production'
})

logger.info('Server started')
logger.error({ err }, 'Request failed')
logger.debug({ userId: 123 }, 'User logged in')
```

## Logger Set (Recommended)

For larger applications, use `createLoggerSet` to get pre-configured child loggers:

```typescript
import { createLoggerSet } from '@vafast/logger'

const loggers = createLoggerSet({
  name: 'ones-server',
  production: process.env.NODE_ENV === 'production'
})

// Different loggers for different concerns
loggers.app.info('Server started')
loggers.db.debug('Query executed')
loggers.route.info('GET /api/users 200 15ms')
loggers.auth.warn('Invalid token')
loggers.middleware.debug('CORS check passed')
loggers.external.info('AI API called')
```

## Configuration

```typescript
interface VafastLoggerConfig {
  /** Log level @default 'info' */
  level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent'
  /** Is production environment @default false */
  production?: boolean
  /** Application name */
  name?: string
  /** Custom pino options */
  pinoOptions?: LoggerOptions
  /** Enable pretty output in dev @default true */
  pretty?: boolean
  /** Pretty output options */
  prettyOptions?: {
    colorize?: boolean
    translateTime?: string
    ignore?: string
  }
}
```

## Output Examples

### Development (Pretty)

```
[10:30:45] INFO (my-app): Server started
[10:30:46] DEBUG (my-app/db): Query executed
    query: "SELECT * FROM users"
[10:30:47] ERROR (my-app): Request failed
    err: {
      message: "Connection refused"
      stack: "..."
    }
```

### Production (JSON)

```json
{"level":30,"time":1704355845000,"name":"my-app","msg":"Server started"}
{"level":20,"time":1704355846000,"name":"my-app","module":"db","query":"SELECT * FROM users","msg":"Query executed"}
```

## Utility Functions

```typescript
import { logError, logRequest } from '@vafast/logger'

// Log errors with stack trace
try {
  // ...
} catch (err) {
  logError(logger, err, 'Operation failed', { userId: 123 })
}

// Log HTTP requests
logRequest(logger, 'GET', '/api/users', 200, 15, { userId: 123 })
```

## License

MIT

