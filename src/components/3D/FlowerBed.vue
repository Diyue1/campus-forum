<template>
  <TresGroup :position="position">
    <!-- 花坛底座 -->
    <TresMesh :position="[0, 0.1, 0]">
      <TresCylinderGeometry :args="[0.5, 0.5, 0.2, 16]" />
      <TresMeshStandardMaterial color="#8B4513" />
    </TresMesh>
    
    <!-- 花朵 -->
    <TresMesh
      v-for="i in 5"
      :key="i"
      :position="flowerPositions[i - 1]"
    >
      <TresSphereGeometry :args="[0.1, 8, 8]" />
      <TresMeshStandardMaterial :color="flowerColors[i % flowerColors.length]" />
    </TresMesh>
  </TresGroup>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TresGroup, TresMesh, TresCylinderGeometry, TresMeshStandardMaterial, TresSphereGeometry } from '@tresjs/core'

defineProps<{
  position: [number, number, number]
}>()

const flowerColors = ['#e74c3c', '#f39c12', '#9b59b6', '#3498db', '#e91e63']

const flowerPositions = computed(() => [
  [0, 0.3, 0],
  [0.2, 0.3, 0.1],
  [-0.2, 0.3, 0.1],
  [0.1, 0.3, -0.2],
  [-0.1, 0.3, -0.2]
])
</script>

