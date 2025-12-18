/**
 * HTML 工具 Composable
 * 提供 HTML 处理相关的工具函数
 */
import DOMPurify from 'dompurify'
import { Security } from '@/utils/security'

export function useHtmlUtils() {
  /**
   * 去除 HTML 标签，只保留文本
   */
  const stripHtml = (html: string): string => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  /**
   * 清理 HTML，防止 XSS
   */
  const sanitizeHtml = (dirty: string): string => {
    return Security.sanitizeHTML(dirty)
  }

  /**
   * 清理文本，转义特殊字符
   */
  const sanitizeText = (text: string): string => {
    return Security.sanitizeText(text)
  }

  /**
   * 截断文本
   */
  const truncate = (text: string, maxLength: number, suffix: string = '...'): string => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + suffix
  }

  /**
   * 提取文本摘要（去除 HTML 后截断）
   */
  const extractSummary = (html: string, maxLength: number = 100): string => {
    const text = stripHtml(html)
    return truncate(text, maxLength)
  }

  /**
   * 高亮关键词
   */
  const highlightKeyword = (text: string, keyword: string): string => {
    if (!keyword.trim()) return text
    
    const regex = new RegExp(`(${keyword})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  return {
    stripHtml,
    sanitizeHtml,
    sanitizeText,
    truncate,
    extractSummary,
    highlightKeyword
  }
}

