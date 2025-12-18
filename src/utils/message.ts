import type { MessageApi } from 'naive-ui'

/**
 * 统一消息提示工具类
 * 封装 Naive UI 的 message 组件，提供统一的消息提示接口
 */
class MessageService {
  private messageApi: MessageApi | null = null

  /**
   * 初始化消息服务
   * @param api Naive UI 的 message API
   */
  init(api: MessageApi) {
    this.messageApi = api
  }

  /**
   * 检查是否已初始化
   */
  private checkInit() {
    if (!this.messageApi) {
      console.error('MessageService 未初始化，请在 main.ts 中调用 messageService.init()')
      return false
    }
    return true
  }

  /**
   * 成功提示
   * @param content 提示内容
   * @param duration 持续时间（毫秒），默认 3000
   */
  success(content: string, duration: number = 3000) {
    if (!this.checkInit()) return
    this.messageApi!.success(content, {
      duration,
      keepAliveOnHover: true
    })
  }

  /**
   * 错误提示
   * @param content 提示内容
   * @param duration 持续时间（毫秒），默认 3000
   */
  error(content: string, duration: number = 3000) {
    if (!this.checkInit()) return
    this.messageApi!.error(content, {
      duration,
      keepAliveOnHover: true
    })
  }

  /**
   * 警告提示
   * @param content 提示内容
   * @param duration 持续时间（毫秒），默认 3000
   */
  warning(content: string, duration: number = 3000) {
    if (!this.checkInit()) return
    this.messageApi!.warning(content, {
      duration,
      keepAliveOnHover: true
    })
  }

  /**
   * 信息提示
   * @param content 提示内容
   * @param duration 持续时间（毫秒），默认 3000
   */
  info(content: string, duration: number = 3000) {
    if (!this.checkInit()) return
    this.messageApi!.info(content, {
      duration,
      keepAliveOnHover: true
    })
  }

  /**
   * 加载提示
   * @param content 提示内容
   * @param duration 持续时间（毫秒），默认 0（不自动关闭）
   * @returns 消息实例，可用于手动关闭
   */
  loading(content: string, duration: number = 0) {
    if (!this.checkInit()) return null
    return this.messageApi!.loading(content, {
      duration,
      keepAliveOnHover: true
    })
  }

  /**
   * 销毁所有消息
   */
  destroyAll() {
    if (!this.checkInit()) return
    this.messageApi!.destroyAll()
  }
}

// 导出单例
export const messageService = new MessageService()

// 导出便捷方法
export const showSuccess = (content: string, duration?: number) => messageService.success(content, duration)
export const showError = (content: string, duration?: number) => messageService.error(content, duration)
export const showWarning = (content: string, duration?: number) => messageService.warning(content, duration)
export const showInfo = (content: string, duration?: number) => messageService.info(content, duration)
export const showLoading = (content: string, duration?: number) => messageService.loading(content, duration)

