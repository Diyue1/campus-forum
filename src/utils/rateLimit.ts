/**
 * 频率限制工具类
 * 用于防止恶意请求和暴力破解
 */
export class RateLimit {
  private static limits = new Map<string, number[]>()
  
  /**
   * 检查是否超过频率限制
   * @param key 限制键
   * @param maxRequests 最大请求次数
   * @param windowMs 时间窗口（毫秒）
   * @returns 是否允许请求
   */
  static check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const requests = this.limits.get(key) || []
    
    // 清理过期的请求记录
    const validRequests = requests.filter(time => now - time < windowMs)
    
    if (validRequests.length >= maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.limits.set(key, validRequests)
    return true
  }
  
  /**
   * 获取剩余请求次数
   * @param key 限制键
   * @param maxRequests 最大请求次数
   * @param windowMs 时间窗口（毫秒）
   * @returns 剩余次数
   */
  static getRemaining(key: string, maxRequests: number, windowMs: number): number {
    const now = Date.now()
    const requests = this.limits.get(key) || []
    const validRequests = requests.filter(time => now - time < windowMs)
    return Math.max(0, maxRequests - validRequests.length)
  }
  
  /**
   * 获取重置时间
   * @param key 限制键
   * @param windowMs 时间窗口（毫秒）
   * @returns 重置时间戳
   */
  static getResetTime(key: string, windowMs: number): number {
    const requests = this.limits.get(key) || []
    if (requests.length === 0) return Date.now()
    return requests[0] + windowMs
  }
  
  /**
   * 清除限制记录
   * @param key 限制键
   */
  static clear(key: string): void {
    this.limits.delete(key)
  }
  
  /**
   * 清除所有限制记录
   */
  static clearAll(): void {
    this.limits.clear()
  }
}

/**
 * 频率限制配置
 */
export const RateLimitConfig = {
  // 登录限制：5次/分钟
  LOGIN: {
    maxRequests: 5,
    windowMs: 60 * 1000
  },
  
  // 注册限制：3次/小时
  REGISTER: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000
  },
  
  // 发帖限制：10次/小时
  POST: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000
  },
  
  // 评论限制：30次/小时
  COMMENT: {
    maxRequests: 30,
    windowMs: 60 * 60 * 1000
  },
  
  // 点赞限制：100次/小时
  LIKE: {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000
  },
  
  // 搜索限制：20次/分钟
  SEARCH: {
    maxRequests: 20,
    windowMs: 60 * 1000
  },
  
  // 私信限制：20次/小时
  MESSAGE: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000
  },
  
  // 举报限制：5次/天
  REPORT: {
    maxRequests: 5,
    windowMs: 24 * 60 * 60 * 1000
  }
}

