<template>
  <n-modal
    v-model:show="showModal"
    :mask-closable="true"
    transform-origin="center"
    class="modern-auth-modal"
  >
    <div class="auth-container">
      <!-- 左侧装饰 -->
      <div class="auth-decoration">
        <div class="decoration-content">
          <div class="logo-section">
            <div class="logo-icon">
              🌐
            </div>
            <h2 class="logo-text">
              校园绳网
            </h2>
          </div>
          <p class="welcome-text">
            连接校园，分享生活
          </p>
          <div class="feature-list">
            <div class="feature-item">
              <span class="feature-icon">✨</span>
              <span>发现精彩内容</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">💬</span>
              <span>结识有趣的人</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🎯</span>
              <span>分享你的故事</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单 -->
      <div class="auth-form-section">
        <div class="form-header">
          <h3 class="form-title">
            {{ isLogin ? '欢迎回来' : '加入我们' }}
          </h3>
          <p class="form-subtitle">
            {{ isLogin ? '登录你的账号' : '创建新账号' }}
          </p>
        </div>

        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          size="large"
          class="auth-form"
        >
          <n-form-item
            v-if="!isLogin"
            path="nickname"
          >
            <n-input
              v-model:value="formData.nickname"
              placeholder="昵称"
              :maxlength="20"
              class="modern-input"
            >
              <template #prefix>
                <span class="input-icon">👤</span>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="username">
            <n-input
              v-model:value="formData.username"
              placeholder="用户名"
              :maxlength="20"
              class="modern-input"
            >
              <template #prefix>
                <span class="input-icon">📧</span>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item
            v-if="!isLogin"
            path="email"
          >
            <n-input
              v-model:value="formData.email"
              placeholder="邮箱地址"
              type="email"
              class="modern-input"
            >
              <template #prefix>
                <span class="input-icon">✉️</span>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="password">
            <n-input
              v-model:value="formData.password"
              type="password"
              placeholder="密码"
              show-password-on="click"
              class="modern-input"
            >
              <template #prefix>
                <span class="input-icon">🔒</span>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item
            v-if="!isLogin"
            path="confirmPassword"
          >
            <n-input
              v-model:value="formData.confirmPassword"
              type="password"
              placeholder="确认密码"
              show-password-on="click"
              class="modern-input"
            >
              <template #prefix>
                <span class="input-icon">🔐</span>
              </template>
            </n-input>
          </n-form-item>

          <n-button
            type="primary"
            block
            size="large"
            :loading="loading"
            class="submit-btn"
            @click="handleSubmit"
          >
            {{ isLogin ? '登录' : '注册' }}
          </n-button>
        </n-form>

        <div class="form-footer">
          <n-divider class="divider-text">
            {{ isLogin ? '还没有账号？' : '已有账号？' }}
          </n-divider>
          <n-button
            text
            type="primary"
            size="large"
            class="toggle-btn"
            @click="toggleMode"
          >
            {{ isLogin ? '立即注册' : '立即登录' }}
          </n-button>
        </div>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { Logger } from '@/utils/logger'

const props = defineProps<{
  show: boolean
  mode: 'login' | 'register'
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'success': [user: any]
}>()

const message = useMessage()
const userStore = useUserStore()
const router = useRouter()

const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const isLogin = ref(props.mode === 'login')
const loading = ref(false)
const formRef = ref<FormInst | null>(null)

const formData = ref({
  nickname: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const rules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '用户名长度在 4 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        return value === formData.value.password
      },
      message: '两次输入的密码不一致',
      trigger: 'blur'
    }
  ]
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  formData.value = {
    nickname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    if (isLogin.value) {
      const result = userStore.login(formData.value.username, formData.value.password)
      if (result.success && result.user) {
        message.success('登录成功！')
        emit('success', result.user)
        showModal.value = false

        // 如果是管理员，跳转到管理员页面
        if (result.user.role === 'admin') {
          setTimeout(() => {
            router.push('/admin')
          }, 500)
        }
      } else {
        message.error(result.message)
      }
    } else {
      const result = userStore.register({
        username: formData.value.username,
        nickname: formData.value.nickname,
        email: formData.value.email,
        password: formData.value.password
      })
      if (result.success && result.user) {
        message.success('注册成功！')
        emit('success', result.user)
        showModal.value = false
      } else {
        message.error(result.message)
      }
    }
  } catch (error) {
    Logger.error('表单验证失败', { 
      error: error instanceof Error ? error.message : String(error),
      mode: props.mode
    })
  } finally {
    loading.value = false
  }
}

watch(() => props.mode, (newMode) => {
  isLogin.value = newMode === 'login'
})
</script>

<style scoped>
.modern-auth-modal :deep(.n-modal) {
  max-width: 900px;
  border-radius: 24px;
  overflow: hidden;
  background: transparent;
  box-shadow: none;
}

.auth-container {
  display: flex;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  overflow: hidden;
  min-height: 600px;
}

.auth-decoration {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.auth-decoration::before {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: -100px;
  right: -100px;
}

.auth-decoration::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  bottom: -50px;
  left: -50px;
}

.decoration-content {
  position: relative;
  z-index: 1;
  color: white;
  text-align: center;
}

.logo-section {
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.logo-text {
  font-size: 32px;
  font-weight: 800;
  margin: 0;
  letter-spacing: 2px;
}

.welcome-text {
  font-size: 18px;
  opacity: 0.9;
  margin: 16px 0 48px 0;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.feature-icon {
  font-size: 24px;
}

.auth-form-section {
  flex: 1;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  margin-bottom: 40px;
  text-align: center;
}

.form-title {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.form-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.auth-form {
  margin-bottom: 24px;
}

.modern-input {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.modern-input :deep(.n-input__input-el) {
  color: #fff;
}

.modern-input :deep(.n-input__placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

.input-icon {
  font-size: 18px;
  margin-right: 8px;
}

.submit-btn {
  margin-top: 24px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.form-footer {
  text-align: center;
}

.divider-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.toggle-btn {
  font-size: 16px;
  font-weight: 600;
}

/* 响应式 */
@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
  }

  .auth-decoration {
    padding: 40px 24px;
    min-height: 300px;
  }

  .auth-form-section {
    padding: 40px 24px;
  }

  .form-title {
    font-size: 24px;
  }
}
</style>

