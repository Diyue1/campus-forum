import { db } from './database'
import { Logger, LogActions } from './logger'
import { messageService } from './message'

/**
 * 备份数据接口
 */
export interface BackupData {
  version: string
  exportTime: string
  users: any[]
  posts: any[]
  comments: any[]
  messages: any[]
  conversations: any[]
  notifications: any[]
  logs: any[]
  metadata?: {
    appVersion: string
    userAgent: string
    totalSize: number
  }
}

/**
 * 备份选项接口
 */
export interface BackupOptions {
  includeUsers?: boolean
  includePosts?: boolean
  includeComments?: boolean
  includeMessages?: boolean
  includeNotifications?: boolean
  includeLogs?: boolean
  compress?: boolean
  encrypt?: boolean
}

/**
 * 数据备份工具类
 * 提供数据导出、导入、备份、恢复、增量备份等功能
 */
export class Backup {
  /**
   * 导出所有数据
   * @param options 备份选项
   * @returns 数据对象
   */
  static exportData(options: BackupOptions = {}): BackupData {
    const {
      includeUsers = true,
      includePosts = true,
      includeComments = true,
      includeMessages = true,
      includeNotifications = true,
      includeLogs = true
    } = options

    const data: BackupData = {
      version: '1.0.0',
      exportTime: new Date().toISOString(),
      users: includeUsers ? db.getUsers() : [],
      posts: includePosts ? db.getPosts() : [],
      comments: includeComments ? db.getComments() : [],
      messages: includeMessages ? db.getMessages() : [],
      conversations: includeMessages ? db.getConversations() : [],
      notifications: includeNotifications ? db.getNotifications() : [],
      logs: includeLogs ? Logger.getLogs() : [],
      metadata: {
        appVersion: '1.0.0',
        userAgent: navigator.userAgent,
        totalSize: 0
      }
    }

    const jsonString = JSON.stringify(data)
    data.metadata!.totalSize = jsonString.length

    Logger.info(LogActions.SYSTEM_BACKUP, {
      dataSize: jsonString.length,
      users: data.users.length,
      posts: data.posts.length,
      comments: data.comments.length
    })

    return data
  }

  /**
   * 导出增量备份（只导出变更的数据）
   * @param lastBackupTime 上次备份时间
   * @returns 增量数据对象
   */
  static exportIncrementalData(lastBackupTime: string): BackupData {
    const data: BackupData = {
      version: '1.0.0',
      exportTime: new Date().toISOString(),
      users: db.getUsers().filter(u => u.joinDate >= lastBackupTime),
      posts: db.getPosts().filter(p => p.createdAt >= lastBackupTime),
      comments: db.getComments().filter(c => c.createdAt >= lastBackupTime),
      messages: db.getMessages().filter(m => m.createdAt >= lastBackupTime),
      conversations: db.getConversations(),
      notifications: db.getNotifications().filter(n => n.createdAt >= lastBackupTime),
      logs: Logger.getLogs().filter(l => l.timestamp >= lastBackupTime)
    }

    Logger.info(LogActions.SYSTEM_BACKUP, {
      type: 'incremental',
      since: lastBackupTime,
      users: data.users.length,
      posts: data.posts.length
    })

    return data
  }
  
