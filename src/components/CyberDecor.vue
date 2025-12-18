<template>
  <div class="cyber-bg-layer">
    <!-- 动态网格背景 -->
    <div class="cyber-grid-bg" />
    
    <!-- 数据流效果 -->
    <div class="cyber-data-streams">
      <div 
        v-for="i in 12" 
        :key="i" 
        class="cyber-data-stream" 
        :style="{ left: (i * 8.33) + '%', animationDelay: (i * 0.3) + 's' }"
      />
    </div>
    
    <!-- 扫描线效果 -->
    <div class="cyber-scan-lines" />
    
    <!-- 霓虹线条 -->
    <div class="cyber-neon-lines">
      <div class="cyber-neon-line cyber-neon-line-h1" />
      <div class="cyber-neon-line cyber-neon-line-h2" />
      <div class="cyber-neon-line cyber-neon-line-v" />
    </div>
    
    <!-- 角落装饰 -->
    <div class="cyber-corner-decor cyber-corner-tl" />
    <div class="cyber-corner-decor cyber-corner-tr" />
    <div class="cyber-corner-decor cyber-corner-bl" />
    <div class="cyber-corner-decor cyber-corner-br" />
    
    <!-- 侧边数据流 -->
    <div class="cyber-side-stream cyber-side-stream-left" />
    <div class="cyber-side-stream cyber-side-stream-right" />
    
    <!-- 顶部霓虹条 -->
    <div class="cyber-top-bar" />
    
    <!-- 浮动代码片段 -->
    <div class="cyber-floating-code cyber-code-1">
      // SYSTEM_ONLINE
    </div>
    <div class="cyber-floating-code cyber-code-2">
      // DATA_SYNC
    </div>
    <div class="cyber-floating-code cyber-code-3">
      // NET_ACTIVE
    </div>
  </div>
</template>

<script setup lang="ts">
// 赛博朋克装饰组件 - 可在所有页面复用
</script>

<style scoped>
/* 所有样式已在 cyberpunk-common.css 中定义 */
</style>
