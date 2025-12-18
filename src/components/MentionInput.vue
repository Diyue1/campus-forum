<template>
  <div class="mention-input">
    <n-input
      ref="inputRef"
      v-model:value="inputValue"
      type="textarea"
      :placeholder="placeholder"
      :rows="rows"
      @input="handleInput"
      @keydown="handleKeydown"
    />

    <!-- @提及下拉列表 -->
    <n-dropdown
      v-if="showMentionList"
      :show="showMentionList"
      :options="mentionOptions"
      :x="dropdownX"
      :y="dropdownY"
      placement="bottom-start"
      @select="handleSelectMention"
      @clickoutside="showMentionList = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { db } from '@/utils/database'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  rows?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputRef = ref()
const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const showMentionList = ref(false)
const mentionQuery = ref('')
const dropdownX = ref(0)
const dropdownY = ref(0)
const cursorPosition = ref(0)

// 获取用户列表
const users = computed(() => {
  return db.getUsers().slice(0, 20)
})

// @提及选项
const mentionOptions = computed(() => {
  if (!mentionQuery.value) {
    return users.value.slice(0, 5).map(user => ({
      label: `${user.nickname} @${user.username}`,
      key: user.id,
      user
    }))
  }

  const query = mentionQuery.value.toLowerCase()
  return users.value
    .filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.nickname.toLowerCase().includes(query)
    )
    .slice(0, 5)
    .map(user => ({
      label: `${user.nickname} @${user.username}`,
      key: user.id,
      user
    }))
})

// 处理输入
const handleInput = (value: string) => {
  const textarea = inputRef.value?.textareaElRef
  if (!textarea) return

  const cursorPos = textarea.selectionStart
  cursorPosition.value = cursorPos

  // 检查是否输入了@
  const textBeforeCursor = value.substring(0, cursorPos)
  const atIndex = textBeforeCursor.lastIndexOf('@')

  if (atIndex !== -1) {
    const textAfterAt = textBeforeCursor.substring(atIndex + 1)
    
    // 如果@后面没有空格，显示提及列表
    if (!textAfterAt.includes(' ')) {
      mentionQuery.value = textAfterAt
      showMentionList.value = true

      // 计算下拉列表位置
      const rect = textarea.getBoundingClientRect()
      dropdownX.value = rect.left
      dropdownY.value = rect.top + 30
    } else {
      showMentionList.value = false
    }
  } else {
    showMentionList.value = false
  }
}

// 处理键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  if (showMentionList.value) {
    if (e.key === 'Escape') {
      showMentionList.value = false
      e.preventDefault()
    }
  }
}

// 选择@提及
const handleSelectMention = (key: number, option: any) => {
  const textarea = inputRef.value?.textareaElRef
  if (!textarea) return

  const value = inputValue.value
  const cursorPos = cursorPosition.value
  const textBeforeCursor = value.substring(0, cursorPos)
  const atIndex = textBeforeCursor.lastIndexOf('@')

  if (atIndex !== -1) {
    const textAfterCursor = value.substring(cursorPos)
    const mention = `@${option.user.username} `
    
    inputValue.value = 
      value.substring(0, atIndex) + 
      mention + 
      textAfterCursor

    // 设置光标位置
    setTimeout(() => {
      const newPos = atIndex + mention.length
      textarea.setSelectionRange(newPos, newPos)
      textarea.focus()
    }, 0)
  }

  showMentionList.value = false
}
</script>

<style scoped>
.mention-input {
  position: relative;
}
</style>

