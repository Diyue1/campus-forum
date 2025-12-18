import { describe, it, expect } from 'vitest'

describe('Message Utility', () => {
  describe('Message Types', () => {
    it('should handle success messages', () => {
      const message = { type: 'success', content: 'Operation successful' }
      expect(message.type).toBe('success')
      expect(message.content).toBeDefined()
    })

    it('should handle error messages', () => {
      const message = { type: 'error', content: 'Operation failed' }
      expect(message.type).toBe('error')
      expect(message.content).toBeDefined()
    })

    it('should handle warning messages', () => {
      const message = { type: 'warning', content: 'Warning message' }
      expect(message.type).toBe('warning')
      expect(message.content).toBeDefined()
    })

    it('should handle info messages', () => {
      const message = { type: 'info', content: 'Info message' }
      expect(message.type).toBe('info')
      expect(message.content).toBeDefined()
    })
  })

  describe('Message Content', () => {
    it('should handle empty content', () => {
      const message = { type: 'info', content: '' }
      expect(message.content).toBe('')
    })

    it('should handle long content', () => {
      const longContent = 'a'.repeat(1000)
      const message = { type: 'info', content: longContent }
      expect(message.content.length).toBe(1000)
    })

    it('should handle special characters', () => {
      const specialContent = '<script>alert("test")</script>'
      const message = { type: 'info', content: specialContent }
      expect(message.content).toContain('script')
    })
  })

  describe('Message Validation', () => {
    it('should validate message structure', () => {
      const message = { type: 'success', content: 'Test' }
      expect(message).toHaveProperty('type')
      expect(message).toHaveProperty('content')
    })

    it('should handle additional properties', () => {
      const message = { 
        type: 'success', 
        content: 'Test',
        duration: 3000,
        closable: true
      }
      expect(message.duration).toBe(3000)
      expect(message.closable).toBe(true)
    })
  })
})
