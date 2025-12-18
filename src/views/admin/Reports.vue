<template>
  <div class="admin-reports">
    <h2>举报管理</h2>

    <n-tabs
      v-model:value="activeTab"
      type="line"
    >
      <n-tab-pane
        name="pending"
        tab="待处理"
      >
        <template #tab>
          <n-badge
            :value="pendingReports.length"
            :max="99"
          >
            待处理
          </n-badge>
        </template>

        <n-empty
          v-if="pendingReports.length === 0"
          description="暂无待处理举报"
        />

        <n-list v-else>
          <n-list-item
            v-for="report in pendingReports"
            :key="report.id"
          >
            <n-card>
              <template #header>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 16px; font-weight: bold;">举报 #{{ report.id }}</span>
                  <n-tag type="warning">
                    待处理
                  </n-tag>
                </div>
              </template>

              <div class="report-info">
                <p><strong>被举报帖子：</strong>{{ report.postTitle }}</p>
                <p><strong>举报类型：</strong>{{ getTypeLabel(report.type) }}</p>
                <p><strong>举报人：</strong>{{ report.reporterName }}</p>
                <p><strong>举报时间：</strong>{{ formatTime(report.createdAt) }}</p>
                <p><strong>举报原因：</strong></p>
                <div class="report-reason">
                  {{ report.reason }}
                </div>
              </div>

              <template #footer>
                <n-space>
                  <n-button
                    type="primary"
                    @click="viewPost(report.postId)"
                  >
                    <template #icon>
                      <n-icon><EyeIcon /></n-icon>
                    </template>
                    查看帖子
                  </n-button>
                  <n-button
                    type="success"
                    @click="showHandleModal(report, 'resolved')"
                  >
                    <template #icon>
                      <n-icon><CheckmarkIcon /></n-icon>
                    </template>
                    处理
                  </n-button>
                  <n-button
                    type="error"
                    @click="showHandleModal(report, 'rejected')"
                  >
                    <template #icon>
                      <n-icon><CloseIcon /></n-icon>
                    </template>
                    驳回
                  </n-button>
                </n-space>
              </template>
            </n-card>
          </n-list-item>
        </n-list>
      </n-tab-pane>

      <n-tab-pane
        name="resolved"
        tab="已处理"
      >
        <n-data-table
          :columns="historyColumns"
          :data="resolvedReports"
          :pagination="{ pageSize: 10 }"
        />
      </n-tab-pane>

      <n-tab-pane
        name="rejected"
        tab="已驳回"
      >
        <n-data-table
          :columns="historyColumns"
          :data="rejectedReports"
          :pagination="{ pageSize: 10 }"
        />
      </n-tab-pane>
    </n-tabs>

    <!-- 处理模态框 -->
    <n-modal
      v-model:show="showHandle"
      preset="card"
      :title="handleTitle"
      style="width: 500px"
    >
      <n-form>
        <n-form-item label="处理说明">
          <n-input
            v-model:value="handleNote"
            type="textarea"
            :rows="4"
            placeholder="请填写处理说明..."
          />
        </n-form-item>
        <n-form-item
          v-if="handleAction === 'resolved'"
          label="处理措施"
        >
          <n-checkbox-group v-model:value="handleActions">
            <n-space vertical>
              <n-checkbox value="delete">
                删除被举报帖子
              </n-checkbox>
              <n-checkbox value="warn">
                警告作者
              </n-checkbox>
              <n-checkbox value="ban">
                封禁作者
              </n-checkbox>
            </n-space>
          </n-checkbox-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showHandle = false">
            取消
          </n-button>
          <n-button
            :type="handleAction === 'resolved' ? 'success' : 'error'"
            @click="confirmHandle"
          >
            确认{{ handleAction === 'resolved' ? '处理' : '驳回' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'
import { NButton, NTag, useMessage } from 'naive-ui'
import { db } from '@/utils/database'
import {
  Eye as EyeIcon,
  CheckmarkCircle as CheckmarkIcon,
  Close as CloseIcon
} from '@vicons/ionicons5'

const message = useMessage()
const reports = ref<any[]>([])
const activeTab = ref('pending')
const showHandle = ref(false)
const handlingReport = ref<any>(null)
const handleAction = ref<'resolved' | 'rejected'>('resolved')
const handleNote = ref('')
const handleActions = ref<string[]>([])

const handleTitle = computed(() => handleAction.value === 'resolved' ? '处理举报' : '驳回举报')

const pendingReports = computed(() => reports.value.filter(r => r.status === 'pending'))
const resolvedReports = computed(() => reports.value.filter(r => r.status === 'resolved'))
const rejectedReports = computed(() => reports.value.filter(r => r.status === 'rejected'))

const historyColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '帖子标题', key: 'postTitle', ellipsis: { tooltip: true } },
  {
    title: '举报类型',
    key: 'type',
    width: 120,
    render: (row: any) => getTypeLabel(row.type)
  },
  { title: '举报人', key: 'reporterName', width: 120 },
  { title: '处理说明', key: 'handleNote', ellipsis: { tooltip: true } },
  { title: '处理时间', key: 'handledAt', width: 180 }
]

