<template>
  <div class="admin-approval">
    <h2>帖子审核</h2>
    
    <n-tabs
      v-model:value="activeTab"
      type="line"
    >
      <n-tab-pane
        name="pending"
        tab="待审核"
      >
        <template #tab>
          <n-badge
            :value="pendingPosts.length"
            :max="99"
          >
            待审核
          </n-badge>
        </template>
        
        <n-empty
          v-if="pendingPosts.length === 0"
          description="暂无待审核帖子"
        />
        
        <n-list v-else>
          <n-list-item
            v-for="post in pendingPosts"
            :key="post.id"
          >
            <n-card>
              <template #header>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 18px; font-weight: bold;">{{ post.title }}</span>
                  <n-tag type="warning">
                    待审核
                  </n-tag>
                </div>
              </template>
              
              <div class="post-info">
                <p><strong>作者：</strong>{{ post.authorName }}</p>
                <p><strong>话题：</strong>{{ post.topic }}</p>
                <p><strong>发布时间：</strong>{{ formatTime(post.createdAt) }}</p>
                <p><strong>内容：</strong></p>
                <div class="post-content">
                  {{ post.content }}
                </div>
                
                <div
                  v-if="post.images && post.images.length > 0"
                  class="post-images"
                >
                  <n-image
                    v-for="img in post.images"
                    :key="img.id"
                    :src="img.url"
                    width="200"
                    style="margin-right: 8px; margin-bottom: 8px;"
                  />
                </div>
              </div>
              
              <template #footer>
                <n-space>
                  <n-button
                    type="success"
                    @click="approvePost(post.id)"
                  >
                    <template #icon>
                      <n-icon><CheckmarkIcon /></n-icon>
                    </template>
                    通过审核
                  </n-button>
                  <n-button
                    type="error"
                    @click="showRejectModal(post)"
                  >
                    <template #icon>
                      <n-icon><CloseIcon /></n-icon>
                    </template>
                    拒绝
                  </n-button>
                  <n-button @click="viewPostDetail(post.id)">
                    <template #icon>
                      <n-icon><EyeIcon /></n-icon>
                    </template>
                    查看详情
                  </n-button>
                </n-space>
              </template>
            </n-card>
          </n-list-item>
        </n-list>
      </n-tab-pane>
      
      <n-tab-pane
        name="approved"
        tab="已通过"
      >
        <n-data-table
          :columns="approvedColumns"
          :data="approvedPosts"
          :pagination="{ pageSize: 10 }"
        />
      </n-tab-pane>
      
      <n-tab-pane
        name="rejected"
        tab="已拒绝"
      >
        <n-data-table
          :columns="rejectedColumns"
          :data="rejectedPosts"
          :pagination="{ pageSize: 10 }"
        />
      </n-tab-pane>
    </n-tabs>
    
    <!-- 拒绝原因模态框 -->
    <n-modal
      v-model:show="showReject"
      preset="card"
      title="拒绝帖子"
      style="width: 500px"
    >
      <n-form>
        <n-form-item label="拒绝原因">
          <n-select
            v-model:value="rejectReason"
            :options="rejectOptions"
            placeholder="请选择拒绝原因"
          />
        </n-form-item>
        <n-form-item label="详细说明">
          <n-input
            v-model:value="rejectDetail"
            type="textarea"
            :rows="4"
            placeholder="可选，详细说明拒绝原因..."
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showReject = false">
            取消
          </n-button>
          <n-button
            type="error"
            @click="confirmReject"
          >
            确认拒绝
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NTag, useMessage } from 'naive-ui'
import { db } from '@/utils/database'
import {
  CheckmarkCircle as CheckmarkIcon,
  Close as CloseIcon,
  Eye as EyeIcon
} from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()

const activeTab = ref('pending')
const posts = ref<any[]>([])
const showReject = ref(false)
const rejectingPost = ref<any>(null)
const rejectReason = ref('')
const rejectDetail = ref('')

const rejectOptions = [
  { label: '违反社区规范', value: 'violation' },
  { label: '垃圾广告', value: 'spam' },
  { label: '色情低俗', value: 'porn' },
  { label: '违法违规', value: 'illegal' },
  { label: '虚假信息', value: 'fake' },
  { label: '其他', value: 'other' }
]

const pendingPosts = computed(() => posts.value.filter(p => p.status === 'pending'))
const approvedPosts = computed(() => posts.value.filter(p => p.status === 'approved'))
const rejectedPosts = computed(() => posts.value.filter(p => p.status === 'rejected'))

const approvedColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  { title: '作者', key: 'authorName', width: 120 },
  { title: '审核时间', key: 'approvedAt', width: 180 }
]

const rejectedColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  { title: '作者', key: 'authorName', width: 120 },
  { title: '拒绝原因', key: 'rejectReason', width: 150 },
  { title: '拒绝时间', key: 'rejectedAt', width: 180 }
]

const loadPosts = () => {
  posts.value = db.getPosts().map(p => ({
    ...p,
    authorName: db.getUserById(p.authorId)?.nickname || '未知用户'
  }))
}

const approvePost = (postId: number) => {
  db.updatePost(postId, { 
    status: 'approved',
    approvedAt: new Date().toISOString()
  })
  message.success('帖子已审核通过')
  loadPosts()
}

const showRejectModal = (post: any) => {
  rejectingPost.value = post
  showReject.value = true
}

const confirmReject = () => {
  if (!rejectReason.value) {
    message.error('请选择拒绝原因')
    return
  }
  
  if (rejectingPost.value) {
    db.updatePost(rejectingPost.value.id, { 
      status: 'rejected',
      rejectReason: rejectReason.value,
      rejectDetail: rejectDetail.value,
      rejectedAt: new Date().toISOString()
    })
    message.success('帖子已拒绝')
    showReject.value = false
    rejectReason.value = ''
    rejectDetail.value = ''
    rejectingPost.value = null
    loadPosts()
  }
}

const viewPostDetail = (postId: number) => {
  window.open(`/post/${postId}`, '_blank')
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(loadPosts)
</script>

<style scoped>
.admin-approval {
  max-width: 1400px;
}

.admin-approval h2 {
  color: white;
  margin-bottom: 24px;
  font-size: 24px;
}

.post-info {
  color: rgba(255, 255, 255, 0.9);
}

.post-info p {
  margin: 8px 0;
}

.post-content {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: 8px;
  margin-top: 8px;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.post-images {
  margin-top: 12px;
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
</style>

