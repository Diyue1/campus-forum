<template>
  <TresGroup :position="position">
    <!-- 标志牌柱子 -->
    <TresMesh :position="[0, 1, 0]">
      <TresCylinderGeometry :args="[0.1, 0.1, 2, 8]" />
      <TresMeshStandardMaterial color="#7f8c8d" />
    </TresMesh>
    
    <!-- 标志牌板 -->
    <TresMesh :position="[0, 2.5, 0]">
      <TresBoxGeometry :args="[3, 0.8, 0.1]" />
      <TresMeshStandardMaterial color="#2c3e50" />
    </TresMesh>
    
    <!-- 文字标签 -->
    <Html
      :position="[0, 2.5, 0.1]"
      :center="true"
    >
      <div class="sign-text">
        {{ text }}
      </div>
    </Html>
  </TresGroup>
</template>

<script setup lang="ts">
import { TresGroup, TresMesh, TresCylinderGeometry, TresMeshStandardMaterial, TresBoxGeometry } from '@tresjs/core'
import { Html } from '@tresjs/cientos'

defineProps<{
  position: [number, number, number]
  text: string
}>()
</script>

<style scoped>
.sign-text {
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  pointer-events: none;
}
</style>

