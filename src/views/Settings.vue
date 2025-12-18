<template>
  <div class="settings-container cyber-page-container">
    <CyberDecor />
    <div class="cyber-content">
      <!-- 设置头部 -->
      <div class="settings-header">
        <h1 class="settings-title cyber-title">
          设置
        </h1>
        <p class="settings-subtitle">
          管理您的账户和偏好设置
        </p>
      </div>

      <!-- 设置内容 -->
      <div class="settings-content">
        <!-- 账户设置 -->
        <n-card class="settings-section cyber-card">
          <template #header>
            <div class="section-header">
              <span class="section-icon">👤</span>
              <span class="section-title">账户设置</span>
            </div>
          </template>
        
          <n-space
            vertical
            size="large"
          >
            <!-- 个人信息 -->
            <div class="setting-item">
              <div class="setting-info">
                <h3 class="setting-label">
                  个人信息
                </h3>
                <p class="setting-desc">
                  管理您的个人资料信息
                </p>
              </div>
              <n-button
                class="setting-action"
                @click="editProfile"
              >
                编辑资料
              </n-button>
            </div>

            <!-- 密码安全 -->
            <div class="setting-item">
              <div class="setting-info">
                <h3 class="setting-label">
                  密码安全
                </h3>
                <p class="setting-desc">
                  修改您的登录密码
                </p>
              </div>
              <n-button
                class="setting-action"
                @click="changePassword"
              >
                修改密码
              </n-button>
            </div>

            <!-- 隐私设置 -->
            <div class="setting-item">
              <div class="setting-info">
                <h3 class="setting-label">
                  隐私设置
                </h3>
                <p class="setting-desc">
                  控制您的隐私和可见性
                </p>
              </div>
              <n-button
                class="setting-action"
                @click="privacySettings"
              >
                隐私设置
              </n-button>
            </div>
          </n-space>
        </n-card>

        <!-- 通知设置 -->
        <n-card class="settings-section">
          <template #header>
            <div class="section-header">
              <span class="section-icon">🔔</span>
              <span class="section-title">通知设置</span>
            </div>
          </template>
        
          <n-space
            vertical
            size="large"
          >
            <!-- 消息通知 -->
            <div class="setting-item">
              <div class="setting-info">
                <h3 class="setting-label">
                  消息通知
                </h3>
                <p class="setting-desc">
                  接收私信和评论通知
                </p>
              </div>
              <n-switch v-model:value="notificationSettings.messages" />
            </div>

            <!-- 点赞通知 -->
            <div class="setting-item">
              <div class="setting-info">
                <h3 class="setting-label">
                  点赞通知
                </h3>
                <p class="setting-desc">
                  接收点赞和收藏通知
                </p>
              </div>
              <n-switch v-model:value="notificationSettings.likes" />
            </div>

            <!-- 关注通知 -->
            <div class="setting-item">
              <div class="setting-info">
                <h3 class="setting-label">
                  关注通知
                </h3>
                <p class="setting-desc">
                  接收新关注者通知
                </p>
              </div>
              <n-switch v-model:value="notificationSettings.follows" />
            </div>

            <!-- 系统通知 -->
            <div class="setting-item">
              <div class="setting-info">
                <h3 class="setting-label">
                  系统通知
                </h3>
                <p class="setting-desc">
                  接收系统重要通知
                </p>
              </div>
              <n-switch v-model:value="notificationSettings.system" />
            </div>
          </n-space>
        </n-card>

        <!-- 显示设置 -->
        <n-card class="settings-section">
          <template #header>
            <div class="section-header">
              <span class="section-icon">🎨</span>
              <span class="section-title">显示设置</span>
            </div>
          </template>
        
          <n-space
            vertical
            size="large"
          >
            <!-- 主题模式 -->
            <div class="setting-item">
              <div class="setting-info">
                <h3 class="setting-label">
                  主题模式
                </h3>
                <p class="setting-desc">
                  选择您喜欢的主题模式
                </p>
              </div>
              <n-select
                v-model:value="displaySettings.theme"
                :options="themeOptions"
                style="width: 120px"
              />
            </div>

            <!-- 语言设置 -->
            <div class="setting-item">
              <div class="setting-info">
                <h3 class="setting-label">
                  语言设置
                </h3>
                <p class="setting-desc">
                  选择界面显示语言
                </p>
              </div>
              <n-select
                v-model:value="displaySettings.language"
                :options="languageOptions"
                style="width: 120px"
              />
            </div>

            <!-- 字体大小 -->
            <div class="setting-item">
              <div class="setting-info">
                <h3 class="setting-label">
                  字体大小
                </h3>
                <p class="setting-desc">
                  调整界面字体大小
                </p>
              </div>
              <n-select
                v-model:value="displaySettings.fontSize"
                :options="fontSizeOptions"
                style="width: 120px"
              />
            </div>
          </n-space>
        </n-card>

        <!-- 数据管理 -->
        <n-card class="settings-section">
          <template #header>
            <div class="section-header">
              <span class="section-icon">💾</span>
              <span class="section-title">数据管理</span>
            </div>
          </template>
        
          <n-space
            vertical
            size="large"
          >
            <!-- 导出数据 -->
            <div class="setting-item">
              <div class="setting-info">
                <h3 class="setting-label">
                  导出数据
                </h3>
                <p class="setting-desc">
                  导出您的帖子和数据
                </p>
              </div>
              <n-button
                class="setting-action"
                @click="exportData"
              >
                导出数据
              </n-button>
            </div>

            <!-- 清除缓存 -->
            <div class="setting-item">
              <div class="setting-info">
                <h3 class="setting-label">
                  清除缓存
                </h3>
                <p class="setting-desc">
                  清除本地缓存数据
                </p>
              </div>
              <n-button
                class="setting-action"
                @click="clearCache"
              >
                清除缓存
              </n-button>
            </div>

            <!-- 删除账户 -->
            <div class="setting-item danger">
              <div class="setting-info">
                <h3 class="setting-label">
                  删除账户
                </h3>
                <p class="setting-desc">
                  永久删除您的账户和所有数据
                </p>
              </div>
              <n-button
                type="error"
                class="setting-action"
                @click="deleteAccount"
              >
                删除账户
              </n-button>
            </div>
          </n-space>
        </n-card>
      </div>

      <!-- 编辑资料模态框 -->
      <n-modal
        v-model:show="showEditProfile"
        preset="card"
        title="编辑个人资料"
        size="huge"
      >
        <EditProfileForm @close="showEditProfile = false" />
      </n-modal>

      <!-- 修改密码模态框 -->
      <n-modal
        v-model:show="showChangePassword"
        preset="card"
        title="修改密码"
        size="medium"
      >
        <div class="password-form">
          <n-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
          >
            <n-form-item
              label="当前密码"
              path="currentPassword"
            >
              <n-input
                v-model:value="passwordForm.currentPassword"
                type="password"
                placeholder="请输入当前密码"
              />
            </n-form-item>
            <n-form-item
              label="新密码"
              path="newPassword"
            >
              <n-input
                v-model:value="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
              />
            </n-form-item>
            <n-form-item
              label="确认密码"
              path="confirmPassword"
            >
              <n-input
                v-model:value="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
              />
            </n-form-item>
          </n-form>
          <div class="form-actions">
            <n-button @click="showChangePassword = false">
              取消
            </n-button>
            <n-button
              type="primary"
              @click="submitPasswordChange"
            >
              确认修改
            </n-button>
          </div>
        </div>
      </n-modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CyberDecor from '@/components/CyberDecor.vue'
