<template>
  <div class="admin-settings">
    <h2>系统设置</h2>
    
    <n-card
      title="基本设置"
      style="margin-bottom: 24px"
    >
      <n-form
        label-placement="left"
        label-width="120"
      >
        <n-form-item label="网站名称">
          <n-input
            v-model:value="settings.siteName"
            placeholder="校园绳网"
          />
        </n-form-item>
        <n-form-item label="网站描述">
          <n-input
            v-model:value="settings.siteDesc"
            type="textarea"
            placeholder="校园社交论坛"
          />
        </n-form-item>
        <n-form-item label="允许注册">
          <n-switch v-model:value="settings.allowRegister" />
        </n-form-item>
        <n-form-item label="需要审核">
          <n-switch v-model:value="settings.needApproval" />
        </n-form-item>
      </n-form>
    </n-card>

    <n-card
      title="数据管理"
      style="margin-bottom: 24px"
    >
      <n-space vertical>
        <n-button
          type="primary"
          @click="exportData"
        >
          导出数据
        </n-button>
        <n-button
          type="warning"
          @click="clearCache"
        >
          清除缓存
        </n-button>
        <n-button
          type="error"
          @click="resetData"
        >
          重置数据
        </n-button>
      </n-space>
    </n-card>

    <n-card title="保存设置">
      <n-button
        type="primary"
        @click="saveSettings"
      >
        保存所有设置
      </n-button>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { db } from '@/utils/database'

const message = useMessage()

const settings = ref({
  siteName: '校园绳网',
  siteDesc: '校园社交论坛',
  allowRegister: true,
  needApproval: false
})

// 加载设置
const loadSettings = () => {
  const saved = localStorage.getItem('admin_settings')
  if (saved) {
    Object.assign(settings.value, JSON.parse(saved))
  }
}

// 页面加载时读取设置
loadSettings()

const saveSettings = () => {
  localStorage.setItem('admin_settings', JSON.stringify(settings.value))
  message.success('设置已保存')
}

const exportData = () => {
  const data = {
    users: db.getUsers(),
    posts: db.getPosts(),
    comments: db.getComments()
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `forum-data-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  message.success('数据已导出')
}

const clearCache = () => {
  if (!confirm('确定清除缓存？')) return
  message.success('缓存已清除')
}

const resetData = () => {
  if (!confirm('确定重置所有数据？此操作不可恢复！')) return
  db.clearAllData()
  db.initializeDefaultData()
  message.success('数据已重置')
  location.reload()
}
</script>

<style scoped>
.admin-settings {
  max-width: 1400px;
}

.admin-settings h2 {
  color: white;
  margin-bottom: 24px;
  font-size: 24px;
}

:deep(.n-card) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.n-card-header) {
  color: white;
  font-weight: 600;
}

:deep(.n-form-item-label) {
  color: rgba(255, 255, 255, 0.9);
}
</style>

