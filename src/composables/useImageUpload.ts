/**
 * 图片上传 Composable
 * 提供图片上传、压缩、预览等功能
 */
import { ref } from 'vue'
import { ImageCompression, type CompressionOptions, type CompressionResult } from '@/utils/imageCompression'
import { messageService } from '@/utils/message'
import { Logger } from '@/utils/logger'

export interface UploadFile {
  file: File
  url: string
  name: string
  size: number
  width?: number
  height?: number
}

export function useImageUpload(options?: {
  maxSize?: number // MB
  maxCount?: number
  compression?: CompressionOptions
}) {
  const {
    maxSize = 5, // 默认 5MB
    maxCount = 9,
    compression
  } = options || {}

  const uploading = ref(false)
  const files = ref<UploadFile[]>([])

  /**
   * 验证文件
   */
  const validateFile = (file: File): { valid: boolean; message?: string } => {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      return { valid: false, message: '只能上传图片文件' }
    }

    // 检查文件大小
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      return { valid: false, message: `图片大小不能超过 ${maxSize}MB` }
    }

    return { valid: true }
  }

  /**
   * 文件转 Base64
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * 获取图片尺寸
   */
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({ width: img.width, height: img.height })
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('无法读取图片尺寸'))
      }
      
      img.src = url
    })
  }

  /**
   * 处理图片上传
   */
  const handleUpload = async (fileList: File[]): Promise<UploadFile[]> => {
    if (files.value.length + fileList.length > maxCount) {
      messageService.warning(`最多只能上传 ${maxCount} 张图片`)
      return []
    }

    uploading.value = true
    const uploadedFiles: UploadFile[] = []

    try {
      for (const file of fileList) {
        // 验证文件
        const validation = validateFile(file)
        if (!validation.valid) {
          messageService.warning(validation.message || '文件验证失败')
          continue
        }

        try {
          let processedFile = file
          let url = ''

          // 如果启用压缩
          if (compression) {
            const compressionResult = await ImageCompression.compress(file, compression)
            processedFile = compressionResult.file
            url = await fileToBase64(compressionResult.file)
          } else {
            url = await fileToBase64(file)
          }

          // 获取图片尺寸
          const dimensions = await getImageDimensions(processedFile)

          uploadedFiles.push({
            file: processedFile,
            url,
            name: processedFile.name,
            size: processedFile.size,
            width: dimensions.width,
            height: dimensions.height
          })
        } catch (error) {
          Logger.error('图片处理失败', { 
            error: error instanceof Error ? error.message : String(error),
            fileName: file.name 
          })
          messageService.error(`处理图片 ${file.name} 失败`)
        }
      }

      files.value.push(...uploadedFiles)
      return uploadedFiles
    } finally {
      uploading.value = false
    }
  }

  /**
   * 移除文件
   */
  const removeFile = (index: number) => {
    files.value.splice(index, 1)
  }

  /**
   * 清空文件
   */
  const clearFiles = () => {
    files.value = []
  }

  /**
   * 预览文件
   */
  const previewFile = (index: number): string | null => {
    if (index >= 0 && index < files.value.length) {
      return files.value[index].url
    }
    return null
  }

  return {
    files,
    uploading,
    handleUpload,
    removeFile,
    clearFiles,
    previewFile,
    validateFile
  }
}

