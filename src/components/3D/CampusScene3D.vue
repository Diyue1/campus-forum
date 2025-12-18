<template>
  <div class="scene-container">
    <!-- 3D Canvas -->
    <TresCanvas
      v-bind="gl"
      window-size
    >
      <TresPerspectiveCamera
        :position="cameraPosition"
        :look-at="characterPosition"
      />
      
      <!-- 灯光 -->
      <TresAmbientLight :intensity="0.5" />
      <TresDirectionalLight
        :position="[10, 10, 5]"
        :intensity="1"
        cast-shadow
      />
      <TresPointLight
        :position="[0, 5, 0]"
        :intensity="0.5"
        color="#FF6B35"
      />
      
      <!-- 地面 -->
      <TresMesh
        :rotation="[-Math.PI / 2, 0, 0]"
        :position="[0, 0, 0]"
        receive-shadow
      >
        <TresPlaneGeometry :args="[50, 50]" />
        <TresMeshStandardMaterial color="#2c3e50" />
      </TresMesh>
      
      <!-- 网格辅助线 -->
      <TresGridHelper :args="[50, 50, '#3498db', '#34495e']" />
      
      <!-- 角色 -->
      <Character3D
        :position="characterPosition"
        :character-name="characterName"
        :is-walking="controller.isWalking.value"
      />
      
      <!-- 交互区域标记 -->
      <InteractionZone
        v-for="zone in interactionZones"
        :key="zone.id"
        :zone="zone"
        :is-active="controller.currentZone.value?.id === zone.id"
      />
      
      <!-- 校园建筑 -->
      <CampusBuildings />
    </TresCanvas>
    
    <!-- UI 覆盖层 -->
    <div class="ui-overlay">
      <!-- 控制提示 -->
      <div class="controls-hint">
        <div class="hint-item">
          <span class="key">W A S D</span>
          <span class="desc">移动</span>
        </div>
        <div class="hint-item">
          <span class="key">E</span>
          <span class="desc">交互</span>
        </div>
      </div>
      
      <!-- 交互提示 -->
      <transition name="fade">
        <div
          v-if="controller.currentZone.value"
          class="interaction-prompt"
        >
          <div class="prompt-icon">
            {{ controller.currentZone.value.icon || '💡' }}
          </div>
          <div class="prompt-text">
            <div class="prompt-title">
              {{ controller.currentZone.value.name }}
            </div>
            <div class="prompt-action">
              按 E 键交互
            </div>
          </div>
        </div>
      </transition>
      
      <!-- 小地图 -->
      <div class="minimap">
        <div class="minimap-content">
          <div
            class="minimap-character"
            :style="{
              left: `${(characterPosition[0] / 50) * 100 + 50}%`,
              top: `${(characterPosition[2] / 50) * 100 + 50}%`
            }"
          />
          <div
            v-for="zone in interactionZones"
            :key="zone.id"
            class="minimap-zone"
            :class="{ active: controller.currentZone.value?.id === zone.id }"
            :style="{
              left: `${(zone.position.x / 50) * 100 + 50}%`,
              top: `${(zone.position.z / 50) * 100 + 50}%`
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TresCanvas, TresPerspectiveCamera, TresAmbientLight, TresDirectionalLight, TresPointLight, TresMesh, TresPlaneGeometry, TresMeshStandardMaterial, TresGridHelper } from '@tresjs/core'
import Character3D from './Character3D.vue'
import InteractionZone from './InteractionZone.vue'
import CampusBuildings from './CampusBuildings.vue'
import { useCharacter3DController, type InteractionZone as IInteractionZone } from '@/utils/character3DController'
import { useRouter } from 'vue-router'
import { messageService } from '@/utils/message'

const router = useRouter()

// 交互区域定义
const interactionZones: IInteractionZone[] = [
  {
    id: 'posts',
    name: '帖子广场',
    position: { x: 5, y: 0, z: 5 },
    radius: 2,
    icon: '📝',
    action: () => {
      messageService.success('进入帖子广场')
      router.push('/')
    }
  },
  {
    id: 'create',
    name: '创作中心',
    position: { x: -5, y: 0, z: 5 },
    radius: 2,
    icon: '✍️',
    action: () => {
      messageService.success('打开创作中心')
      router.push('/create')
    }
  },
  {
    id: 'messages',
    name: '消息中心',
    position: { x: 5, y: 0, z: -5 },
    radius: 2,
    icon: '💬',
    action: () => {
      messageService.success('打开消息中心')
      router.push('/messages')
    }
  },
  {
    id: 'profile',
    name: '个人中心',
    position: { x: -5, y: 0, z: -5 },
    radius: 2,
    icon: '👤',
    action: () => {
      messageService.success('打开个人中心')
      router.push('/profile')
    }
  }
]

// 角色控制器
const controller = useCharacter3DController({
  moveSpeed: 0.15,
  initialPosition: { x: 0, y: 0, z: 0 },
  interactionZones
})

// 角色名称
const characterName = '校园探索者'

// 角色位置
const characterPosition = computed(() => controller.position.value)

// 相机位置（跟随角色）
const cameraPosition = computed(() => [
  characterPosition.value[0],
  characterPosition.value[1] + 10,
  characterPosition.value[2] + 15
])

// WebGL 配置
const gl = {
  clearColor: '#0a0a0a',
  shadows: true,
  alpha: false,
  powerPreference: 'high-performance' as const,
  antialias: true
}
</script>

<style scoped>
.scene-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 控制提示 */
.controls-hint {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 16px;
  pointer-events: auto;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.key {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.desc {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

/* 交互提示 */
.interaction-prompt {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.8);
  padding: 20px 32px;
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 107, 53, 0.5);
  box-shadow: 0 8px 32px rgba(255, 107, 53, 0.3);
  pointer-events: auto;
}

.prompt-icon {
  font-size: 48px;
}

.prompt-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prompt-title {
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.prompt-action {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

/* 小地图 */
.minimap {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 200px;
  height: 200px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  overflow: hidden;
  pointer-events: auto;
}

.minimap-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.minimap-character {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #FF6B35;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 10px #FF6B35;
  z-index: 2;
}

.minimap-zone {
  position: absolute;
  width: 12px;
  height: 12px;
  background: rgba(102, 126, 234, 0.5);
  border: 2px solid #667eea;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s;
}

.minimap-zone.active {
  background: rgba(255, 107, 53, 0.8);
  border-color: #FF6B35;
  box-shadow: 0 0 15px #FF6B35;
  transform: translate(-50%, -50%) scale(1.3);
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -40%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .controls-hint {
    bottom: 10px;
    left: 10px;
    flex-direction: column;
    gap: 8px;
  }
  
  .minimap {
    width: 120px;
    height: 120px;
    top: 10px;
    right: 10px;
  }
  
  .interaction-prompt {
    padding: 16px 24px;
  }
  
  .prompt-icon {
    font-size: 36px;
  }
  
  .prompt-title {
    font-size: 16px;
  }
}
</style>

