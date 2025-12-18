/**
 * 操作日志工具类
 * 记录用户操作和系统事件
 */

export interface LogEntry {
  id: number
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  action: string
  userId?: number
  username?: string
  details?: any
  ip?: string
  userAgent?: string
}

export class Logger {
  private static readonly STORAGE_KEY = 'campus_forum_logs'
  private static readonly MAX_LOGS = 1000 // 最多保存1000条日志
  
  /**
   * 获取所有日志
   * @returns 日志列表
   */
  static getLogs(): LogEntry[] {
    const logs = localStorage.getItem(this.STORAGE_KEY)
    return logs ? JSON.parse(logs) : []
  }
  
  /**
   * 保存日志
   * @param logs 日志列表
   */
  private static saveLogs(logs: LogEntry[]): void {
    // 只保留最新的日志
    if (logs.length > this.MAX_LOGS) {
      logs = logs.slice(-this.MAX_LOGS)
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs))
  }
  
  /**
   * 记录日志
   * @param level 日志级别
   * @param action 操作名称
   * @param details 详细信息
   * @param userId 用户ID
   * @param username 用户名
   */
  static log(
    level: 'info' | 'warning' | 'error' | 'success',
    action: string,
    details?: any,
    userId?: number,
    username?: string
  ): void {
    const logs = this.getLogs()
    
    const entry: LogEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      level,
      action,
      userId,
      username,
      details,
      ip: this.getClientIP(),
      userAgent: navigator.userAgent
    }
    
    logs.push(entry)
    this.saveLogs(logs)
    
    // 控制台输出
    const emoji = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      success: '✅'
    }
    console.log(`${emoji[level]} [${action}]`, details || '')
  }
  
  /**
   * 记录信息日志
   */
  static info(action: string, details?: any, userId?: number, username?: string): void {
    this.log('info', action, details, userId, username)
  }
  
  /**
   * 记录警告日志
   */
  static warning(action: string, details?: any, userId?: number, username?: string): void {
    this.log('warning', action, details, userId, username)
  }
  
  /**
   * 记录错误日志
   */
  static error(action: string, details?: any, userId?: number, username?: string): void {
    this.log('error', action, details, userId, username)
  }
  
  /**
   * 记录成功日志
   */
  static success(action: string, details?: any, userId?: number, username?: string): void {
    this.log('success', action, details, userId, username)
  }
  
  /**
   * 查询日志
   * @param filters 过滤条件
   * @returns 日志列表
   */
  static query(filters: {
    level?: string
    action?: string
    userId?: number
    startTime?: string
    endTime?: string
  }): LogEntry[] {
    let logs = this.getLogs()
    
    if (filters.level) {
      logs = logs.filter(log => log.level === filters.level)
    }
    
    if (filters.action) {
      logs = logs.filter(log => log.action.includes(filters.action))
    }
    
    if (filters.userId) {
      logs = logs.filter(log => log.userId === filters.userId)
    }
    
    if (filters.startTime) {
      logs = logs.filter(log => log.timestamp >= filters.startTime!)
    }
    
    if (filters.endTime) {
      logs = logs.filter(log => log.timestamp <= filters.endTime!)
    }
    
    return logs
  }
  
  /**
   * 清除日志
   * @param before 清除此时间之前的日志
   */
  static clear(before?: string): void {
    if (before) {
      const logs = this.getLogs()
      const filtered = logs.filter(log => log.timestamp >= before)
      this.saveLogs(filtered)
    } else {
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }
  
  /**
   * 导出日志
   * @returns JSON 字符串
   */
  static export(): string {
    const logs = this.getLogs()
    return JSON.stringify(logs, null, 2)
  }
  
  /**
   * 获取客户端 IP（模拟）
   * @returns IP 地址
   */
  private static getClientIP(): string {
    // 实际项目中应该从服务器获取真实IP
    return '127.0.0.1'
  }
  
  /**
   * 获取日志统计
   * @returns 统计信息
   */
  static getStats(): {
    total: number
    byLevel: Record<string, number>
    byAction: Record<string, number>
    recent: LogEntry[]
  } {
    const logs = this.getLogs()
    
    const byLevel: Record<string, number> = {
      info: 0,
      warning: 0,
      error: 0,
      success: 0
    }
    
    const byAction: Record<string, number> = {}
    
    logs.forEach(log => {
      byLevel[log.level]++
      byAction[log.action] = (byAction[log.action] || 0) + 1
    })
    
    return {
      total: logs.length,
      byLevel,
      byAction,
      recent: logs.slice(-10).reverse()
    }
  }
}

// 常用操作日志
export const LogActions = {
  // 用户操作
  USER_LOGIN: '用户登录',
  USER_LOGOUT: '用户登出',
  USER_REGISTER: '用户注册',
  USER_UPDATE: '更新资料',
  USER_DELETE: '删除用户',
  USER_BAN: '封禁用户',
  
  // 帖子操作
  POST_CREATE: '发布帖子',
  POST_UPDATE: '编辑帖子',
  POST_DELETE: '删除帖子',
  POST_LOAD_FAIL: '加载帖子详情失败',
  POST_LIKE: '点赞帖子',
  POST_COLLECT: '收藏帖子',
  POST_SHARE: '分享帖子',
  POST_REPORT: '举报帖子',
  
  // 评论操作
  COMMENT_CREATE: '发表评论',
  COMMENT_DELETE: '删除评论',
  COMMENT_LIKE: '点赞评论',
  
  // 管理操作
  ADMIN_APPROVE: '审核通过',
  ADMIN_REJECT: '审核拒绝',
  ADMIN_TOP: '置顶帖子',
  ADMIN_UNTOP: '取消置顶',
  
  // 系统操作
  SYSTEM_BACKUP: '数据备份',
  SYSTEM_RESTORE: '数据恢复',
  SYSTEM_CLEAR: '清理数据',
  
  // 安全操作
  SECURITY_LOGIN_FAIL: '登录失败',
  SECURITY_RATE_LIMIT: '频率限制',
  SECURITY_XSS_BLOCK: 'XSS攻击拦截',
  SECURITY_CSRF_BLOCK: 'CSRF攻击拦截'
}

