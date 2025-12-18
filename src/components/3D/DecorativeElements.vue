<template>
  <TresGroup>
    <!-- 长椅 -->
    <Bench
      v-for="(bench, index) in benches"
      :key="`bench-${index}`"
      :position="bench.position"
      :rotation="bench.rotation"
    />
    
    <!-- 花坛 -->
    <FlowerBed
      v-for="(bed, index) in flowerBeds"
      :key="`bed-${index}`"
      :position="bed.position"
    />
    
    <!-- 标志牌 -->
    <SignBoard
      :position="[0, 0, 18]"
      text="欢迎来到校园论坛"
    />
  </TresGroup>
</template>

<script setup lang="ts">
import { TresGroup } from '@tresjs/core'
import Bench from './Bench.vue'
import FlowerBed from './FlowerBed.vue'
import SignBoard from './SignBoard.vue'

const benches = [
  { position: [3, 0, 3], rotation: [0, Math.PI / 4, 0] },
  { position: [-3, 0, 3], rotation: [0, -Math.PI / 4, 0] },
  { position: [3, 0, -3], rotation: [0, -Math.PI / 4, 0] },
  { position: [-3, 0, -3], rotation: [0, Math.PI / 4, 0] }
]

const flowerBeds = [
  { position: [6, 0, 6] },
  { position: [-6, 0, 6] },
  { position: [6, 0, -6] },
  { position: [-6, 0, -6] }
]
</script>

