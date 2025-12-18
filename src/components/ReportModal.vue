<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    title="举报内容"
    style="width: 500px"
  >
    <n-form
      :model="reportForm"
      label-placement="top"
    >
      <n-form-item label="举报类型">
        <n-select
          v-model:value="reportForm.type"
          :options="reportTypes"
          placeholder="请选择举报类型"
        />
      </n-form-item>
      
      <n-form-item label="举报原因">
        <n-input
          v-model:value="reportForm.reason"
          type="textarea"
          placeholder="请详细描述举报原因..."
          :rows="4"
          :maxlength="500"
          show-count
        />
      </n-form-item>

      <n-form-item label="截图证据（可选）">
        <n-upload
          :max="3"
          list-type="image-card"
          @change="handleUpload"
        >
          点击上传
        </n-upload>
      </n-form-item>
    </n-form>

    <template #action>
      <n-space justify="end">
        <n-button @click="showModal = false">
          取消
        </n-button>
        <n-button
          type="error"
          :loading="loading"
          @click="handleSubmit"
        >
          提交举报
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { Logger, LogActions } from '@/utils/logger'
import { db } from '@/utils/database'

const props = defineProps<{
  show: boolean
  targetType: 'post' | 'comment' | 'user'
  targetId: number
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'success': []
}>()

const message = useMessage()
const userStore = useUserStore()
const loading = ref(false)

const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const reportForm = ref({
  type: '',
  reason: '',
  images: [] as string[]
})

const reportTypes = [
  { label: '垃圾广告', value: 'spam' },
  { label: '色情低俗', value: 'porn' },
  { label: '违法违规', value: 'illegal' },
  { label: '人身攻击', value: 'attack' },
  { label: '侵权内容', value: 'copyright' },
  { label: '虚假信息', value: 'fake' },
  { label: '其他', value: 'other' }
]

const handleUpload = (options: any) => {
  // 处理图片上传
  Logger.info('图片上传', { options }, userStore.currentUser?.id, userStore.currentUser?.username)
}

const handleSubmit = async () => {
  if (!userStore.currentUser) {
    message.error('请先登录')
    return
  }

  if (!reportForm.value.type) {
    message.error('请选择举报类型')
    return
  }

  if (!reportForm.value.reason.trim()) {
    message.error('请填写举报原因')
    return
  }

  loading.value = true

  try {
    // 使用 database 保存举报记录
    if (props.targetType === 'post') {
      const report = db.reportPost({
        postId: props.targetId,
        reporterId: userStore.currentUser.id,
        reason: reportForm.value.reason,
        type: reportForm.value.type as 'spam' | 'inappropriate' | 'harassment' | 'other'
      })
      
      Logger.info(LogActions.POST_REPORT, { 
        postId: props.targetId,
        reportId: report.id 
      }, userStore.currentUser.id, userStore.currentUser.username)
    } else {
      // 对于评论和用户的举报，暂时使用直接存储（未来可以扩展 database）
      const reports = JSON.parse(localStorage.getItem('campus_forum_reports') || '[]')
      reports.push({
        id: reports.length + 1,
        reporterId: userStore.currentUser.id,
        targetType: props.targetType,
        targetId: props.targetId,
        type: reportForm.value.type,
        reason: reportForm.value.reason,
        images: reportForm.value.images,
        status: 'pending',
        createdAt: new Date().toISOString()
      })
      localStorage.setItem('campus_forum_reports', JSON.stringify(reports))
      
      Logger.info('举报提交', { 
        targetType: props.targetType,
        targetId: props.targetId 
      }, userStore.currentUser.id, userStore.currentUser.username)
    }

    message.success('举报已提交，我们会尽快处理')
    emit('success')
    showModal.value = false
    
    // 重置表单
    reportForm.value = { type: '', reason: '', images: [] }
  } catch (error) {
    message.error('提交失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

