import { messageService } from './message'
import { Logger } from './logger'

/**
 * 图片压缩选项
 */
export interface CompressionOptions {
  maxWidth?: number          // 最大宽度
  maxHeight?: number         // 最大高度
  quality?: number           // 压缩质量 (0-1)
  mimeType?: string          // 输出格式
  maxSizeMB?: number         // 最大文件大小（MB）
  useWebWorker?: boolean     // 是否使用 Web Worker
}

/**
 * 压缩结果
 */
export interface CompressionResult {
  file: File                 // 压缩后的文件
  originalSize: number       // 原始大小（字节）
  compressedSize: number     // 压缩后大小（字节）
  compressionRatio: number   // 压缩比例
  width: number              // 图片宽度
  height: number             // 图片高度
}

/**
 * 图片压缩工具类
 * 提供图片压缩、尺寸调整、格式转换等功能
 */
export class ImageCompression {
  /**
   * 压缩单张图片
   * @param file 图片文件
   * @param options 压缩选项
   * @returns 压缩结果
   */
  static async compressImage(
    file: File,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      mimeType = 'image/jpeg',
      maxSizeMB = 2
    } = options

    try {
      // 读取图片
      const img = await this.loadImage(file)
      
      // 计算新尺寸
      const { width, height } = this.calculateDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      )

      // 创建 canvas 并绘制图片
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      // 转换为 Blob
      let blob = await this.canvasToBlob(canvas, mimeType, quality)
      
      // 如果文件仍然太大，进一步降低质量
      let currentQuality = quality
      const maxSize = maxSizeMB * 1024 * 1024
      
      while (blob.size > maxSize && currentQuality > 0.1) {
        currentQuality -= 0.1
        blob = await this.canvasToBlob(canvas, mimeType, currentQuality)
      }

      // 创建新文件
      const compressedFile = new File(
        [blob],
        this.generateFileName(file.name, mimeType),
        { type: mimeType }
      )

      const compressionRatio = ((file.size - blob.size) / file.size) * 100

      return {
        file: compressedFile,
        originalSize: file.size,
        compressedSize: blob.size,
        compressionRatio: Math.round(compressionRatio),
        width,
        height
      }
    } catch (error) {
      throw new Error(`图片压缩失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 批量压缩图片
   * @param files 图片文件数组
   * @param options 压缩选项
   * @param onProgress 进度回调
   * @returns 压缩结果数组
   */
  static async compressImages(
    files: File[],
    options: CompressionOptions = {},
    onProgress?: (current: number, total: number) => void
  ): Promise<CompressionResult[]> {
    const results: CompressionResult[] = []
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.compressImage(files[i], options)
        results.push(result)
        
        if (onProgress) {
          onProgress(i + 1, files.length)
        }
      } catch (error) {
        Logger.error('图片压缩失败', { 
          index: i + 1,
          total: files.length,
          error: error instanceof Error ? error.message : String(error)
        })
        throw error
      }
    }
    
    return results
  }

  /**
   * 加载图片
   * @param file 图片文件
   * @returns HTMLImageElement
   */
  private static loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img)
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('图片加载失败'))
      }

      img.src = url
    })
  }

  /**
   * 计算压缩后的尺寸
   * @param width 原始宽度
   * @param height 原始高度
   * @param maxWidth 最大宽度
   * @param maxHeight 最大高度
   * @returns 新尺寸
   */
  private static calculateDimensions(
    width: number,
    height: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height }
    }

    const widthRatio = maxWidth / width
    const heightRatio = maxHeight / height
    const ratio = Math.min(widthRatio, heightRatio)

    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio)
    }
  }

  /**
   * Canvas 转 Blob
   * @param canvas Canvas 元素
   * @param mimeType MIME 类型
   * @param quality 质量
   * @returns Blob
   */
  private static canvasToBlob(
    canvas: HTMLCanvasElement,
    mimeType: string,
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Canvas 转换失败'))
          }
        },
        mimeType,
        quality
      )
    })
  }

  /**
   * 生成文件名
   * @param originalName 原始文件名
   * @param mimeType MIME 类型
   * @returns 新文件名
   */
  private static generateFileName(originalName: string, mimeType: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
    const extension = mimeType.split('/')[1]
    return `${nameWithoutExt}_compressed.${extension}`
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
   * 验证图片文件
   * @param file 文件对象
   * @returns 是否有效
   */
  static validateImageFile(file: File): { valid: boolean; message: string } {
    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        message: '不支持的图片格式，请上传 JPG、PNG、WebP 或 GIF 格式的图片'
      }
    }

    // 检查文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        valid: false,
        message: '图片文件过大，请上传小于 10MB 的图片'
      }
    }

    return {
      valid: true,
      message: '验证通过'
    }
  }

  /**
   * 压缩并上传图片（带进度提示）
   * @param file 图片文件
   * @param options 压缩选项
   * @returns 压缩结果
   */
  static async compressWithProgress(
    file: File,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    // 验证文件
    const validation = this.validateImageFile(file)
    if (!validation.valid) {
      messageService.error(validation.message)
      throw new Error(validation.message)
    }

    // 显示加载提示
    const loading = messageService.loading('正在压缩图片...', 0)

    try {
      const result = await this.compressImage(file, options)

      loading?.destroy()

      const savedSize = this.formatFileSize(result.originalSize - result.compressedSize)
      messageService.success(
        `压缩成功！节省了 ${savedSize} (${result.compressionRatio}%)`
      )

      return result
    } catch (error) {
      loading?.destroy()
      messageService.error('图片压缩失败，请重试')
      throw error
    }
  }

  /**
   * 批量压缩并上传图片（带进度提示）
   * @param files 图片文件数组
   * @param options 压缩选项
   * @returns 压缩结果数组
   */
  static async compressMultipleWithProgress(
    files: File[],
    options: CompressionOptions = {}
  ): Promise<CompressionResult[]> {
    let loading: any = null

    try {
      const results = await this.compressImages(files, options, (current, total) => {
        if (loading) {
          loading.destroy()
        }
        loading = messageService.loading(`正在压缩图片 ${current}/${total}...`, 0)
      })

      if (loading) {
        loading.destroy()
      }

      const totalSaved = results.reduce(
        (sum, r) => sum + (r.originalSize - r.compressedSize),
        0
      )

      messageService.success(
        `成功压缩 ${results.length} 张图片，共节省 ${this.formatFileSize(totalSaved)}`
      )

      return results
    } catch (error) {
      if (loading) {
        loading.destroy()
      }
      messageService.error('批量压缩失败，请重试')
      throw error
    }
  }

  /**
   * 转换图片格式
   * @param file 图片文件
   * @param targetFormat 目标格式
   * @param quality 质量
   * @returns 转换后的文件
   */
  static async convertFormat(
    file: File,
    targetFormat: 'jpeg' | 'png' | 'webp',
    quality: number = 0.9
  ): Promise<File> {
    const img = await this.loadImage(file)
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)

    const mimeType = `image/${targetFormat}`
    const blob = await this.canvasToBlob(canvas, mimeType, quality)

    return new File([blob], this.generateFileName(file.name, mimeType), {
      type: mimeType
    })
  }
}

// 导出便捷方法
export const compressImage = (file: File, options?: CompressionOptions) =>
  ImageCompression.compressWithProgress(file, options)

export const compressImages = (files: File[], options?: CompressionOptions) =>
  ImageCompression.compressMultipleWithProgress(files, options)

export const validateImage = (file: File) =>
  ImageCompression.validateImageFile(file)