import { useUserStore } from '@/stores/user'
import { db } from '@/utils/database'
import EditProfileForm from '@/components/EditProfileForm.vue'

const message = useMessage()
const userStore = useUserStore()

// 模态框状态
const showEditProfile = ref(false)
const showChangePassword = ref(false)

// 通知设置
const notificationSettings = reactive({
  messages: true,
  likes: true,
  follows: true,
  system: true
})

// 显示设置
const displaySettings = reactive({
  theme: 'dark',
  language: 'zh-CN',
  fontSize: 'medium'
})

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string) => {
        return value === passwordForm.newPassword
      },
      message: '两次输入的密码不一致',
      trigger: 'blur'
    }
  ]
}

// 选项数据
const themeOptions = [
  { label: '深色模式', value: 'dark' },
  { label: '浅色模式', value: 'light' },
  { label: '自动', value: 'auto' }
]

const languageOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

const fontSizeOptions = [
  { label: '小', value: 'small' },
  { label: '中', value: 'medium' },
  { label: '大', value: 'large' }
]

// 方法
const editProfile = () => {
  showEditProfile.value = true
}

const changePassword = () => {
  showChangePassword.value = true
}

const privacySettings = () => {
  message.info('隐私设置功能开发中')
}

const submitPasswordChange = () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.error('两次输入的密码不一致')
    return
  }
  
  // 这里应该调用API修改密码
  message.success('密码修改成功')
  showChangePassword.value = false
  
  // 重置表单
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
}