  /**
   * 下载备份文件
   * @param filename 文件名
   * @param options 备份选项
   */
  static async downloadBackup(filename?: string, options: BackupOptions = {}): Promise<void> {
    try {
      messageService.loading('正在准备备份数据...', 0)

      const data = this.exportData(options)
      let content: string | Blob
      let mimeType: string
      let extension: string

      if (options.compress) {
        // 压缩数据
        content = await this.compressData(data)
        mimeType = 'application/gzip'
        extension = '.json.gz'
      } else {
        content = JSON.stringify(data, null, 2)
        mimeType = 'application/json'
        extension = '.json'
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = filename || `forum-backup-${Date.now()}${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      URL.revokeObjectURL(url)

      messageService.destroyAll()
      messageService.success(`备份成功！文件大小：${this.formatFileSize(blob.size)}`)

      Logger.success(LogActions.SYSTEM_BACKUP, {
        filename: a.download,
        size: blob.size,
        compressed: options.compress
      })
    } catch (error) {
      messageService.destroyAll()
      messageService.error('备份失败，请重试')
      Logger.error(LogActions.SYSTEM_BACKUP, { error })
    }
  }

  /**
   * 下载增量备份
   * @param lastBackupTime 上次备份时间
   * @param filename 文件名
   */
  static downloadIncrementalBackup(lastBackupTime: string, filename?: string): void {
    const data = this.exportIncrementalData(lastBackupTime)
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = filename || `forum-incremental-backup-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)

    messageService.success(`增量备份成功！文件大小：${this.formatFileSize(blob.size)}`)

    Logger.success(LogActions.SYSTEM_BACKUP, {
      type: 'incremental',
      filename: a.download,
      size: blob.size
    })
  }

  /**
   * 压缩数据
   * @param data 数据对象
   * @returns 压缩后的 Blob
   */
  static async compressData(data: any): Promise<Blob> {
    const json = JSON.stringify(data)
    const encoder = new TextEncoder()
    const uint8Array = encoder.encode(json)

    // 使用 CompressionStream API（现代浏览器支持）
    if ('CompressionStream' in window) {
      const stream = new Blob([uint8Array]).stream()
      const compressedStream = stream.pipeThrough(new CompressionStream('gzip'))
      return new Response(compressedStream).blob()
    }

    // 降级方案：返回原始数据
    return new Blob([json], { type: 'application/json' })
  }

  /**
   * 解压数据
   * @param blob 压缩的 Blob
   * @returns 解压后的字符串
   */
  static async decompressData(blob: Blob): Promise<string> {
    // 使用 DecompressionStream API
    if ('DecompressionStream' in window) {
      const stream = blob.stream()
      const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'))
      const decompressedBlob = await new Response(decompressedStream).blob()
      return await decompressedBlob.text()
    }

    // 降级方案：直接读取
    return await blob.text()
  }

  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @returns 格式化后的字符串
   */
  static formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }
  
