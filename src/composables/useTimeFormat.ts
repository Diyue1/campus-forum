/**
 * 时间格式化 Composable
 * 提供统一的时间格式化功能
 */
import { computed } from 'vue'

export function useTimeFormat() {
  /**
   * 格式化时间为相对时间（如：刚刚、5分钟前）
   */
  const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 0) return '未来'
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
    if (diff < 2592000000) return `${Math.floor(diff / 604800000)}周前`
    if (diff < 31536000000) return `${Math.floor(diff / 2592000000)}个月前`
    
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * 格式化时间为完整日期时间
   */
  const formatDateTime = (dateStr: string, options?: Intl.DateTimeFormatOptions): string => {
    const date = new Date(dateStr)
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    }
    return date.toLocaleString('zh-CN', defaultOptions)
  }

  /**
   * 格式化时间为日期
   */
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  /**
   * 格式化时间为时间
   */
  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * 计算时间差（毫秒）
   */
  const getTimeDiff = (dateStr: string): number => {
    const date = new Date(dateStr)
    return Date.now() - date.getTime()
  }

  /**
   * 判断是否为今天
   */
  const isToday = (dateStr: string): boolean => {
    const date = new Date(dateStr)
    const today = new Date()
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  /**
   * 判断是否为昨天
   */
  const isYesterday = (dateStr: string): boolean => {
    const date = new Date(dateStr)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return (
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()
    )
  }

  return {
    formatRelativeTime,
    formatDateTime,
    formatDate,
    formatTime,
    getTimeDiff,
    isToday,
    isYesterday
  }
}

