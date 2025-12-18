<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-icon">
        ⚠️
      </div>
      <h1 class="error-title">
        页面加载失败
      </h1>
      <p class="error-message">
        抱歉，页面暂时无法加载。请刷新页面重试。
      </p>
      <button
        class="retry-button"
        @click="retry"
      >
        重试
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const retry = () => {
  window.location.reload()
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--interknot-gradient-bg);
}

.error-content {
  text-align: center;
  padding: 40px;
  background: var(--interknot-bg-card);
  border-radius: var(--interknot-radius-lg);
  border: 1px solid var(--interknot-border-primary);
  backdrop-filter: blur(20px);
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--interknot-text-primary);
  margin-bottom: 12px;
}

.error-message {
  font-size: 16px;
  color: var(--interknot-text-secondary);
  margin-bottom: 24px;
}

.retry-button {
  background: var(--interknot-gradient-primary);
  border: none;
  color: white;
  font-weight: 600;
  border-radius: var(--interknot-radius-md);
  padding: 12px 24px;
  cursor: pointer;
  transition: all var(--interknot-transition-fast);
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--interknot-shadow-md);
}
</style>
