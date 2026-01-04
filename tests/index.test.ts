import { describe, it, expect } from 'vitest'
import { createLogger, createLoggerSet, logError } from '../src/index'

describe('@vafast/logger', () => {
  describe('createLogger', () => {
    it('should create a logger instance', () => {
      const logger = createLogger({ name: 'test', pretty: false })
      expect(logger).toBeDefined()
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.error).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.debug).toBe('function')
    })

    it('should create logger with custom level', () => {
      const logger = createLogger({ level: 'debug', pretty: false })
      expect(logger.level).toBe('debug')
    })

    it('should use info level in production', () => {
      const logger = createLogger({ production: true, level: 'debug', pretty: false })
      expect(logger.level).toBe('info')
    })
  })

  describe('createLoggerSet', () => {
    it('should create a set of loggers', () => {
      const loggers = createLoggerSet({ name: 'test-app', pretty: false })
      
      expect(loggers.app).toBeDefined()
      expect(loggers.route).toBeDefined()
      expect(loggers.db).toBeDefined()
      expect(loggers.middleware).toBeDefined()
      expect(loggers.auth).toBeDefined()
      expect(loggers.external).toBeDefined()
    })

    it('should create child loggers with module bindings', () => {
      const loggers = createLoggerSet({ name: 'test-app', pretty: false })
      
      // Child loggers should have module binding
      expect(loggers.route.bindings()).toHaveProperty('module', 'route')
      expect(loggers.db.bindings()).toHaveProperty('module', 'db')
      expect(loggers.middleware.bindings()).toHaveProperty('module', 'middleware')
      expect(loggers.auth.bindings()).toHaveProperty('module', 'auth')
      expect(loggers.external.bindings()).toHaveProperty('module', 'external')
    })
  })

  describe('logError', () => {
    it('should log error with structured format', () => {
      const logger = createLogger({ name: 'test', pretty: false })
      const error = new Error('Test error')
      
      // Should not throw
      expect(() => logError(logger, error)).not.toThrow()
      expect(() => logError(logger, error, 'Custom message')).not.toThrow()
      expect(() => logError(logger, error, 'With context', { userId: '123' })).not.toThrow()
    })
  })
})

