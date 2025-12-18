import { Logger } from './logger'

/**
 * 邮箱服务工具类
 * 提供邮箱验证、验证码发送等功能
 */
export class EmailService {
  private static verificationCodes = new Map<string, { code: string; expiry: number }>()
  
  /**
   * 验证邮箱格式
   * @param email 邮箱地址
   * @returns 是否有效
   */
  static isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }
  
  /**
   * 生成验证码
   * @param length 验证码长度
   * @returns 验证码
   */
  static generateCode(length: number = 6): string {
    const chars = '0123456789'
    let code = ''
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }
  
  /**
   * 发送验证邮件
   * @param email 邮箱地址
   * @param type 验证类型
   * @returns 是否成功
   */
  static async sendVerificationEmail(
    email: string,
    type: 'register' | 'reset' | 'change' = 'register'
  ): Promise<{ success: boolean; code?: string; message: string }> {
    // 验证邮箱格式
    if (!this.isValidEmail(email)) {
      return { success: false, message: '邮箱格式不正确' }
    }
    
    // 生成验证码
    const code = this.generateCode()
    
    // 设置过期时间（5分钟）
    const expiry = Date.now() + 5 * 60 * 1000
    
    // 存储验证码
    this.verificationCodes.set(email, { code, expiry })
    
    // 实际项目中这里应该调用邮件服务API
    // 这里只是模拟发送
    Logger.info('发送验证码', { email, codeLength: code.length })
    
    // 模拟发送延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const typeText = {
      register: '注册',
      reset: '重置密码',
      change: '更换邮箱'
    }
    
    return {
      success: true,
      code, // 开发环境返回验证码，生产环境不应返回
      message: `验证码已发送到 ${email}，请在5分钟内完成${typeText[type]}验证`
    }
  }
  
  /**
   * 验证验证码
   * @param email 邮箱地址
   * @param code 验证码
   * @returns 是否有效
   */
  static verifyCode(email: string, code: string): boolean {
    const stored = this.verificationCodes.get(email)
    
    if (!stored) {
      return false
    }
    
    // 检查是否过期
    if (Date.now() > stored.expiry) {
      this.verificationCodes.delete(email)
      return false
    }
    
    // 验证码匹配
    if (stored.code === code) {
      this.verificationCodes.delete(email)
      return true
    }
    
    return false
  }
  
  /**
   * 清除验证码
   * @param email 邮箱地址
   */
  static clearCode(email: string): void {
    this.verificationCodes.delete(email)
  }
  
  /**
   * 检查验证码是否存在
   * @param email 邮箱地址
   * @returns 是否存在
   */
  static hasCode(email: string): boolean {
    const stored = this.verificationCodes.get(email)
    if (!stored) return false
    
    // 检查是否过期
    if (Date.now() > stored.expiry) {
      this.verificationCodes.delete(email)
      return false
    }
    
    return true
  }
  
  /**
   * 获取验证码剩余时间
   * @param email 邮箱地址
   * @returns 剩余秒数
   */
  static getRemainingTime(email: string): number {
    const stored = this.verificationCodes.get(email)
    if (!stored) return 0
    
    const remaining = Math.max(0, stored.expiry - Date.now())
    return Math.ceil(remaining / 1000)
  }
}

