<template>
  <div class="security-panel">
    <n-card
      title="🛡️ 安全防护中心"
      class="security-card"
    >
      <n-tabs
        type="line"
        animated
      >
        <!-- 安全概览 -->
        <n-tab-pane
          name="overview"
          tab="安全概览"
        >
          <n-space
            vertical
            :size="16"
          >
            <n-alert
              type="success"
              title="系统安全状态"
            >
              所有安全功能已启用，系统运行正常
            </n-alert>
            
            <n-grid
              :cols="3"
              :x-gap="16"
              :y-gap="16"
            >
              <n-gi>
                <n-statistic
                  label="密码加密"
                  value="已启用"
                >
                  <template #prefix>
                    <n-icon color="#18a058">
                      <ShieldCheckmarkIcon />
                    </n-icon>
                  </template>
                </n-statistic>
              </n-gi>
              <n-gi>
                <n-statistic
                  label="XSS防护"
                  value="已启用"
                >
                  <template #prefix>
                    <n-icon color="#18a058">
                      <ShieldCheckmarkIcon />
                    </n-icon>
                  </template>
                </n-statistic>
              </n-gi>
              <n-gi>
                <n-statistic
                  label="频率限制"
                  value="已启用"
                >
                  <template #prefix>
                    <n-icon color="#18a058">
                      <ShieldCheckmarkIcon />
                    </n-icon>
                  </template>
                </n-statistic>
              </n-gi>
            </n-grid>
          </n-space>
        </n-tab-pane>

        <!-- 操作日志 -->
        <n-tab-pane
          name="logs"
          tab="操作日志"
        >
          <n-space
            vertical
            :size="16"
          >
            <n-space justify="space-between">
              <n-space>
                <n-select
                  v-model:value="logLevel"
                  :options="logLevelOptions"
                  placeholder="日志级别"
                  style="width: 120px"
                />
                <n-input
                  v-model:value="logSearch"
                  placeholder="搜索操作..."
                  clearable
                  style="width: 200px"
                >
                  <template #prefix>
                    <n-icon><SearchIcon /></n-icon>
                  </template>
                </n-input>
              </n-space>
              <n-space>
                <n-button @click="refreshLogs">
                  <template #icon>
                    <n-icon><RefreshIcon /></n-icon>
                  </template>
                  刷新
                </n-button>
                <n-button @click="exportLogs">
                  <template #icon>
                    <n-icon><DownloadIcon /></n-icon>
                  </template>
                  导出
                </n-button>
                <n-button
                  type="error"
                  @click="clearLogs"
                >
                  <template #icon>
                    <n-icon><TrashIcon /></n-icon>
                  </template>
                  清空
                </n-button>
              </n-space>
            </n-space>

            <n-data-table
              :columns="logColumns"
              :data="filteredLogs"
              :pagination="{ pageSize: 10 }"
              :max-height="400"
            />
          </n-space>
        </n-tab-pane>

        <!-- 数据备份 -->
        <n-tab-pane
          name="backup"
          tab="数据备份"
        >
          <n-space
            vertical
            :size="16"
          >
            <n-alert
              type="info"
              title="数据备份"
            >
              定期备份数据可以防止数据丢失，建议每周备份一次
            </n-alert>

            <n-card title="手动备份">
              <n-space vertical>
                <n-space>
                  <n-button
                    type="primary"
                    @click="handleBackup"
                  >
                    <template #icon>
                      <n-icon><CloudDownloadIcon /></n-icon>
                    </template>
                    立即备份
                  </n-button>
                  <n-upload
                    :show-file-list="false"
                    accept=".json"
                    @change="handleRestore"
                  >
                    <n-button>
                      <template #icon>
                        <n-icon><CloudUploadIcon /></n-icon>
                      </template>
                      恢复备份
                    </n-button>
                  </n-upload>
                </n-space>
                
                <n-space>
                  <n-statistic
                    label="用户数"
                    :value="stats.users"
                  />
                  <n-statistic
                    label="帖子数"
                    :value="stats.posts"
                  />
                  <n-statistic
                    label="评论数"
                    :value="stats.comments"
                  />
                  <n-statistic
                    label="存储使用"
                    :value="`${stats.storageUsed}KB / ${stats.storageLimit}KB`"
                  />
                </n-space>
              </n-space>
            </n-card>

            <n-card title="自动备份">
              <n-space vertical>
                <n-text>最近7天的自动备份</n-text>
                <n-list bordered>
                  <n-list-item
                    v-for="backup in autoBackups"
                    :key="backup.timestamp"
                  >
                    <n-space
                      justify="space-between"
                      style="width: 100%"
                    >
                      <span>{{ formatTime(backup.timestamp) }}</span>
                      <n-button
                        size="small"
                        @click="restoreAutoBackup(backup.timestamp)"
                      >
                        恢复
                      </n-button>
                    </n-space>
                  </n-list-item>
                  <n-empty
                    v-if="autoBackups.length === 0"
                    description="暂无自动备份"
                  />
                </n-list>
              </n-space>
            </n-card>
          </n-space>
        </n-tab-pane>

        <!-- 频率限制 -->
        <n-tab-pane
          name="rateLimit"
          tab="频率限制"
        >
          <n-space
            vertical
            :size="16"
          >
            <n-alert
              type="warning"
              title="频率限制"
            >
              防止恶意请求和暴力破解，保护系统安全
            </n-alert>

            <n-card title="限制配置">
              <n-space vertical>
                <n-descriptions
                  :column="2"
                  bordered
                >
                  <n-descriptions-item label="登录">
                    5次/分钟
                  </n-descriptions-item>
                  <n-descriptions-item label="注册">
                    3次/小时
                  </n-descriptions-item>
                  <n-descriptions-item label="发帖">
                    10次/小时
                  </n-descriptions-item>
                  <n-descriptions-item label="评论">
                    30次/小时
                  </n-descriptions-item>
                  <n-descriptions-item label="点赞">
                    100次/小时
                  </n-descriptions-item>
                  <n-descriptions-item label="搜索">
                    20次/分钟
                  </n-descriptions-item>
                  <n-descriptions-item label="私信">
                    20次/小时
                  </n-descriptions-item>
                  <n-descriptions-item label="举报">
                    5次/天
                  </n-descriptions-item>
                </n-descriptions>
              </n-space>
            </n-card>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useMessage, NTag } from 'naive-ui'
