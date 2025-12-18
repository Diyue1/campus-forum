<template>
  <TresGroup :position="position">
    <!-- 灯柱 -->
    <TresMesh :position="[0, 2, 0]">
      <TresCylinderGeometry :args="[0.1, 0.1, 4, 8]" />
      <TresMeshStandardMaterial
        color="#7f8c8d"
        metalness="0.8"
        roughness="0.2"
      />
    </TresMesh>
    
    <!-- 灯罩 -->
    <TresMesh :position="[0, 4.2, 0]">
      <TresConeGeometry :args="[0.3, 0.5, 8]" />
      <TresMeshStandardMaterial
        color="#f39c12"
        emissive="#f39c12"
        :emissive-intensity="0.5"
      />
    </TresMesh>
    
    <!-- 点光源 -->
    <TresPointLight
      :position="[0, 4, 0]"
      color="#f39c12"
      :intensity="2"
      :distance="10"
      :decay="2"
    />
  </TresGroup>
</template>

<script setup lang="ts">
import { TresGroup, TresMesh, TresCylinderGeometry, TresMeshStandardMaterial, TresConeGeometry, TresPointLight } from '@tresjs/core'

defineProps<{
  position: [number, number, number]
}>()
</script>

