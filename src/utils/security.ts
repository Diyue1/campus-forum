import bcrypt from 'bcryptjs'
import DOMPurify from 'dompurify'

/**
 * 安全工具类
 * 提供密码加密、XSS防护、CSRF防护等功能
 */
export class Security {
  // ==================== 密码安全 ====================
  
  /**
   * 加密密码
   * @param password 明文密码
   * @returns 加密后的密码
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  }
  
  /**
   * 验证密码
   * @param password 明文密码
   * @param hash 加密后的密码
   * @returns 是否匹配
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }
  
  // ==================== XSS 防护 ====================
  
  /**
   * 清理 HTML 内容，防止 XSS 攻击
   * @param dirty 未清理的 HTML
   * @returns 清理后的 HTML
   */
  static sanitizeHTML(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false
    })
  }
  
  /**
   * 清理文本内容，转义特殊字符
   * @param text 未清理的文本
   * @returns 清理后的文本
   */
  static sanitizeText(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }
  
  /**
   * 清理 URL，防止 JavaScript 伪协议
   * @param url 未清理的 URL
   * @returns 清理后的 URL
   */
  static sanitizeURL(url: string): string {
    const dangerous = /^(javascript|data|vbscript):/i
    if (dangerous.test(url)) {
      return ''
    }
    return url
  }
  
  // ==================== CSRF 防护 ====================
  
  /**
   * 生成 CSRF Token
   * @returns CSRF Token
   */
  static generateCSRFToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  
  /**
   * 验证 CSRF Token
   * @param token 要验证的 Token
   * @param storedToken 存储的 Token
   * @returns 是否有效
   */
  static verifyCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken
  }
  
  /**
   * 获取或创建 CSRF Token
   * @returns CSRF Token
   */
  static getCSRFToken(): string {
    let token = sessionStorage.getItem('csrf_token')
    if (!token) {
      token = this.generateCSRFToken()
      sessionStorage.setItem('csrf_token', token)
    }
    return token
  }
  
  // ==================== 输入验证 ====================
  
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
   * 验证用户名格式
   * @param username 用户名
   * @returns 是否有效
   */
  static isValidUsername(username: string): boolean {
    // 4-20位，只能包含字母、数字、下划线
    const regex = /^[a-zA-Z0-9_]{4,20}$/
    return regex.test(username)
  }
  
  /**
   * 验证密码强度
   * @param password 密码
   * @returns 强度等级 (0-4)
   */
  static checkPasswordStrength(password: string): number {
    let strength = 0
    
    // 长度检查
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    
    // 包含小写字母
    if (/[a-z]/.test(password)) strength++
    
    // 包含大写字母
    if (/[A-Z]/.test(password)) strength++
    
    // 包含数字
    if (/[0-9]/.test(password)) strength++
    
    // 包含特殊字符
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    
    return Math.min(strength, 4)
  }
  
  /**
   * 验证密码是否符合要求
   * @param password 密码
   * @returns 是否有效
   */
  static isValidPassword(password: string): boolean {
    // 至少8位，包含字母和数字
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password)
  }
  
  // ==================== 频率限制 ====================
  
  private static rateLimitMap = new Map<string, number[]>()
  
  /**
   * 检查是否超过频率限制
   * @param key 限制键（如：login_username）
   * @param maxRequests 最大请求次数
   * @param windowMs 时间窗口（毫秒）
   * @returns 是否允许请求
   */
  static checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const requests = this.rateLimitMap.get(key) || []
    
    // 清理过期的请求记录
    const validRequests = requests.filter(time => now - time < windowMs)
    
    if (validRequests.length >= maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.rateLimitMap.set(key, validRequests)
    return true
  }
  
  /**
   * 清理频率限制记录
   * @param key 限制键
   */
  static clearRateLimit(key: string): void {
    this.rateLimitMap.delete(key)
  }
  
  // ==================== 会话安全 ====================
  
  /**
   * 生成随机 Token
   * @param length Token 长度
   * @returns Token
   */
  static generateToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
  }
  
  /**
   * 检查会话是否过期
   * @param timestamp 会话时间戳
   * @param maxAge 最大有效期（毫秒）
   * @returns 是否过期
   */
  static isSessionExpired(timestamp: number, maxAge: number): boolean {
    return Date.now() - timestamp > maxAge
  }
  
  // ==================== 内容过滤 ====================
  
  /**
   * 检查内容是否包含敏感词
   * @param content 内容
   * @returns 是否包含敏感词
   */
  static containsSensitiveWords(content: string): boolean {
    const sensitiveWords = [
      // 这里添加敏感词列表
      '测试敏感词'
    ]
    
    const lowerContent = content.toLowerCase()
    return sensitiveWords.some(word => lowerContent.includes(word.toLowerCase()))
  }
  
  /**
   * 过滤敏感词
   * @param content 内容
   * @returns 过滤后的内容
   */
  static filterSensitiveWords(content: string): string {
    const sensitiveWords = [
      '测试敏感词'
    ]
    
    let filtered = content
    sensitiveWords.forEach(word => {
      const regex = new RegExp(word, 'gi')
      filtered = filtered.replace(regex, '*'.repeat(word.length))
    })
    
    return filtered
  }
  
  // ==================== IP 安全 ====================
  
  /**
   * 验证 IP 地址格式
   * @param ip IP 地址
   * @returns 是否有效
   */
  static isValidIP(ip: string): boolean {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }
  
  /**
   * 检查 IP 是否在黑名单中
   * @param ip IP 地址
   * @returns 是否在黑名单
   */
  static isIPBlacklisted(ip: string): boolean {
    const blacklist = JSON.parse(localStorage.getItem('ip_blacklist') || '[]')
    return blacklist.includes(ip)
  }
  
  /**
   * 添加 IP 到黑名单
   * @param ip IP 地址
   */
  static addIPToBlacklist(ip: string): void {
    const blacklist = JSON.parse(localStorage.getItem('ip_blacklist') || '[]')
    if (!blacklist.includes(ip)) {
      blacklist.push(ip)
      localStorage.setItem('ip_blacklist', JSON.stringify(blacklist))
    }
  }
}

// 导出单例
export const security = Security