const getTypeLabel = (type: string) => {
  const typeMap: any = {
    spam: '垃圾广告',
    porn: '色情低俗',
    illegal: '违法违规',
    abuse: '侮辱谩骂',
    fake: '虚假信息',
    other: '其他'
  }
  return typeMap[type] || type
}

const showHandleModal = (report: any, action: 'resolved' | 'rejected') => {
  handlingReport.value = report
  handleAction.value = action
  showHandle.value = true
}

const confirmHandle = () => {
  if (!handleNote.value.trim()) {
    message.error('请填写处理说明')
    return
  }

  if (handlingReport.value) {
    const allReports = JSON.parse(localStorage.getItem('campus_forum_reports') || '[]')
    const report = allReports.find((r: any) => r.id === handlingReport.value.id)

    if (report) {
      report.status = handleAction.value
      report.handleNote = handleNote.value
      report.handledAt = new Date().toISOString()

      // 如果选择了处理措施
      if (handleAction.value === 'resolved' && handleActions.value.length > 0) {
        if (handleActions.value.includes('delete')) {
          db.deletePost(report.postId)
        }
        if (handleActions.value.includes('ban')) {
          const post = db.getPostById(report.postId)
          if (post) {
            db.updateUser(post.authorId, { status: 'banned' })
          }
        }
      }

      localStorage.setItem('campus_forum_reports', JSON.stringify(allReports))
      message.success(handleAction.value === 'resolved' ? '举报已处理' : '举报已驳回')

      showHandle.value = false
      handleNote.value = ''
      handleActions.value = []
      handlingReport.value = null
      loadReports()
    }
  }
}

const viewPost = (postId: number) => {
  window.open(`/post/${postId}`, '_blank')
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const loadReports = () => {
  // 从localStorage加载举报数据
  reports.value = JSON.parse(localStorage.getItem('campus_forum_reports') || '[]')
}

onMounted(loadReports)
</script>

<style scoped>
.admin-reports {
  max-width: 1400px;
}

.admin-reports h2 {
  color: white;
  margin-bottom: 24px;
  font-size: 24px;
}

.report-info {
  color: rgba(255, 255, 255, 0.9);
}

.report-info p {
  margin: 8px 0;
}

.report-reason {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: 8px;
  margin-top: 8px;
  white-space: pre-wrap;
  word-break: break-word;
}

:deep(.n-card) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
}

:deep(.n-card-header) {
  color: white;
}

:deep(.n-data-table) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

:deep(.n-data-table-th) {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  font-weight: 600;
}

:deep(.n-data-table-td) {
  color: rgba(255, 255, 255, 0.9);
}

:deep(.n-data-table-tr:hover) {
  background: rgba(255, 255, 255, 0.05);
}
</style>

