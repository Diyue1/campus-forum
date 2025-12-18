<template>
  <TresGroup :position="position">
    <!-- 树干 -->
    <TresMesh
      :position="[0, 0.5, 0]"
      cast-shadow
    >
      <TresCylinderGeometry :args="[0.2, 0.3, 1, 8]" />
      <TresMeshStandardMaterial color="#8B4513" />
    </TresMesh>
    
    <!-- 树冠 -->
    <TresMesh
      :position="[0, 1.5, 0]"
      cast-shadow
    >
      <TresSphereGeometry :args="[0.8, 16, 16]" />
      <TresMeshStandardMaterial color="#27ae60" />
    </TresMesh>
    
    <TresMesh
      :position="[0, 2, 0]"
      cast-shadow
    >
      <TresSphereGeometry :args="[0.6, 16, 16]" />
      <TresMeshStandardMaterial color="#2ecc71" />
    </TresMesh>
  </TresGroup>
</template>

<script setup lang="ts">
import { TresGroup, TresMesh, TresCylinderGeometry, TresMeshStandardMaterial, TresSphereGeometry } from '@tresjs/core'

defineProps<{
  position: [number, number, number]
}>()
</script>

