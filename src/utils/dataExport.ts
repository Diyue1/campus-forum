import { db } from './database'

export class DataExporter {
  // 导出所有数据
  static exportAll() {
    const data = {
      users: db.getUsers(),
      posts: db.getPosts(),
      comments: db.getComments(),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }
    
    this.downloadJSON(data, 'campus-forum-data.json')
  }

  // 导出用户数据
  static exportUsers() {
    const users = db.getUsers()
    this.downloadJSON(users, 'users.json')
  }

  // 导出帖子数据
  static exportPosts() {
    const posts = db.getPosts()
    this.downloadJSON(posts, 'posts.json')
  }

  // 导出为CSV
  static exportToCSV(data: any[], filename: string) {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    this.downloadText(csvContent, filename, 'text/csv')
  }

  // 导出统计报告
  static exportStatistics() {
    const stats = {
      totalUsers: db.getUsers().length,
      totalPosts: db.getPosts().length,
      totalComments: db.getComments().length,
      activeUsers: db.getUsers().filter(u => u.status === 'active').length,
      topUsers: db.getUsers()
        .sort((a, b) => (b.posts || 0) - (a.posts || 0))
        .slice(0, 10)
        .map(u => ({
          username: u.username,
          nickname: u.nickname,
          posts: u.posts,
          followers: u.followers,
          level: u.level
        })),
      topPosts: db.getPosts()
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 10)
        .map(p => ({
          id: p.id,
          title: p.title,
          likes: p.likes,
          comments: p.comments,
          views: p.views
        })),
      generatedAt: new Date().toISOString()
    }

    this.downloadJSON(stats, 'statistics-report.json')
  }

  // 下载JSON文件
  private static downloadJSON(data: any, filename: string) {
    const json = JSON.stringify(data, null, 2)
    this.downloadText(json, filename, 'application/json')
  }

  // 下载文本文件
  private static downloadText(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 导入数据
  static async importData(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          
          // 验证数据格式
          if (!data.users || !data.posts) {
            throw new Error('Invalid data format')
          }

          // 导入数据
          localStorage.setItem('campus_forum_users', JSON.stringify(data.users))
          localStorage.setItem('campus_forum_posts', JSON.stringify(data.posts))
          if (data.comments) {
            localStorage.setItem('campus_forum_comments', JSON.stringify(data.comments))
          }

          resolve(true)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  // 备份数据
  static backup() {
    const backup = {
      data: {
        users: localStorage.getItem('campus_forum_users'),
        posts: localStorage.getItem('campus_forum_posts'),
        comments: localStorage.getItem('campus_forum_comments'),
        conversations: localStorage.getItem('campus_forum_conversations'),
        messages: localStorage.getItem('campus_forum_messages')
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }

    this.downloadJSON(backup, `backup-${Date.now()}.json`)
  }

  // 恢复数据
  static async restore(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target?.result as string)
          
          if (!backup.data) {
            throw new Error('Invalid backup format')
          }

          // 恢复数据
          Object.entries(backup.data).forEach(([key, value]) => {
            if (value) {
              localStorage.setItem(key, value as string)
            }
          })

          resolve(true)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }
}

