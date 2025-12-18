import { describe, it, expect, beforeEach } from 'vitest'
import { Logger, LogActions } from '../../../src/utils/logger'

describe('Logger Utility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Log Storage', () => {
    it('should store info logs', () => {
      Logger.info(LogActions.USER_LOGIN, { userId: 1 })
      const logs = Logger.getLogs()
      expect(logs.length).toBeGreaterThan(0)
      expect(logs[0].level).toBe('info')
    })

    it('should store success logs', () => {
      Logger.success(LogActions.USER_REGISTER, { userId: 1 })
      const logs = Logger.getLogs()
      expect(logs.length).toBeGreaterThan(0)
      expect(logs[0].level).toBe('success')
    })

    it('should store warning logs', () => {
      Logger.warning(LogActions.SECURITY_RATE_LIMIT, { action: 'login' })
      const logs = Logger.getLogs()
      expect(logs.length).toBeGreaterThan(0)
      expect(logs[0].level).toBe('warning')
    })

    it('should store error logs', () => {
      Logger.error(LogActions.SECURITY_LOGIN_FAIL, { error: 'Test error' })
      const logs = Logger.getLogs()
      expect(logs.length).toBeGreaterThan(0)
      expect(logs[0].level).toBe('error')
    })
  })

  describe('Log Actions', () => {
    it('should have USER_LOGIN action', () => {
      expect(LogActions.USER_LOGIN).toBeDefined()
      expect(LogActions.USER_LOGIN).toBe('用户登录')
    })

    it('should have USER_LOGOUT action', () => {
      expect(LogActions.USER_LOGOUT).toBeDefined()
      expect(LogActions.USER_LOGOUT).toBe('用户登出')
    })

    it('should have USER_REGISTER action', () => {
      expect(LogActions.USER_REGISTER).toBeDefined()
      expect(LogActions.USER_REGISTER).toBe('用户注册')
    })

    it('should have SECURITY_RATE_LIMIT action', () => {
      expect(LogActions.SECURITY_RATE_LIMIT).toBeDefined()
      expect(LogActions.SECURITY_RATE_LIMIT).toBe('频率限制')
    })
  })

  describe('Log Management', () => {
    it('should retrieve all logs', () => {
      Logger.info(LogActions.USER_LOGIN, { userId: 1 })
      Logger.info(LogActions.USER_LOGOUT, { userId: 1 })
      
      const logs = Logger.getLogs()
      expect(logs.length).toBe(2)
    })

    it('should clear logs', () => {
      Logger.info(LogActions.USER_LOGIN, { userId: 1 })
      Logger.clear()
      
      const logs = Logger.getLogs()
      expect(logs.length).toBe(0)
    })

    it('should export logs as JSON', () => {
      Logger.info(LogActions.USER_LOGIN, { userId: 1 })
      const exported = Logger.export()
      
      expect(exported).toBeTruthy()
      expect(typeof exported).toBe('string')
    })
  })
})
