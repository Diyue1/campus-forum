<template>
  <TresGroup :position="[zone.position.x, zone.position.y, zone.position.z]">
    <!-- 交互区域圆圈 -->
    <TresMesh
      :rotation="[-Math.PI / 2, 0, 0]"
      :position="[0, 0.01, 0]"
    >
      <TresCircleGeometry :args="[zone.radius, 32]" />
      <TresMeshBasicMaterial
        :color="isActive ? '#FF6B35' : '#667eea'"
        :opacity="isActive ? 0.5 : 0.3"
        transparent
      />
    </TresMesh>
    
    <!-- 交互区域边框 -->
    <TresLineLoop>
      <TresBufferGeometry :position="circlePoints" />
      <TresLineBasicMaterial
        :color="isActive ? '#FF6B35' : '#667eea'"
        :linewidth="2"
      />
    </TresLineLoop>
    
    <!-- 标记柱子 -->
    <TresMesh :position="[0, 1, 0]">
      <TresCylinderGeometry :args="[0.1, 0.1, 2, 16]" />
      <TresMeshStandardMaterial
        :color="isActive ? '#FF6B35' : '#667eea'"
        :emissive="isActive ? '#FF6B35' : '#667eea'"
        :emissive-intensity="isActive ? 0.5 : 0.2"
      />
    </TresMesh>
    
    <!-- 顶部图标 -->
    <TresMesh :position="[0, 2.5, 0]">
      <TresBoxGeometry :args="[0.5, 0.5, 0.1]" />
      <TresMeshStandardMaterial
        :color="isActive ? '#FF6B35' : '#667eea'"
        :emissive="isActive ? '#FF6B35' : '#667eea'"
        :emissive-intensity="isActive ? 0.8 : 0.3"
      />
    </TresMesh>
    
    <!-- 3D 文字标签 -->
    <Html
      :position="[0, 3, 0]"
      :center="true"
    >
      <div
        class="zone-label"
        :class="{ active: isActive }"
      >
        <div class="zone-icon">
          {{ zone.icon || '📍' }}
        </div>
        <div class="zone-name">
          {{ zone.name }}
        </div>
      </div>
    </Html>
    
    <!-- 粒子效果 -->
    <TresPoints v-if="isActive">
      <TresBufferGeometry :position="particlePositions" />
      <TresPointsMaterial
        color="#FF6B35"
        :size="0.1"
        transparent
        :opacity="0.6"
      />
    </TresPoints>
  </TresGroup>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TresGroup, TresMesh, TresCircleGeometry, TresMeshBasicMaterial, TresLineLoop, TresBufferGeometry, TresLineBasicMaterial, TresCylinderGeometry, TresMeshStandardMaterial, TresBoxGeometry, TresPoints, TresPointsMaterial } from '@tresjs/core'
import { Html } from '@tresjs/cientos'
import type { InteractionZone } from '@/utils/character3DController'

const props = defineProps<{
  zone: InteractionZone
  isActive: boolean
}>()

// 生成圆圈边框点
const circlePoints = computed(() => {
  const points: number[] = []
  const segments = 64
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const x = Math.cos(angle) * props.zone.radius
    const z = Math.sin(angle) * props.zone.radius
    points.push(x, 0.02, z)
  }
  
  return new Float32Array(points)
})

// 生成粒子位置
const particlePositions = computed(() => {
  const positions: number[] = []
  const count = 50
  
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * props.zone.radius
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    const y = Math.random() * 3
    
    positions.push(x, y, z)
  }
  
  return new Float32Array(positions)
})
</script>

<style scoped>
.zone-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(102, 126, 234, 0.5);
  transition: all 0.3s;
  pointer-events: none;
}

.zone-label.active {
  background: rgba(255, 107, 53, 0.2);
  border-color: rgba(255, 107, 53, 0.8);
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
  transform: scale(1.1);
}

.zone-icon {
  font-size: 24px;
}

.zone-name {
  color: white;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.zone-label.active .zone-name {
  color: #FF6B35;
}
</style>

