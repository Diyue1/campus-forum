import { ref, Ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

/**
 * 角色位置
 */
export interface CharacterPosition {
  x: number
  y: number
  z: number
}

/**
 * 交互区域
 */
export interface InteractionZone {
  id: string
  name: string
  position: CharacterPosition
  radius: number
  action: () => void
  icon?: string
}

/**
 * 角色控制器选项
 */
export interface CharacterControllerOptions {
  moveSpeed?: number
  rotationSpeed?: number
  initialPosition?: CharacterPosition
  interactionZones?: InteractionZone[]
}

/**
 * 3D角色控制器
 */
export class Character3DController {
  position: Ref<[number, number, number]>
  rotation: Ref<number>
  isWalking: Ref<boolean>
  currentZone: Ref<InteractionZone | null>
  
  private moveSpeed: number
  private rotationSpeed: number
  private keys: Set<string>
  private interactionZones: InteractionZone[]
  private velocity: THREE.Vector3
  
  constructor(options: CharacterControllerOptions = {}) {
    this.moveSpeed = options.moveSpeed || 0.1
    this.rotationSpeed = options.rotationSpeed || 0.05
    this.interactionZones = options.interactionZones || []
    
    const initial = options.initialPosition || { x: 0, y: 0, z: 0 }
    this.position = ref([initial.x, initial.y, initial.z])
    this.rotation = ref(0)
    this.isWalking = ref(false)
    this.currentZone = ref(null)
    
    this.keys = new Set()
    this.velocity = new THREE.Vector3()
    
    this.setupKeyboardControls()
  }
  
  /**
   * 设置键盘控制
   */
  private setupKeyboardControls() {
    const handleKeyDown = (e: KeyboardEvent) => {
      this.keys.add(e.key.toLowerCase())
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      this.keys.delete(e.key.toLowerCase())
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    // 返回清理函数
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }
  
  /**
   * 更新角色位置
   */
  update() {
    this.velocity.set(0, 0, 0)
    let moving = false
    
    // WASD 或方向键控制
    if (this.keys.has('w') || this.keys.has('arrowup')) {
      this.velocity.z -= this.moveSpeed
      moving = true
    }
    if (this.keys.has('s') || this.keys.has('arrowdown')) {
      this.velocity.z += this.moveSpeed
      moving = true
    }
    if (this.keys.has('a') || this.keys.has('arrowleft')) {
      this.velocity.x -= this.moveSpeed
      moving = true
    }
    if (this.keys.has('d') || this.keys.has('arrowright')) {
      this.velocity.x += this.moveSpeed
      moving = true
    }
    
    // 更新行走状态
    this.isWalking.value = moving
    
    // 应用移动
    if (moving) {
      this.position.value = [
        this.position.value[0] + this.velocity.x,
        this.position.value[1],
        this.position.value[2] + this.velocity.z
      ]
      
      // 更新旋转方向
      if (this.velocity.length() > 0) {
        this.rotation.value = Math.atan2(this.velocity.x, this.velocity.z)
      }
    }
    
    // 检查交互区域
    this.checkInteractionZones()
    
    // 检查交互键（E键）
    if (this.keys.has('e') && this.currentZone.value) {
      this.currentZone.value.action()
      this.keys.delete('e') // 防止重复触发
    }
  }
  
  /**
   * 检查是否在交互区域内
   */
  private checkInteractionZones() {
    const charPos = new THREE.Vector3(
      this.position.value[0],
      this.position.value[1],
      this.position.value[2]
    )
    
    let nearestZone: InteractionZone | null = null
    let nearestDistance = Infinity
    
    for (const zone of this.interactionZones) {
      const zonePos = new THREE.Vector3(zone.position.x, zone.position.y, zone.position.z)
      const distance = charPos.distanceTo(zonePos)
      
      if (distance < zone.radius && distance < nearestDistance) {
        nearestZone = zone
        nearestDistance = distance
      }
    }
    
    this.currentZone.value = nearestZone
  }
  
  /**
   * 添加交互区域
   */
  addInteractionZone(zone: InteractionZone) {
    this.interactionZones.push(zone)
  }
  
  /**
   * 移除交互区域
   */
  removeInteractionZone(id: string) {
    const index = this.interactionZones.findIndex(z => z.id === id)
    if (index !== -1) {
      this.interactionZones.splice(index, 1)
    }
  }
  
  /**
   * 传送到指定位置
   */
  teleportTo(position: CharacterPosition) {
    this.position.value = [position.x, position.y, position.z]
  }
  
  /**
   * 清理
   */
  dispose() {
    this.keys.clear()
  }
}

/**
 * 使用角色控制器（Vue Composition API）
 */
export function useCharacter3DController(options: CharacterControllerOptions = {}) {
  const controller = new Character3DController(options)
  
  let animationFrameId: number
  
  onMounted(() => {
    const animate = () => {
      controller.update()
      animationFrameId = requestAnimationFrame(animate)
    }
    animate()
  })
  
  onUnmounted(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    controller.dispose()
  })
  
  return controller
}

