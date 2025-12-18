<template>
  <TresGroup
    :position="position"
    :rotation="rotation"
  >
    <!-- 座位 -->
    <TresMesh :position="[0, 0.3, 0]">
      <TresBoxGeometry :args="[1.2, 0.1, 0.4]" />
      <TresMeshStandardMaterial color="#8B4513" />
    </TresMesh>
    
    <!-- 靠背 -->
    <TresMesh :position="[0, 0.6, -0.15]">
      <TresBoxGeometry :args="[1.2, 0.5, 0.1]" />
      <TresMeshStandardMaterial color="#8B4513" />
    </TresMesh>
    
    <!-- 腿 -->
    <TresMesh :position="[-0.5, 0.15, 0.1]">
      <TresBoxGeometry :args="[0.1, 0.3, 0.1]" />
      <TresMeshStandardMaterial color="#654321" />
    </TresMesh>
    <TresMesh :position="[0.5, 0.15, 0.1]">
      <TresBoxGeometry :args="[0.1, 0.3, 0.1]" />
      <TresMeshStandardMaterial color="#654321" />
    </TresMesh>
  </TresGroup>
</template>

<script setup lang="ts">
import { TresGroup, TresMesh, TresBoxGeometry, TresMeshStandardMaterial } from '@tresjs/core'

defineProps<{
  position: [number, number, number]
  rotation?: [number, number, number]
}>()
</script>

