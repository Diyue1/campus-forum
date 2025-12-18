<template>
  <div class="create-post-container cyber-page-container">
    <CyberDecor />
    <div class="cyber-content">
      <!-- 返回按钮 -->
      <div class="back-section">
        <n-button
          class="back-btn"
          @click="$router.back()"
        >
          <template #icon>
            <n-icon>
              <ArrowBackIcon />
            </n-icon>
          </template>
          返回
        </n-button>
      </div>

      <!-- 发帖表单 -->
      <n-card class="create-post-card cyber-card">
        <template #header>
          <div class="card-header">
            <n-icon
              size="24"
              color="#FF6B35"
            >
              <CreateIcon />
            </n-icon>
            <span class="card-title cyber-title">发布新帖</span>
          </div>
        </template>

        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-placement="top"
          class="create-form"
        >
          <!-- 标题 -->
          <n-form-item
            label="标题"
            path="title"
          >
            <n-input
              v-model:value="formData.title"
              placeholder="给你的帖子起个吸引人的标题..."
              size="large"
              maxlength="100"
              show-count
              class="title-input"
            />
          </n-form-item>

          <!-- 话题选择 -->
          <n-form-item
            label="话题"
            path="topic"
          >
            <n-select
              v-model:value="formData.topic"
              :options="topicOptions"
              placeholder="选择相关话题"
              size="large"
              filterable
              tag
              class="topic-select"
            />
          </n-form-item>

          <!-- 匿名发表选项 -->
          <n-form-item label="发表方式">
            <n-radio-group
              v-model:value="formData.isAnonymous"
              class="anonymous-options"
            >
              <n-radio
                :value="false"
                class="anonymous-radio"
              >
                <template #icon>
                  <n-icon><PersonIcon /></n-icon>
                </template>
                实名发表
              </n-radio>
              <n-radio
                :value="true"
                class="anonymous-radio"
              >
                匿名发表
              </n-radio>
            </n-radio-group>
            <div class="anonymous-hint">
              <span>💡 匿名发表将隐藏您的身份信息，但仍需遵守社区规范</span>
            </div>
          </n-form-item>

          <!-- 内容编辑 -->
          <n-form-item
            label="内容"
            path="content"
          >
            <n-input
              v-model:value="formData.content"
              type="textarea"
              placeholder="分享你的想法、经历或见解..."
              :rows="8"
              maxlength="2000"
              show-count
              class="content-input"
            />
          </n-form-item>

          <!-- 图片上传 -->
          <n-form-item label="图片">
            <div class="upload-section">
              <n-upload
                multiple
                directory-dnd
                :max="9"
                list-type="image-card"
                :default-file-list="fileList"
                class="image-upload"
                @update:file-list="handleFileListChange"
                @preview="handlePreview"
              >
                <n-upload-dragger>
                  <div class="upload-content">
                    <n-icon
                      size="48"
                      color="#FF6B35"
                    >
                      <ImageIcon />
                    </n-icon>
                    <div class="upload-text">
                      <div class="upload-hint">
                        点击或拖拽图片到此区域上传
                      </div>
                      <div class="upload-desc">
                        支持 JPG、PNG 格式，最多上传9张图片
                      </div>
                    </div>
                  </div>
                </n-upload-dragger>
              </n-upload>
            </div>
          </n-form-item>

          <!-- 高级设置 -->
          <n-form-item>
            <n-collapse>
              <n-collapse-item
                title="高级设置"
                name="advanced"
              >
                <n-space vertical>
                  <!-- 是否允许评论 -->
                  <n-checkbox v-model:checked="formData.allowComments">
                    允许评论
                  </n-checkbox>
                
                  <!-- 是否匿名发布 -->
                  <n-checkbox v-model:checked="formData.isAnonymous">
                    匿名发布
                  </n-checkbox>
                
                  <!-- 定时发布 -->
                  <div class="scheduled-post">
                    <n-checkbox v-model:checked="formData.scheduled">
                      定时发布
                    </n-checkbox>
                    <n-date-picker
                      v-if="formData.scheduled"
                      v-model:value="formData.scheduledTime"
                      type="datetime"
                      placeholder="选择发布时间"
                      class="schedule-picker"
                    />
                  </div>
                </n-space>
              </n-collapse-item>
            </n-collapse>
          </n-form-item>

          <!-- 提交按钮 -->
          <n-form-item>
            <n-space
              justify="end"
              class="submit-section"
            >
              <n-button
                class="draft-btn"
                @click="handleSaveDraft"
              >
                保存草稿
              </n-button>
              <n-button
                class="preview-btn"
                @click="handlePreviewPost"
              >
                预览
              </n-button>
              <n-button
                type="primary"
                :loading="submitting"
                class="submit-btn"
                @click="handleSubmit"
              >
                {{ formData.scheduled ? '定时发布' : '立即发布' }}
              </n-button>
            </n-space>
          </n-form-item>
        </n-form>
      </n-card>

      <!-- 预览模态框 -->
      <n-modal
        v-model:show="showPreview"
        preset="card"
        title="帖子预览"
        size="huge"
        class="preview-modal"
      >
        <div class="preview-content">
          <PostCard :post="previewPost" />
        </div>
      </n-modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import CyberDecor from '@/components/CyberDecor.vue'