const exportData = () => {
  const user = userStore.currentUser
  if (!user) return
  
  const userPosts = db.getPosts().filter(post => post.authorId === user.id)
  const userComments = db.getComments().filter(comment => comment.authorId === user.id)
  
  const exportData = {
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      bio: user.bio,
      joinDate: user.joinDate
    },
    posts: userPosts,
    comments: userComments,
    exportDate: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `campus-forum-data-${user.username}-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  message.success('数据导出成功')
}

const clearCache = () => {
  // 清除localStorage中的缓存数据
  const keysToKeep = ['campus_forum_users', 'campus_forum_posts', 'campus_forum_comments', 'campus_forum_messages']
  const allKeys = Object.keys(localStorage)
  
  allKeys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key)
    }
  })
  
  message.success('缓存清除成功')
}

const deleteAccount = () => {
  // 这里应该显示确认对话框
  message.warning('删除账户功能需要进一步确认')
}

onMounted(() => {
  // 加载用户设置
  const settings = localStorage.getItem('user_settings')
  if (settings) {
    const parsedSettings = JSON.parse(settings)
    Object.assign(notificationSettings, parsedSettings.notifications || {})
    Object.assign(displaySettings, parsedSettings.display || {})
  }
})
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: var(--interknot-gradient-bg);
  min-height: 100vh;
}

.settings-header {
  text-align: center;
  margin-bottom: 32px;
}

.settings-title {
  font-size: 32px;
  font-weight: 700;
  background: var(--interknot-gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
}

.settings-subtitle {
  font-size: 16px;
  color: var(--interknot-text-secondary);
  margin: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  background: var(--interknot-bg-card);
  border: 1px solid var(--interknot-border-primary);
  border-radius: var(--interknot-radius-lg);
  backdrop-filter: blur(20px);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  font-size: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--interknot-text-primary);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--interknot-border-secondary);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.danger {
  border-color: rgba(244, 67, 54, 0.2);
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--interknot-text-primary);
  margin: 0 0 4px 0;
}

.setting-desc {
  font-size: 14px;
  color: var(--interknot-text-secondary);
  margin: 0;
}

.setting-action {
  background: var(--interknot-gradient-primary);
  border: none;
  color: white;
  font-weight: 600;
  border-radius: var(--interknot-radius-md);
  padding: 8px 16px;
  transition: all var(--interknot-transition-fast);
}

.setting-action:hover {
  transform: translateY(-1px);
  box-shadow: var(--interknot-shadow-md);
}

.password-form {
  padding: 20px 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-container {
    padding: 16px;
  }
  
  .settings-title {
    font-size: 24px;
  }
  
  .settings-subtitle {
    font-size: 14px;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .setting-action {
    width: 100%;
  }
}
</style>
