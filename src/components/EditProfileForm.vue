<template>
  <n-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-placement="top"
    class="edit-profile-form"
  >
    <n-form-item
      label="昵称"
      path="nickname"
    >
      <n-input
        v-model:value="formData.nickname"
        placeholder="请输入昵称"
        maxlength="20"
        show-count
      />
    </n-form-item>

    <n-form-item
      label="用户名"
      path="username"
    >
      <n-input
        v-model:value="formData.username"
        placeholder="请输入用户名"
        maxlength="20"
        show-count
      />
    </n-form-item>

    <n-form-item
      label="邮箱"
      path="email"
    >
      <n-input
        v-model:value="formData.email"
        placeholder="请输入邮箱地址"
        type="email"
      />
    </n-form-item>

    <n-form-item
      label="个人简介"
      path="bio"
    >
      <n-input
        v-model:value="formData.bio"
        type="textarea"
        placeholder="介绍一下自己吧..."
        :rows="4"
        maxlength="200"
        show-count
      />
    </n-form-item>

    <n-form-item>
      <n-space justify="end">
        <n-button @click="$emit('cancel')">
          取消
        </n-button>
        <n-button
          type="primary"
          :loading="saving"
          class="save-btn"
          @click="handleSave"
        >
          保存
        </n-button>
      </n-space>
    </n-form-item>
  </n-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useMessage } from 'naive-ui'

interface User {
  nickname: string
  username: string
  email: string
  bio?: string
}

const props = defineProps<{
  user: User
}>()

const emit = defineEmits<{
  save: [user: User]
  cancel: []
}>()

const message = useMessage()
const formRef = ref()
const saving = ref(false)

const formData = reactive({
  nickname: props.user.nickname || '',
  username: props.user.username || '',
  email: props.user.email || '',
  bio: props.user.bio || ''
})

const rules = {
  nickname: {
    required: true,
    message: '请输入昵称',
    trigger: 'blur'
  },
  username: {
    required: true,
    message: '请输入用户名',
    trigger: 'blur'
  },
  email: {
    required: true,
    message: '请输入邮箱地址',
    trigger: 'blur'
  }
}

const handleSave = async () => {
  try {
    await formRef.value?.validate()

    saving.value = true

    // 更新用户信息
    if (userStore.currentUser) {
      userStore.updateUser({
        nickname: formData.nickname,
        username: formData.username,
        email: formData.email,
        bio: formData.bio
      })

      message.success('资料更新成功')
      emit('save', { ...formData })
    }

  } catch (error) {
    message.error('请检查表单内容')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.edit-profile-form {
  padding: 16px 0;
}

.save-btn {
  background: linear-gradient(45deg, #FF6B35, #FF9800);
  border: none;
  font-weight: 600;
}

:deep(.n-form-item-label) {
  color: #FFFFFF;
  font-weight: 600;
}

:deep(.n-input__input-el) {
  color: #FFFFFF;
}

:deep(.n-input__placeholder) {
  color: rgba(255, 255, 255, 0.4);
}
</style>