import { useUserStore } from '@/stores/user'
import { db } from '@/utils/database'
import { PlaceholderImages } from '@/utils/imageGenerator'
import { Logger, LogActions } from '@/utils/logger'
import PostCard from '@/components/PostCard.vue'
import {
  ArrowBackOutline as ArrowBackIcon,
  CreateOutline as CreateIcon,
  ImageOutline as ImageIcon,
  PersonOutline as PersonIcon
} from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const formRef = ref()
const submitting = ref(false)
const showPreview = ref(false)
const fileList = ref<any[]>([])

const formData = ref({
  title: '',
  topic: '',
  content: '',
  allowComments: true,
  isAnonymous: false,
  scheduled: false,
  scheduledTime: null
})

const topicOptions = [
  { label: '校园生活', value: '校园生活' },
  { label: '学习经验', value: '学习经验' },
  { label: '美食推荐', value: '美食推荐' },
  { label: '社团活动', value: '社团活动' },
  { label: '考试攻略', value: '考试攻略' },
  { label: '实习求职', value: '实习求职' },
  { label: '恋爱日常', value: '恋爱日常' },
  { label: '旅行分享', value: '旅行分享' },
  { label: '科技数码', value: '科技数码' },
  { label: '运动健身', value: '运动健身' }
]

const rules = {
  title: {
    required: true,
    message: '请输入帖子标题',
    trigger: 'blur'
  },
  topic: {
    required: true,
    message: '请选择相关话题',
    trigger: 'change'
  },
  content: {
    required: true,
    message: '请输入帖子内容',
    trigger: 'blur'
  }
}

const previewPost = computed(() => ({
  id: 0,
  title: formData.value.title || '帖子标题',
  content: formData.value.content || '帖子内容',
  authorId: formData.value.isAnonymous ? 0 : (userStore.currentUser?.id || 0),
  author: formData.value.isAnonymous ? {
    id: 0,
    name: '匿名用户',
    avatar: PlaceholderImages.avatar('?', 40),
  } : userStore.currentUser,
  topic: formData.value.topic || '未分类',
  images: fileList.value.map((file, index) => ({
    id: index + 1,
    url: file.url || URL.createObjectURL(file.file),
    width: 300,
    height: 200
  })),
  views: 0,
  likes: 0,
  comments: 0,
  shares: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  estimatedHeight: 300
}))

const handleFileListChange = async (files: any[]) => {
  // 限制图片数量为9张
  if (files.length > 9) {
    message.error('最多只能上传9张图片')
    return
  }

  // 处理图片上传，转为Base64
  const processedFiles = []

  for (const file of files) {
    if (file.file) {
      try {
        // 转为Base64
        const base64 = await fileToBase64(file.file)
        processedFiles.push({
          ...file,
          url: base64
        })
      } catch (error) {
        Logger.error('图片处理失败', { 
          error: error instanceof Error ? error.message : String(error),
          fileName: file.name 
        }, userStore.currentUser?.id, userStore.currentUser?.username)
        message.error(error instanceof Error ? error.message : '图片处理失败')
        continue
      }
    } else {
      processedFiles.push(file)
    }
  }

  fileList.value = processedFiles
}