  /**
   * 导入数据
   * @param jsonString JSON 字符串
   * @param merge 是否合并数据（而非覆盖）
   * @returns 是否成功
   */
  static importData(jsonString: string, merge: boolean = false): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString) as BackupData

      // 验证数据格式
      if (!data.version || !data.users || !data.posts) {
        return {
          success: false,
          message: '数据格式错误，缺少必要字段'
        }
      }

      // 验证版本兼容性
      if (data.version !== '1.0.0') {
        return {
          success: false,
          message: `版本不兼容：${data.version}`
        }
      }

      if (merge) {
        // 合并模式：保留现有数据，添加新数据
        this.mergeData(data)
      } else {
        // 覆盖模式：完全替换现有数据
        this.replaceData(data)
      }

      Logger.success(LogActions.SYSTEM_RESTORE, {
        users: data.users.length,
        posts: data.posts.length,
        exportTime: data.exportTime,
        mode: merge ? 'merge' : 'replace'
      })

      messageService.success('数据导入成功！')

      return {
        success: true,
        message: '数据导入成功'
      }
    } catch (error) {
      Logger.error(LogActions.SYSTEM_RESTORE, {
        error: error instanceof Error ? error.message : '未知错误'
      })

      messageService.error('数据导入失败，请检查文件格式')

      return {
        success: false,
        message: `导入失败：${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  }

  /**
   * 替换数据（覆盖模式）
   * @param data 备份数据
   */
  private static replaceData(data: BackupData): void {
    localStorage.setItem('campus_forum_users', JSON.stringify(data.users))
    localStorage.setItem('campus_forum_posts', JSON.stringify(data.posts))
    localStorage.setItem('campus_forum_comments', JSON.stringify(data.comments || []))
    localStorage.setItem('campus_forum_messages', JSON.stringify(data.messages || []))
    localStorage.setItem('campus_forum_conversations', JSON.stringify(data.conversations || []))
    localStorage.setItem('campus_forum_notifications', JSON.stringify(data.notifications || []))
  }

  /**
   * 合并数据（合并模式）
   * @param data 备份数据
   */
  private static mergeData(data: BackupData): void {
    // 合并用户
    const existingUsers = db.getUsers()
    const mergedUsers = this.mergeArrayById(existingUsers, data.users)
    localStorage.setItem('campus_forum_users', JSON.stringify(mergedUsers))

    // 合并帖子
    const existingPosts = db.getPosts()
    const mergedPosts = this.mergeArrayById(existingPosts, data.posts)
    localStorage.setItem('campus_forum_posts', JSON.stringify(mergedPosts))

    // 合并评论
    const existingComments = db.getComments()
    const mergedComments = this.mergeArrayById(existingComments, data.comments)
    localStorage.setItem('campus_forum_comments', JSON.stringify(mergedComments))

    // 合并消息
    const existingMessages = db.getMessages()
    const mergedMessages = this.mergeArrayById(existingMessages, data.messages)
    localStorage.setItem('campus_forum_messages', JSON.stringify(mergedMessages))

    // 合并会话
    const existingConversations = db.getConversations()
    const mergedConversations = this.mergeArrayById(existingConversations, data.conversations)
    localStorage.setItem('campus_forum_conversations', JSON.stringify(mergedConversations))

    // 合并通知
    const existingNotifications = db.getNotifications()
    const mergedNotifications = this.mergeArrayById(existingNotifications, data.notifications)
    localStorage.setItem('campus_forum_notifications', JSON.stringify(mergedNotifications))
  }

  /**
   * 合并数组（按 ID 去重）
   * @param existing 现有数组
   * @param incoming 新数组
   * @returns 合并后的数组
   */
  private static mergeArrayById(existing: any[], incoming: any[]): any[] {
    const map = new Map()

    // 先添加现有数据
    existing.forEach(item => map.set(item.id, item))

    // 添加或更新新数据
    incoming.forEach(item => {
      if (!map.has(item.id)) {
        map.set(item.id, item)
      }
    })

    return Array.from(map.values())
  }
  
  /**
   * 从文件导入数据
   * @param file 文件对象
   * @param merge 是否合并数据
   * @returns Promise
   */
  static async importFromFile(file: File, merge: boolean = false): Promise<{ success: boolean; message: string }> {
    try {
      messageService.loading('正在读取备份文件...', 0)

      let content: string

      // 检查文件类型
      if (file.name.endsWith('.gz') || file.type === 'application/gzip') {
        // 解压缩文件
        const blob = new Blob([await file.arrayBuffer()])
        content = await this.decompressData(blob)
      } else {
        // 直接读取 JSON 文件
        content = await file.text()
      }

      messageService.destroyAll()
      messageService.loading('正在导入数据...', 0)

      const result = this.importData(content, merge)

      messageService.destroyAll()

      if (result.success) {
        messageService.success('数据导入成功！页面将在 2 秒后刷新')
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }

      return result
    } catch (error) {
      messageService.destroyAll()
      messageService.error('文件读取失败，请检查文件格式')

      return {
        success: false,
        message: '文件读取失败'
      }
    }
  }

  /**
   * 验证备份文件
   * @param file 文件对象
   * @returns 验证结果
   */
  static async validateBackupFile(file: File): Promise<{ valid: boolean; message: string; data?: BackupData }> {
    try {
      let content: string

      if (file.name.endsWith('.gz')) {
        const blob = new Blob([await file.arrayBuffer()])
        content = await this.decompressData(blob)
      } else {
        content = await file.text()
      }

      const data = JSON.parse(content) as BackupData

      // 验证必要字段
      if (!data.version || !data.exportTime) {
        return {
          valid: false,
          message: '文件格式错误：缺少版本信息'
        }
      }

      if (!data.users || !data.posts) {
        return {
          valid: false,
          message: '文件格式错误：缺少必要数据'
        }
      }

      // 验证版本兼容性
      if (data.version !== '1.0.0') {
        return {
          valid: false,
          message: `版本不兼容：${data.version}`
        }
      }

      return {
        valid: true,
        message: '文件验证成功',
        data
      }
    } catch (error) {
      return {
        valid: false,
        message: '文件解析失败，请检查文件格式'
      }
    }
  }
  
  /**
   * 自动备份
   * @param interval 备份间隔（毫秒）
   */
  static startAutoBackup(interval: number = 24 * 60 * 60 * 1000): void {
    // 每天自动备份一次
    setInterval(() => {
      const data = this.exportData()
      const json = JSON.stringify(data)
      
      // 保存到 localStorage
      const backups = this.getAutoBackups()
      backups.push({
        timestamp: Date.now(),
        data: json
      })
      
      // 只保留最近7天的备份
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      const filtered = backups.filter(b => b.timestamp > sevenDaysAgo)
      
      localStorage.setItem('auto_backups', JSON.stringify(filtered))
      
      Logger.info(LogActions.SYSTEM_BACKUP, {
        type: 'auto',
        count: filtered.length
      })
    }, interval)
  }
  
  /**
   * 获取自动备份列表
   * @returns 备份列表
   */
  static getAutoBackups(): Array<{ timestamp: number; data: string }> {
    const backups = localStorage.getItem('auto_backups')
    return backups ? JSON.parse(backups) : []
  }
  
  /**
   * 恢复自动备份
   * @param timestamp 备份时间戳
   * @returns 是否成功
   */
  static restoreAutoBackup(timestamp: number): { success: boolean; message: string } {
    const backups = this.getAutoBackups()
    const backup = backups.find(b => b.timestamp === timestamp)
    
    if (!backup) {
      return {
        success: false,
        message: '备份不存在'
      }
    }
    
    return this.importData(backup.data)
  }
  
  /**
   * 清除自动备份
   */
  static clearAutoBackups(): void {
    localStorage.removeItem('auto_backups')
    Logger.info(LogActions.SYSTEM_CLEAR, { type: 'auto_backups' })
  }
  
  /**
   * 获取数据统计
   * @returns 统计信息
   */
  static getDataStats(): {
    users: number
    posts: number
    comments: number
    messages: number
    storageUsed: number
    storageLimit: number
  } {
    const users = db.getUsers()
    const posts = db.getPosts()
    const comments = db.getComments()
    const messages = db.getMessages()
    
    // 计算存储使用量
    let storageUsed = 0
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        storageUsed += localStorage[key].length + key.length
      }
    }
    
    return {
      users: users.length,
      posts: posts.length,
      comments: comments.length,
      messages: messages.length,
      storageUsed: Math.round(storageUsed / 1024), // KB
      storageLimit: 5120 // 5MB (大多数浏览器的限制)
    }
  }
  
  /**
   * 清理过期数据
   * @param days 保留天数
   */
  static cleanupOldData(days: number = 30): void {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const cutoffTime = cutoffDate.toISOString()
    
    // 清理旧日志
    Logger.clear(cutoffTime)
    
    // 清理旧通知
    const notifications = db.getNotifications()
    const filtered = notifications.filter(n => n.createdAt >= cutoffTime)
    localStorage.setItem('campus_forum_notifications', JSON.stringify(filtered))
    
    Logger.info(LogActions.SYSTEM_CLEAR, {
      type: 'old_data',
      days,
      removed: notifications.length - filtered.length
    })
  }
}

