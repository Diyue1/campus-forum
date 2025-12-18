// 本地图片生成工具
export class ImageGenerator {
  // 生成纯色占位图片的Data URL
  static generatePlaceholder(width: number, height: number, text: string, bgColor: string = '#FF6B35', textColor: string = '#FFFFFF'): string {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    
    // 绘制背景
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)
    
    // 绘制文字
    ctx.fillStyle = textColor
    ctx.font = `${Math.min(width, height) / 8}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, width / 2, height / 2)
    
    return canvas.toDataURL()
  }
  
  // 生成渐变背景图片
  static generateGradient(width: number, height: number, text: string, color1: string = '#FF6B35', color2: string = '#FF8A65'): string {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    
    // 创建渐变
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, color1)
    gradient.addColorStop(1, color2)
    
    // 绘制渐变背景
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    // 绘制文字
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `${Math.min(width, height) / 8}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, width / 2, height / 2)
    
    return canvas.toDataURL()
  }
  
  // 生成头像图片
  static generateAvatar(size: number, text: string, bgColor: string = '#FF6B35'): string {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    
    // 绘制圆形背景
    ctx.fillStyle = bgColor
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI)
    ctx.fill()
    
    // 绘制文字
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `${size / 3}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, size / 2, size / 2)
    
    return canvas.toDataURL()
  }
  
  // 生成帖子封面图片
  static generatePostCover(width: number, height: number, postId: number, topic: string): string {
    const colors = [
      ['#FF6B35', '#FF8A65'], // 橙色渐变
      ['#4CAF50', '#66BB6A'], // 绿色渐变
      ['#2196F3', '#42A5F5'], // 蓝色渐变
      ['#9C27B0', '#BA68C8'], // 紫色渐变
      ['#FF9800', '#FFB74D'], // 黄色渐变
      ['#F44336', '#EF5350'], // 红色渐变
    ]
    
    const colorIndex = postId % colors.length
    const [color1, color2] = colors[colorIndex]
    
    return this.generateGradient(width, height, topic, color1, color2)
  }
}

// 预生成一些常用的占位图片
export const PlaceholderImages = {
  // 用户头像
  avatar: (text: string, size: number = 40) => ImageGenerator.generateAvatar(size, text),

  // 帖子封面
  postCover: (postId: number, topic: string, width: number = 400, height: number = 300) =>
    ImageGenerator.generatePostCover(width, height, postId, topic),

  // 帖子图片（别名）
  post: (width: number, height: number, topic: string, postId: number = 1) =>
    ImageGenerator.generatePostCover(width, height, postId, topic),

  // 通用占位符
  placeholder: (width: number, height: number, text: string) =>
    ImageGenerator.generatePlaceholder(width, height, text),
}
