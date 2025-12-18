import { describe, it, expect } from 'vitest'

// 简单的验证函数测试
describe('Validation Utilities', () => {
  describe('Email Validation', () => {
    it('should validate correct email', () => {
      const email = 'test@example.com'
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      expect(isValid).toBe(true)
    })

    it('should reject invalid email', () => {
      const email = 'invalid-email'
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      expect(isValid).toBe(false)
    })
  })

  describe('Username Validation', () => {
    it('should validate correct username', () => {
      const username = 'testuser123'
      const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(username)
      expect(isValid).toBe(true)
    })

    it('should reject short username', () => {
      const username = 'ab'
      const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(username)
      expect(isValid).toBe(false)
    })

    it('should reject username with special chars', () => {
      const username = 'test@user'
      const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(username)
      expect(isValid).toBe(false)
    })
  })

  describe('Password Validation', () => {
    it('should validate strong password', () => {
      const password = 'Test123!@#'
      const isValid = password.length >= 6
      expect(isValid).toBe(true)
    })

    it('should reject short password', () => {
      const password = '12345'
      const isValid = password.length >= 6
      expect(isValid).toBe(false)
    })
  })
})
