<template>
  <div class="chat-window">
    <!-- 聊天消息区域 -->
    <div
      ref="messagesContainer"
      class="chat-messages"
    >
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-item"
        :class="{ 'own-message': msg.isOwn }"
      >
        <n-avatar
          v-if="!msg.isOwn"
          :src="conversation.avatar"
          size="small"
          class="message-avatar"
        />
        <div class="message-content">
          <div class="message-bubble">
            {{ msg.content }}
          </div>
          <div class="message-time">
            {{ formatTime(msg.createdAt) }}
          </div>
        </div>
        <n-avatar
          v-if="msg.isOwn"
          src="PlaceholderImages.avatar('U', 32)"
          size="small"
          class="message-avatar"
        />
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-area">
      <n-input
        v-model:value="inputMessage"
        type="textarea"
        placeholder="输入消息..."
        :rows="2"
        class="message-input"
        @keydown.enter.prevent="handleSendMessage"
      />
      <div class="input-actions">
        <n-space justify="end">
          <n-button
            type="primary"
            :disabled="!inputMessage.trim()"
            class="send-btn"
            @click="handleSendMessage"
          >
            <template #icon>
              <n-icon>
                <SendIcon />
              </n-icon>
            </template>
            发送
          </n-button>
        </n-space>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { SendOutline as SendIcon } from '@vicons/ionicons5'
import { PlaceholderImages } from '@/utils/imageGenerator'

interface Conversation {
  id: number
  name: string
  avatar: string
}

const props = defineProps<{
  conversation: Conversation
}>()

const emit = defineEmits<{
  sendMessage: [content: string]
}>()

const inputMessage = ref('')
const messagesContainer = ref<HTMLElement>()

// 模拟聊天消息
const messages = ref([
  {
    id: 1,
    content: '你好，想请教一下关于编程的问题',
    isOwn: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    content: '当然可以，有什么问题尽管问吧！',
    isOwn: true,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    content: '我在学习Vue3的时候遇到了一些困难，能帮我看看吗？',
    isOwn: false,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  }
])

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const handleSendMessage = () => {
  if (!inputMessage.value.trim()) return

  const newMessage = {
    id: messages.value.length + 1,
    content: inputMessage.value,
    isOwn: true,
    createdAt: new Date().toISOString()
  }

  messages.value.push(newMessage)
  emit('sendMessage', inputMessage.value)
  inputMessage.value = ''
  
  scrollToBottom()

  // 模拟对方回复
  setTimeout(() => {
    const replyMessage = {
      id: messages.value.length + 1,
      content: '收到你的消息了，我会尽快回复的！',
      isOwn: false,
      createdAt: new Date().toISOString()
    }
    messages.value.push(replyMessage)
    scrollToBottom()
  }, 1000)
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-window {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.message-item.own-message {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  border: 1px solid rgba(255, 107, 53, 0.3);
}

.message-content {
  max-width: 70%;
}

.own-message .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  margin-bottom: 4px;
}

.message-item:not(.own-message) .message-bubble {
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  border-bottom-left-radius: 6px;
}

.own-message .message-bubble {
  background: linear-gradient(45deg, #FF6B35, #FF9800);
  color: #FFFFFF;
  border-bottom-right-radius: 6px;
}

.message-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  padding: 0 4px;
}

.chat-input-area {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
}

.message-input {
  margin-bottom: 12px;
  --n-border: 1px solid rgba(255, 107, 53, 0.3);
  --n-border-hover: 1px solid rgba(255, 107, 53, 0.5);
  --n-border-focus: 1px solid #FF6B35;
  --n-background-color: rgba(255, 255, 255, 0.05);
}

.send-btn {
  background: linear-gradient(45deg, #FF6B35, #FF9800);
  border: none;
  font-weight: 600;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(255, 107, 53, 0.5);
  border-radius: 2px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 107, 53, 0.7);
}

:deep(.n-input__input-el) {
  color: #FFFFFF;
}

:deep(.n-input__placeholder) {
  color: rgba(255, 255, 255, 0.4);
}
</style>


