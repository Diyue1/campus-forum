<template>
  <div
    ref="containerRef"
    class="character-container"
  >
    <div
      class="character-name-tag"
      :style="nameTagStyle"
    >
      {{ characterName }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const props = defineProps<{
  position: [number, number, number]
  characterName?: string
  characterColor?: string
  isWalking?: boolean
}>()

const containerRef = ref<HTMLDivElement>()
const characterGroup = ref<THREE.Group>()

const nameTagStyle = computed(() => ({
  transform: `translate(-50%, -100%)`,
  top: '0',
  left: '50%'
}))

// 简化版：不使用 TresJS，直接返回空组件
// 3D 功能将在后续版本中完善
</script>

<style scoped>
.character-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.character-name-tag {
  position: absolute;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  white-space: nowrap;
  pointer-events: none;
  backdrop-filter: blur(10px);
}
</style>