// 将文件转为Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 限制图片大小为2MB
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error('图片大小不能超过2MB'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const handlePreview = (_file: any) => {
  // 图片预览逻辑
  message.info('图片预览功能')
}

const handleSaveDraft = () => {
  message.success('草稿保存成功')
}

const handlePreviewPost = () => {
  if (!formData.value.title || !formData.value.content) {
    message.warning('请先填写标题和内容')
    return
  }
  showPreview.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    // 检查是否已登录
    if (!userStore.isLoggedIn || !userStore.currentUser) {
      message.warning('请先登录后再发帖')
      return
    }
    
    submitting.value = true
    
    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 处理图片数据
    const images = fileList.value.map((file, index) => ({
      id: index + 1,
      url: file.url || URL.createObjectURL(file.file),
      width: 400,
      height: 300
    }))
    
    // 检查是否需要审核
    const settings = JSON.parse(localStorage.getItem('admin_settings') || '{}')
    const needApproval = settings.needApproval || false

    // 创建帖子数据
    const postData = {
      title: formData.value.title,
      content: formData.value.content,
      topic: formData.value.topic,
      authorId: formData.value.isAnonymous ? 0 : userStore.currentUser.id, // 匿名用户ID为0
      isAnonymous: formData.value.isAnonymous,
      authorName: formData.value.isAnonymous ? '匿名用户' : userStore.currentUser.nickname,
      authorAvatar: formData.value.isAnonymous ? PlaceholderImages.avatar('匿', 40) : userStore.currentUser.avatar,
      images: images.length > 0 ? images : undefined,
      tags: [],
      status: needApproval ? 'pending' : 'approved'
    }

    // 保存到数据库
    const newPost = db.createPost(postData)
    
    Logger.success(LogActions.POST_CREATE, { 
      postId: newPost.id,
      title: newPost.title,
      topic: newPost.topic 
    }, userStore.currentUser?.id, userStore.currentUser?.username)

    if (needApproval) {
      message.info('帖子已提交，等待管理员审核')
      router.push('/')
    } else {
      message.success(formData.value.scheduled ? '定时发布设置成功' : '帖子发布成功！')
      // 跳转到帖子详情页
      router.push(`/post/${newPost.id}`)
    }

  } catch (error) {
    Logger.error(LogActions.POST_CREATE, { 
      error: error instanceof Error ? error.message : String(error),
      title: formData.value.title 
    }, userStore.currentUser?.id, userStore.currentUser?.username)
    message.error('发布失败，请检查表单内容')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-post-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
}

.back-section {
  margin-bottom: 24px;
}

.back-btn {
  background: rgba(31, 31, 35, 0.8);
  border: 1px solid rgba(255, 107, 53, 0.2);
  color: #FFFFFF;
}

.create-post-card {
  background: rgba(31, 31, 35, 0.9);
  border: 1px solid rgba(255, 107, 53, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(45deg, #FF6B35, #FF9800);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.create-form {
  margin-top: 24px;
}

.title-input,
.topic-select,
.content-input {
  --n-border: 1px solid rgba(255, 107, 53, 0.3);
  --n-border-hover: 1px solid rgba(255, 107, 53, 0.5);
  --n-border-focus: 1px solid #FF6B35;
  --n-background-color: rgba(255, 255, 255, 0.05);
}

.upload-section {
  width: 100%;
}

.image-upload {
  width: 100%;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
}

.upload-text {
  text-align: center;
}

.upload-hint {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--interknot-text-secondary);
}

.upload-desc {
  font-size: 10px;
  color: var(--interknot-text-tertiary);
}

.scheduled-post {
  display: flex;
  align-items: center;
  gap: 12px;
}

.schedule-picker {
  flex: 1;
}

.submit-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.draft-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
}

.preview-btn {
  background: rgba(0, 188, 212, 0.2);
  border: 1px solid rgba(0, 188, 212, 0.4);
  color: #00BCD4;
}

.submit-btn {
  background: linear-gradient(45deg, #FF6B35, #FF9800);
  border: none;
  font-weight: 600;
  min-width: 120px;
}

.preview-modal {
  --n-color: rgba(31, 31, 35, 0.95);
  --n-border-radius: 16px;
}

.preview-content {
  max-width: 400px;
  margin: 0 auto;
}

/* 表单项样式优化 */
:deep(.n-form-item-label) {
  color: #FFFFFF;
  font-weight: 600;
  margin-bottom: 8px;
}

:deep(.n-input__input-el) {
  color: #FFFFFF;
}

:deep(.n-input__placeholder) {
  color: rgba(255, 255, 255, 0.4);
}

:deep(.n-select .n-base-selection .n-base-selection-label) {
  color: #FFFFFF;
}

:deep(.n-checkbox .n-checkbox__label) {
  color: #FFFFFF;
}

:deep(.n-collapse .n-collapse-item .n-collapse-item__header-main) {
  color: #FFFFFF;
}

/* 上传组件样式 */
:deep(.n-upload .n-upload-dragger) {
  border: 2px dashed rgba(255, 107, 53, 0.3);
  background: rgba(255, 255, 255, 0.02);
}

:deep(.n-upload .n-upload-dragger:hover) {
  border-color: rgba(255, 107, 53, 0.5);
  background: rgba(255, 107, 53, 0.05);
}

/* 匿名发表样式 */
.anonymous-options {
  display: flex;
  gap: 24px;
  margin-bottom: 8px;
}

.anonymous-radio {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--interknot-border-secondary);
  border-radius: var(--interknot-radius-md);
  background: var(--interknot-bg-glass);
  transition: all var(--interknot-transition-fast);
  cursor: pointer;
}

.anonymous-radio:hover {
  border-color: var(--interknot-primary);
  background: var(--interknot-primary-lighter);
}

.anonymous-radio.n-radio--checked {
  border-color: var(--interknot-primary);
  background: var(--interknot-primary-light);
}

.anonymous-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--interknot-text-tertiary);
  margin-top: 8px;
}

.anonymous-hint .n-icon {
  color: var(--interknot-info);
}

:deep(.n-upload-file-list .n-upload-file .n-upload-file-info .n-upload-file-info__name) {
  color: #FFFFFF;
}
</style>