import { Logger, LogActions } from '@/utils/logger'
import { Backup } from '@/utils/backup'
import {
  ShieldCheckmark as ShieldCheckmarkIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Trash as TrashIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon
} from '@vicons/ionicons5'

const message = useMessage()

// 日志相关
const logLevel = ref<string | null>(null)
const logSearch = ref('')
const logs = ref(Logger.getLogs())

const logLevelOptions = [
  { label: '全部', value: null },
  { label: '信息', value: 'info' },
  { label: '警告', value: 'warning' },
  { label: '错误', value: 'error' },
  { label: '成功', value: 'success' }
]

const logColumns = [
  {
    title: '时间',
    key: 'timestamp',
    width: 180,
    render: (row: any) => new Date(row.timestamp).toLocaleString('zh-CN')
  },
  {
    title: '级别',
    key: 'level',
    width: 100,
    render: (row: any) => {
      const typeMap: Record<string, any> = {
        info: 'info',
        warning: 'warning',
        error: 'error',
        success: 'success'
      }
      return h(NTag, { type: typeMap[row.level], size: 'small' }, { default: () => row.level })
    }
  },
  {
    title: '操作',
    key: 'action',
    width: 150
  },
  {
    title: '用户',
    key: 'username',
    width: 120
  },
  {
    title: '详情',
    key: 'details',
    ellipsis: { tooltip: true },
    render: (row: any) => JSON.stringify(row.details || {})
  }
]

const filteredLogs = computed(() => {
  let result = logs.value

  if (logLevel.value) {
    result = result.filter(log => log.level === logLevel.value)
  }

  if (logSearch.value) {
    result = result.filter(log =>
      log.action.includes(logSearch.value) ||
      log.username?.includes(logSearch.value)
    )
  }

  return result.reverse()
})

const refreshLogs = () => {
  logs.value = Logger.getLogs()
  message.success('日志已刷新')
}

const exportLogs = () => {
  const json = Logger.export()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `logs-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  message.success('日志已导出')
}

const clearLogs = () => {
  if (confirm('确定要清空所有日志吗？')) {
    Logger.clear()
    logs.value = []
    message.success('日志已清空')
  }
}

// 备份相关
const stats = ref(Backup.getDataStats())
const autoBackups = ref(Backup.getAutoBackups())

const handleBackup = () => {
  Backup.downloadBackup()
  message.success('备份文件已下载')
}

const handleRestore = async (options: any) => {
  const file = options.file.file
  if (!file) return

  const result = await Backup.importFromFile(file)
  if (result.success) {
    message.success(result.message)
    stats.value = Backup.getDataStats()
  } else {
    message.error(result.message)
  }
}

const restoreAutoBackup = (timestamp: number) => {
  if (confirm('确定要恢复此备份吗？当前数据将被覆盖')) {
    const result = Backup.restoreAutoBackup(timestamp)
    if (result.success) {
      message.success(result.message)
      stats.value = Backup.getDataStats()
    } else {
      message.error(result.message)
    }
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

onMounted(() => {
  refreshLogs()
})
</script>

<style scoped>
.security-panel {
  padding: 24px;
}

.security-card {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 107, 53, 0.3);
}
</style>

