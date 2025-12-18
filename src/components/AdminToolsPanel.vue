<template>
  <n-card
    title="管理员工具"
    class="admin-tools-panel"
  >
    <n-space
      vertical
      :size="12"
    >
      <n-alert
        type="info"
        title="数据管理工具"
      >
        这些工具可以帮助你快速管理系统数据
      </n-alert>

      <n-divider style="margin: 8px 0" />

      <!-- 数据统计 -->
      <div class="tool-section">
        <n-text strong>
          数据统计
        </n-text>
        <n-space
          vertical
          :size="8"
          style="margin-top: 8px"
        >
          <n-space justify="space-between">
            <n-text depth="3">
              用户总数
            </n-text>
            <n-tag type="success">
              {{ stats.users }}
            </n-tag>
          </n-space>
          <n-space justify="space-between">
            <n-text depth="3">
              帖子总数
            </n-text>
            <n-tag type="info">
              {{ stats.posts }}
            </n-tag>
          </n-space>
          <n-space justify="space-between">
            <n-text depth="3">
              评论总数
            </n-text>
            <n-tag type="warning">
              {{ stats.comments }}
            </n-tag>
          </n-space>
          <n-space justify="space-between">
            <n-text depth="3">
              存储使用
            </n-text>
            <n-tag :type="storageStatus.type">
              {{ storageStatus.text }}
            </n-tag>
          </n-space>
        </n-space>
      </div>

      <n-divider style="margin: 8px 0" />

      <!-- 快速操作 -->
      <div class="tool-section">
        <n-text strong>
          快速操作
        </n-text>
        <n-space
          vertical
          :size="8"
          style="margin-top: 8px"
        >
          <n-button
            block
            type="primary"
            :loading="generating"
            @click="handleGenerateData"
          >
            <template #icon>
              <n-icon><AddIcon /></n-icon>
            </template>
            生成演示数据
          </n-button>

          <n-popconfirm
            positive-text="确认清除"
            negative-text="取消"
            @positive-click="handleClearData"
          >
            <template #trigger>
              <n-button
                block
                type="warning"
              >
                <template #icon>
                  <n-icon><RefreshIcon /></n-icon>
                </template>
                重置所有数据
              </n-button>
            </template>
            确定要清除所有数据吗？此操作不可恢复！
          </n-popconfirm>

          <n-button
            block
            @click="handleExportData"
          >
            <template #icon>
              <n-icon><DownloadIcon /></n-icon>
            </template>
            导出数据
          </n-button>

          <n-upload
            :show-file-list="false"
            accept=".json"
            @change="handleImportData"
          >
            <n-button block>
              <template #icon>
                <n-icon><UploadIcon /></n-icon>
              </template>
              导入数据
            </n-button>
          </n-upload>
        </n-space>
      </div>

      <n-divider style="margin: 8px 0" />

      <!-- 系统信息 -->
      <div class="tool-section">
        <n-text strong>
          系统信息
        </n-text>
        <n-space
          vertical
          :size="8"
          style="margin-top: 8px"
        >
          <n-space justify="space-between">
            <n-text depth="3">
              版本
            </n-text>
            <n-text>v1.0.0</n-text>
          </n-space>
          <n-space justify="space-between">
            <n-text depth="3">
              浏览器
            </n-text>
            <n-text>{{ browserInfo }}</n-text>
          </n-space>
          <n-space justify="space-between">
            <n-text depth="3">
              在线时长
            </n-text>
            <n-text>{{ onlineTime }}</n-text>
          </n-space>
        </n-space>
      </div>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMessage } from 'naive-ui'
import { db } from '@/utils/database'
import { generateDemoData, clearAllData } from '@/utils/demoData'
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  CloudUpload as UploadIcon
} from '@vicons/ionicons5'

const message = useMessage()
const generating = ref(false)
const startTime = ref(Date.now())
const onlineTime = ref('0分钟')

// 数据统计
const stats = computed(() => ({
  users: db.getUsers().length,
  posts: db.getPosts().length,
  comments: db.getComments().length
}))

// 存储状态
const storageStatus = computed(() => {
  const totalStorage = 5 * 1024 * 1024 // 5MB
  const usedStorage = new Blob([JSON.stringify(localStorage)]).size
  const percentage = (usedStorage / totalStorage) * 100
  const usedMB = (usedStorage / 1024 / 1024).toFixed(2)

  if (percentage > 80) {
    return { type: 'error' as const, text: `${usedMB}MB (紧张)` }
  } else if (percentage > 60) {
    return { type: 'warning' as const, text: `${usedMB}MB (正常)` }
  } else {
    return { type: 'success' as const, text: `${usedMB}MB (良好)` }
  }
})

// 浏览器信息
const browserInfo = computed(() => {
  const ua = navigator.userAgent
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  return 'Unknown'
})

// 生成演示数据
const handleGenerateData = async () => {
  generating.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    generateDemoData()
    message.success('演示数据生成成功！')
    // 刷新页面以显示新数据
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    message.error('生成数据失败')
  } finally {
    generating.value = false
  }
}

// 清除数据
const handleClearData = () => {
  try {
    clearAllData()
    message.success('数据已重置')
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    message.error('重置数据失败')
  }
}

// 导出数据
const handleExportData = () => {
  try {
    const data = {
      users: db.getUsers(),
      posts: db.getPosts(),
      comments: db.getComments(),
      exportTime: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `campus-forum-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    message.success('数据导出成功')
  } catch (error) {
    message.error('导出数据失败')
  }
}

// 导入数据
const handleImportData = (options: any) => {
  const file = options.file.file
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      
      // 验证数据格式
      if (!data.users || !data.posts) {
        message.error('数据格式不正确')
        return
      }

      // 导入数据
      localStorage.setItem('campus_forum_users', JSON.stringify(data.users))
      localStorage.setItem('campus_forum_posts', JSON.stringify(data.posts))
      if (data.comments) {
        localStorage.setItem('campus_forum_comments', JSON.stringify(data.comments))
      }

      message.success('数据导入成功')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      message.error('导入数据失败，请检查文件格式')
    }
  }
  reader.readAsText(file)
}

// 更新在线时长
let timer: number
onMounted(() => {
  timer = window.setInterval(() => {
    const minutes = Math.floor((Date.now() - startTime.value) / 60000)
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      onlineTime.value = `${hours}小时${mins}分钟`
    } else {
      onlineTime.value = `${mins}分钟`
    }
  }, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.admin-tools-panel {
  position: sticky;
  top: 24px;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%);
  border: 1px solid rgba(255, 107, 53, 0.2);
}

.tool-section {
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}
</style>

