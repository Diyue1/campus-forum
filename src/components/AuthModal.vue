<template>
  <n-modal
    v-model:show="showModal"
    :mask-closable="false"
    preset="dialog"
    :title="isLogin ? '登录' : '注册'"
    style="width: 400px;"
  >
    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="left"
      label-width="auto"
      require-mark-placement="right-hanging"
    >
      <n-form-item
        v-if="!isLogin"
        label="昵称"
        path="nickname"
      >
        <n-input
          v-model:value="formData.nickname"
          placeholder="请输入昵称"
          :maxlength="20"
        />
      </n-form-item>
      
      <n-form-item
        label="用户名"
        path="username"
      >
        <n-input
          v-model:value="formData.username"
          placeholder="请输入用户名"
          :maxlength="20"
        />
      </n-form-item>
      
      <n-form-item
        v-if="!isLogin"
        label="邮箱"
        path="email"
      >
        <n-input
          v-model:value="formData.email"
          placeholder="请输入邮箱"
          type="email"
        />
      </n-form-item>
      
      <n-form-item
        label="密码"
        path="password"
      >
        <n-input
          v-model:value="formData.password"
          type="password"
          placeholder="请输入密码"
          show-password-on="mousedown"
        />
      </n-form-item>
      
      <n-form-item
        v-if="!isLogin"
        label="确认密码"
        path="confirmPassword"
      >
        <n-input
          v-model:value="formData.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          show-password-on="mousedown"
        />
      </n-form-item>
    </n-form>
    
    <template #action>
      <n-space
        justify="space-between"
        style="width: 100%;"
      >
        <n-space>
          <n-button
            text
            @click="toggleMode"
          >
            {{ isLogin ? '没有账号？点击注册' : '已有账号？点击登录' }}
          </n-button>
          <n-button
            v-if="isLogin"
            text
            type="primary"
            @click="showForgotPassword = true"
          >
            忘记密码？
          </n-button>
        </n-space>

        <n-space>
          <n-button @click="showModal = false">
            取消
          </n-button>
          <n-button
            type="primary"
            :loading="loading"
            @click="handleSubmit"
          >
            {{ isLogin ? '登录' : '注册' }}
          </n-button>
        </n-space>
      </n-space>
    </template>
  </n-modal>

  <!-- 忘记密码模态框 -->
  <n-modal
    v-model:show="showForgotPassword"
    preset="dialog"
    title="找回密码"
    style="width: 400px"
  >
    <n-form>
      <n-form-item label="邮箱">
        <n-input
          v-model:value="forgotEmail"
          placeholder="请输入注册邮箱"
        />
      </n-form-item>
      <n-form-item label="验证码">
        <n-space>
          <n-input
            v-model:value="forgotCode"
            placeholder="验证码"
            style="flex: 1"
          />
          <n-button
            :disabled="resetCountdown > 0"
            @click="sendResetCode"
          >
            {{ resetCountdown > 0 ? `${resetCountdown}秒` : '发送' }}
          </n-button>
        </n-space>
      </n-form-item>
      <n-form-item label="新密码">
        <n-input
          v-model:value="forgotNewPassword"
          type="password"
          placeholder="请输入新密码"
        />
      </n-form-item>
    </n-form>
    <template #action>
      <n-space justify="end">
        <n-button @click="showForgotPassword = false">
          取消
        </n-button>
        <n-button
          type="primary"
          @click="handleResetPassword"
        >
          确认重置
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { db } from '@/utils/database'
import { useUserStore } from '@/stores/user'
import { Logger } from '@/utils/logger'

const props = defineProps<{
  show: boolean
  mode?: 'login' | 'register'
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'success': [user: any]
}>()

const message = useMessage()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)
const isLogin = ref(props.mode === 'login')
const showForgotPassword = ref(false)
const forgotEmail = ref('')
const forgotCode = ref('')
const forgotNewPassword = ref('')
const resetCountdown = ref(0)

const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const formData = reactive({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 1, max: 20, message: '昵称长度应为1-20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string) => {
        return value === formData.password
      },
      message: '两次输入的密码不一致',
      trigger: 'blur'
    }
  ]
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  resetForm()
}

const resetForm = () => {
  Object.assign(formData, {
    username: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  formRef.value?.restoreValidation()
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    
    if (isLogin.value) {
      // 登录
      const user = db.login(formData.username, formData.password)
      if (user) {
        userStore.setUser(user)
        message.success('登录成功！')
        emit('success', user)
        showModal.value = false
        resetForm()
      } else {
        message.error('用户名或密码错误')
      }
    } else {
      // 注册
      const user = db.register({
        username: formData.username,
        nickname: formData.nickname,
        email: formData.email,
        password: formData.password
      })
      
      if (user) {
        userStore.setUser(user)
        message.success('注册成功！')
        emit('success', user)
        showModal.value = false
        resetForm()
      } else {
        message.error('用户名已存在')
      }
    }
  } catch (error) {
    Logger.error('表单验证失败', { 
      error: error instanceof Error ? error.message : String(error),
      mode: isLogin.value ? 'login' : 'register'
    })
  } finally {
    loading.value = false
  }
}

// 发送重置密码验证码
const sendResetCode = () => {
  if (!forgotEmail.value) {
    message.error('请输入邮箱')
    return
  }

  // 模拟发送验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  localStorage.setItem('reset_code_' + forgotEmail.value, code)
  message.success(`验证码已发送到邮箱（模拟：${code}）`)

  // 倒计时
  resetCountdown.value = 60
  const timer = setInterval(() => {
    resetCountdown.value--
    if (resetCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 重置密码
const handleResetPassword = () => {
  if (!forgotEmail.value || !forgotCode.value || !forgotNewPassword.value) {
    message.error('请填写完整信息')
    return
  }

  // 验证验证码
  const savedCode = localStorage.getItem('reset_code_' + forgotEmail.value)
  if (savedCode !== forgotCode.value) {
    message.error('验证码错误')
    return
  }

  // 查找用户并重置密码
  const users = JSON.parse(localStorage.getItem('campus_forum_users') || '[]')
  const user = users.find((u: any) => u.email === forgotEmail.value)

  if (!user) {
    message.error('该邮箱未注册')
    return
  }

  user.password = forgotNewPassword.value
  localStorage.setItem('campus_forum_users', JSON.stringify(users))
  localStorage.removeItem('reset_code_' + forgotEmail.value)

  message.success('密码重置成功，请使用新密码登录')
  showForgotPassword.value = false
  forgotEmail.value = ''
  forgotCode.value = ''
  forgotNewPassword.value = ''
}

// 监听模式变化
const handleModeChange = (mode: 'login' | 'register') => {
  isLogin.value = mode === 'login'
  resetForm()
}

defineExpose({
  handleModeChange
})
</script>

<style scoped>
.n-form {
  margin-top: 16px;
}
</style>
