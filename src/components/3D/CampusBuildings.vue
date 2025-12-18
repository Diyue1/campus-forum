<template>
  <TresGroup>
    <!-- 教学楼 1 -->
    <TresMesh
      :position="[10, 2, 10]"
      cast-shadow
    >
      <TresBoxGeometry :args="[4, 4, 6]" />
      <TresMeshStandardMaterial color="#34495e" />
    </TresMesh>
    <TresMesh :position="[10, 4.5, 10]">
      <TresBoxGeometry :args="[4.2, 0.5, 6.2]" />
      <TresMeshStandardMaterial color="#2c3e50" />
    </TresMesh>
    
    <!-- 教学楼 2 -->
    <TresMesh
      :position="[-10, 2, 10]"
      cast-shadow
    >
      <TresBoxGeometry :args="[4, 4, 6]" />
      <TresMeshStandardMaterial color="#34495e" />
    </TresMesh>
    <TresMesh :position="[-10, 4.5, 10]">
      <TresBoxGeometry :args="[4.2, 0.5, 6.2]" />
      <TresMeshStandardMaterial color="#2c3e50" />
    </TresMesh>
    
    <!-- 图书馆 -->
    <TresMesh
      :position="[10, 3, -10]"
      cast-shadow
    >
      <TresBoxGeometry :args="[6, 6, 4]" />
      <TresMeshStandardMaterial color="#3498db" />
    </TresMesh>
    <TresMesh :position="[10, 6.5, -10]">
      <TresConeGeometry :args="[4, 1.5, 4]" />
      <TresMeshStandardMaterial color="#2980b9" />
    </TresMesh>
    
    <!-- 体育馆 -->
    <TresMesh
      :position="[-10, 2.5, -10]"
      cast-shadow
    >
      <TresCylinderGeometry :args="[3, 3, 5, 32]" />
      <TresMeshStandardMaterial color="#e74c3c" />
    </TresMesh>
    <TresMesh :position="[-10, 5.5, -10]">
      <TresSphereGeometry :args="[3.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]" />
      <TresMeshStandardMaterial color="#c0392b" />
    </TresMesh>
    
    <!-- 中央喷泉 -->
    <TresMesh :position="[0, 0.5, 0]">
      <TresCylinderGeometry :args="[1.5, 1.5, 1, 32]" />
      <TresMeshStandardMaterial
        color="#3498db"
        metalness="0.5"
        roughness="0.2"
      />
    </TresMesh>
    <TresMesh :position="[0, 1.5, 0]">
      <TresCylinderGeometry :args="[0.3, 0.3, 2, 16]" />
      <TresMeshStandardMaterial color="#2980b9" />
    </TresMesh>
    
    <!-- 树木 -->
    <Tree
      v-for="(tree, index) in trees"
      :key="index"
      :position="tree.position"
    />
    
    <!-- 路灯 -->
    <StreetLight
      v-for="(light, index) in streetLights"
      :key="index"
      :position="light.position"
    />
    
    <!-- 装饰性元素 -->
    <DecorativeElements />
  </TresGroup>
</template>

<script setup lang="ts">
import { TresGroup, TresMesh, TresBoxGeometry, TresMeshStandardMaterial, TresConeGeometry, TresCylinderGeometry, TresSphereGeometry } from '@tresjs/core'
import Tree from './Tree.vue'
import StreetLight from './StreetLight.vue'
import DecorativeElements from './DecorativeElements.vue'

// 树木位置
const trees = [
  { position: [15, 0, 0] },
  { position: [-15, 0, 0] },
  { position: [0, 0, 15] },
  { position: [0, 0, -15] },
  { position: [12, 0, 12] },
  { position: [-12, 0, 12] },
  { position: [12, 0, -12] },
  { position: [-12, 0, -12] }
]

// 路灯位置
const streetLights = [
  { position: [8, 0, 0] },
  { position: [-8, 0, 0] },
  { position: [0, 0, 8] },
  { position: [0, 0, -8] }
]
</script>

