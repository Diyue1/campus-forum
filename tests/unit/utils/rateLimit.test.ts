import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RateLimit, RateLimitConfig } from '../../../src/utils/rateLimit'

describe('RateLimit Utility', () => {
  beforeEach(() => {
    // 清理 localStorage
    localStorage.clear()
    vi.clearAllTimers()
  })

  describe('Rate Limit Check', () => {
    it('should allow requests within limit', () => {
      const key = 'test_action'
      const result = RateLimit.check(key, 5, 60000)
      expect(result).toBe(true)
    })

    it('should track multiple requests', () => {
      const key = 'test_action_multi'
      
      // 前4次应该都通过（第5次会达到限制）
      for (let i = 0; i < 4; i++) {
        const result = RateLimit.check(key, 5, 60000)
        expect(result).toBe(true)
      }
    })

    it('should block requests exceeding limit', () => {
      const key = 'test_action'
      const maxRequests = 3
      
      // 前3次通过
      for (let i = 0; i < maxRequests; i++) {
        RateLimit.check(key, maxRequests, 60000)
      }
      
      // 第4次应该被阻止
      const result = RateLimit.check(key, maxRequests, 60000)
      expect(result).toBe(false)
    })

    it('should handle different keys independently', () => {
      const key1 = 'action_1'
      const key2 = 'action_2'
      
      RateLimit.check(key1, 1, 60000)
      RateLimit.check(key1, 1, 60000)
      
      // key2 应该不受 key1 的影响
      const result = RateLimit.check(key2, 1, 60000)
      expect(result).toBe(true)
    })
  })

  describe('Rate Limit Config', () => {
    it('should have LOGIN config', () => {
      expect(RateLimitConfig.LOGIN).toBeDefined()
      expect(RateLimitConfig.LOGIN.maxRequests).toBeGreaterThan(0)
      expect(RateLimitConfig.LOGIN.windowMs).toBeGreaterThan(0)
    })

    it('should have REGISTER config', () => {
      expect(RateLimitConfig.REGISTER).toBeDefined()
      expect(RateLimitConfig.REGISTER.maxRequests).toBeGreaterThan(0)
    })

    it('should have POST config', () => {
      expect(RateLimitConfig.POST).toBeDefined()
      expect(RateLimitConfig.POST.maxRequests).toBeGreaterThan(0)
    })

    it('should have COMMENT config', () => {
      expect(RateLimitConfig.COMMENT).toBeDefined()
      expect(RateLimitConfig.COMMENT.maxRequests).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero max requests', () => {
      const result = RateLimit.check('test', 0, 60000)
      expect(result).toBe(false)
    })

    it('should handle very large window', () => {
      const result = RateLimit.check('test', 100, 999999999)
      expect(result).toBe(true)
    })

    it('should handle empty key', () => {
      const result = RateLimit.check('', 5, 60000)
      expect(typeof result).toBe('boolean')
    })
  })
})
