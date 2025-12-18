<template>
  <div class="messages-container cyber-page-container">
    <CyberDecor />
    <div class="cyber-content">
      <!-- 消息头部 -->
      <div class="messages-header">
        <h1 class="messages-title cyber-title">
          私信
        </h1>
        <div class="header-actions">
          <n-button
            type="success"
            style="margin-right: 8px"
            @click="chatWithAI"
          >
            <template #icon>
              <n-icon><SparklesIcon /></n-icon>
            </template>
            AI助手
          </n-button>
          <n-button
            type="primary"
            @click="startNewChat"
          >
            <template #icon>
              <n-icon><CreateIcon /></n-icon>
            </template>
            发起对话
          </n-button>
        </div>
      </div>

      <div class="messages-content">
        <!-- 对话列表 -->
        <div class="conversations-sidebar cyber-card">
          <div class="sidebar-header">
            <h3>对话列表</h3>
            <n-badge
              v-if="unreadCount > 0"
              :value="unreadCount"
              type="error"
            />
          </div>
        
          <div class="conversations-list">
            <div
              v-for="conversation in conversations"
              :key="conversation.id"
              class="conversation-item"
              :class="{ active: selectedConversation?.id === conversation.id }"
              @click="selectConversation(conversation)"
            >
              <div class="conversation-avatar">
                <img
                  :src="getOtherUser(conversation)?.avatar"
                  :alt="getOtherUser(conversation)?.nickname"
                  @error="handleAvatarError"
                >
              </div>
              <div class="conversation-info">
                <div class="conversation-name">
                  {{ getOtherUser(conversation)?.nickname || '未知用户' }}
                </div>
                <div class="conversation-preview">
                  {{ conversation.lastMessage?.content || '暂无消息' }}
                </div>
              </div>
              <div class="conversation-meta">
                <div class="conversation-time">
                  {{ formatTime(conversation.lastMessage?.createdAt || conversation.updatedAt) }}
                </div>
                <n-badge
                  v-if="conversation.unreadCount > 0"
                  :value="conversation.unreadCount"
                  type="error"
                  size="small"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 聊天窗口 -->
        <div class="chat-window cyber-card">
          <div
            v-if="!selectedConversation"
            class="no-conversation"
          >
            <div class="no-conversation-icon">
              💬
            </div>
            <div class="no-conversation-text">
              选择一个对话开始聊天
            </div>
          </div>

          <div
            v-else
            class="chat-container"
          >
            <!-- 聊天头部 -->
            <div class="chat-header">
              <div class="chat-user-info">
                <img
                  :src="getOtherUser(selectedConversation)?.avatar"
                  :alt="getOtherUser(selectedConversation)?.nickname"
                  class="chat-user-avatar"
                  @error="handleAvatarError"
                >
                <div class="chat-user-details">
                  <div class="chat-user-name">
                    {{ getOtherUser(selectedConversation)?.nickname || '未知用户' }}
                  </div>
                  <div class="chat-user-status">
                    {{ getOtherUser(selectedConversation)?.isOnline ? '在线' : '离线' }}
                  </div>
                </div>
              </div>
              <div class="chat-actions">
                <n-button
                  size="small"
                  @click="viewProfile"
                >
                  <template #icon>
                    <n-icon><PersonIcon /></n-icon>
                  </template>
                  查看资料
                </n-button>
              </div>
            </div>

            <!-- 消息列表 -->
            <div
              ref="messagesListRef"
              class="messages-list"
              @scroll="handleScroll"
            >
              <div
                v-for="message in messages"
                :key="message.id"
                class="message-item"
                :class="{ 'own-message': message.senderId === currentUser?.id }"
              >
                <div class="message-content">
                  <div class="message-text">
                    {{ message.content }}
                  </div>
                  <div class="message-time">
                    {{ formatTime(message.createdAt) }}
                  </div>
                  <div
                    v-if="message.isRead && message.senderId === currentUser?.id"
                    class="message-status"
                  >
                    已读
                  </div>
                </div>
                <n-button
                  v-if="message.senderId === currentUser?.id"
                  text
                  size="tiny"
                  type="error"
                  class="delete-message-btn"
                  @click="deleteMessage(message.id)"
                >
                  <n-icon size="14">
                    <CloseIcon />
                  </n-icon>
                </n-button>
              </div>
            </div>

            <!-- 消息输入 -->
            <div class="message-input">
              <n-input
                v-model:value="newMessage"
                placeholder="输入消息..."
                :disabled="!currentUser"
                @keyup.enter="sendMessage"
              />
              <n-button
                type="primary"
                :disabled="!newMessage.trim() || !currentUser"
                @click="sendMessage"
              >
                <template #icon>
                  <n-icon><SendIcon /></n-icon>
                </template>
                发送
              </n-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 发起新对话模态框 -->
      <n-modal
        v-model:show="showNewChatModal"
        preset="card"
        title="发起新对话"
        size="medium"
      >
        <div class="new-chat-form">
          <n-form-item label="选择用户">
            <n-select
              v-model:value="selectedUserId"
              :options="userOptions"
              placeholder="搜索用户..."
              filterable
              clearable
            />
          </n-form-item>
          <div class="form-actions">
            <n-button @click="showNewChatModal = false">
              取消
            </n-button>
            <n-button
              type="primary"
              :disabled="!selectedUserId"
              @click="createNewChat"
            >
              开始对话
            </n-button>
          </div>
        </div>
      </n-modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { db, type Conversation, type Message } from '@/utils/database'
import { PlaceholderImages } from '@/utils/imageGenerator'
import {
  CreateOutline as CreateIcon,
  PersonOutline as PersonIcon,
  SendOutline as SendIcon,
  Sparkles as SparklesIcon,
  Close as CloseIcon
} from '@vicons/ionicons5'

// AI对话历史
const conversationHistory = ref<Array<{role: string, content: string}>>([])

const messageApi = useMessage()
const userStore = useUserStore()
const router = useRouter()

const currentUser = computed(() => userStore.currentUser)
const conversations = ref<Conversation[]>([])
const selectedConversation = ref<Conversation | null>(null)
const messages = ref<Message[]>([])
const newMessage = ref('')
const unreadCount = ref(0)
const showNewChatModal = ref(false)
const selectedUserId = ref<number | null>(null)
const messagesListRef = ref<HTMLElement>()

// 用户选项
const userOptions = computed(() => {
  const users = db.getUsers()
  return users
    .filter(user => user.id !== currentUser.value?.id)
    .map(user => ({
      label: user.nickname,
      value: user.id
    }))
})

// 加载对话列表
const loadConversations = () => {
  if (!currentUser.value) return
  
  conversations.value = db.getConversations(currentUser.value.id)
  unreadCount.value = db.getUnreadCount(currentUser.value.id)
}

// 选择对话
const selectConversation = (conversation: Conversation) => {
  selectedConversation.value = conversation
  
  if (!currentUser.value) return
  
  // 加载消息
  const otherUserId = conversation.participants.find(id => id !== currentUser.value!.id)
  if (otherUserId) {
    messages.value = db.getMessagesBetweenUsers(currentUser.value.id, otherUserId)
    
    // 标记消息为已读
    db.markUserMessagesAsRead(currentUser.value.id, otherUserId)
    db.clearConversationUnread(conversation.id)
    
    // 更新未读数量
    unreadCount.value = db.getUnreadCount(currentUser.value.id)
  }
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

// 发送消息
const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentUser.value || !selectedConversation.value) return

  const otherUserId = selectedConversation.value.participants.find(id => id !== currentUser.value!.id)
  if (!otherUserId) return

  const messageText = newMessage.value.trim()

  const sentMessage = db.sendMessage(
    currentUser.value.id,
    otherUserId,
    messageText
  )
  
  messages.value.push(sentMessage)
  newMessage.value = ''

  // 更新对话列表
  loadConversations()

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })

  messageApi.success('消息发送成功')

  // 如果是AI助手，自动回复
  if (otherUserId === -1) {
    await getAIResponse(messageText)
  }
}

// AI助手对话
const chatWithAI = () => {
  if (!currentUser.value) {
    messageApi.error('请先登录')
    return
  }

  // 创建或选择AI助手对话
  let aiConversation = conversations.value.find(c => c.participants.includes(-1))

  if (!aiConversation) {
    // 创建AI助手对话
    aiConversation = {
      id: Date.now(),
      participants: [currentUser.value.id, -1],
      lastMessage: null,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    conversations.value.unshift(aiConversation)
  }

  selectConversation(aiConversation)
}

// 获取AI回复
const getAIResponse = async (userMessage: string) => {
  if (!currentUser.value) return

  try {
    // 显示"正在输入..."
    const typingMessage = {
      id: Date.now(),
      senderId: -1,
      receiverId: currentUser.value.id,
      content: '正在思考...',
      read: false,
      createdAt: new Date().toISOString()
    }
    messages.value.push(typingMessage)

    nextTick(() => {
      scrollToBottom()
    })

    // 调用AI API
    const aiResponse = await callAIAPI(userMessage)

    // 移除"正在输入..."
    messages.value = messages.value.filter(m => m.id !== typingMessage.id)

    // 添加AI回复
    const aiMessage = db.sendMessage(-1, currentUser.value.id, aiResponse)
    messages.value.push(aiMessage)

    // 更新对话列表
    loadConversations()

    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    messageApi.error('AI助手暂时无法回复，请稍后再试')
  }
}

// 调用AI API
const callAIAPI = async (userMessage: string): Promise<string> => {
  // 使用本地智能回复
  const response = getSmartResponse(userMessage)

  // 更新对话历史
  conversationHistory.value.push(
    { role: 'user', content: userMessage },
    { role: 'assistant', content: response }
  )

  // 限制历史记录长度（保留最近10轮对话）
  if (conversationHistory.value.length > 20) {
    conversationHistory.value = conversationHistory.value.slice(-20)
  }

  return response
}

// 智能回复逻辑
const getSmartResponse = (message: string): string => {
  const msg = message.toLowerCase()

  // 问候
  if (msg.includes('你好') || msg.includes('hi') || msg.includes('hello')) {
    return '你好！我是AI助手，很高兴为你服务。有什么我可以帮助你的吗？'
  }

  // 论坛相关
  if (msg.includes('怎么发帖') || msg.includes('如何发帖')) {
    return '发帖很简单！点击首页的"发布新帖子"按钮，填写标题和内容，选择话题，就可以发布了。你还可以添加图片、表情和投票哦！'
  }

  if (msg.includes('签到') || msg.includes('经验')) {
    return '每天签到可以获得经验值！连续签到奖励更多：\n• 每日签到：+5 经验\n• 连续3天：+10 经验\n• 连续7天：+20 经验\n• 连续30天：+100 经验 + 专属徽章'
  }

  if (msg.includes('等级') || msg.includes('升级')) {
    return '等级系统基于经验值，你可以通过以下方式获得经验：\n• 每日签到\n• 发布帖子\n• 获得点赞\n• 精彩评论\n等级越高，权限越多哦！'
  }

  // 功能介绍
  if (msg.includes('功能') || msg.includes('能做什么')) {
    return '我们的论坛功能丰富：\n• 发帖、评论、点赞\n• @提及、投票、表情\n• 私信、关注、收藏\n• 每日签到、等级系统\n• 草稿箱、富文本编辑\n还有更多功能等你探索！'
  }

  // 帮助
  if (msg.includes('帮助') || msg.includes('help')) {
    return '我可以帮你：\n• 了解论坛功能\n• 解答使用问题\n• 提供操作指导\n• 闲聊互动\n有什么想问的尽管说！'
  }

  // 感谢
  if (msg.includes('谢谢') || msg.includes('感谢') || msg.includes('thanks')) {
    return '不客气！很高兴能帮到你。如果还有其他问题，随时问我哦！😊'
  }

  // 再见
  if (msg.includes('再见') || msg.includes('拜拜') || msg.includes('bye')) {
    return '再见！祝你使用愉快！有需要随时来找我！👋'
  }

  // 默认回复
  const defaultResponses = [
    '这是个有趣的问题！让我想想... 🤔',
    '我理解你的意思。你可以试试在论坛里发帖讨论这个话题，会有更多人给你建议！',
    '关于这个问题，建议你可以：\n1. 查看论坛的使用指南\n2. 在发现页面搜索相关内容\n3. 向其他用户请教',
    '很高兴和你聊天！如果你有关于论坛使用的问题，我会尽力帮助你。',
    '这个话题很有意思！你可以在论坛发帖，和大家一起讨论。'
  ]

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesListRef.value) {
    nextTick(() => {
      messagesListRef.value.scrollTop = messagesListRef.value.scrollHeight
    })
  }
}

// 处理滚动事件
const handleScroll = () => {
  // 可以在这里添加滚动到顶部加载更多消息的逻辑
}

// 获取对话中的另一个用户
const getOtherUser = (conversation: Conversation) => {
  if (!currentUser.value) return null

  const otherUserId = conversation.participants.find(id => id !== currentUser.value!.id)
  if (!otherUserId) return null

  // AI助手
  if (otherUserId === -1) {
    return {
      id: -1,
      username: 'ai_assistant',
      nickname: 'AI助手',
      avatar: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%234CAF50" width="100" height="100"/><text x="50" y="50" font-size="40" text-anchor="middle" dy=".3em" fill="white">🤖</text></svg>',
      email: 'ai@campus.com',
      bio: '我是AI助手，随时为你服务！',
      role: 'user' as const,
      status: 'active' as const,
      posts: 0,
      followers: 0,
      following: 0,
      likes: 0,
      level: 99,
      exp: 99999,
      joinDate: new Date().toISOString(),
      password: ''
    }
  }

  return db.getUserById(otherUserId)
}

// 格式化时间
const formatTime = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffHours < 1) return '刚刚'
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return date.toLocaleDateString()
}

// 发起新对话
const startNewChat = () => {
  showNewChatModal.value = true
}

// 创建新对话
const createNewChat = () => {
  if (!selectedUserId.value || !currentUser.value) return
  
  // 检查是否已存在对话
  const existingConversation = conversations.value.find(conv => 
    conv.participants.includes(selectedUserId.value!)
  )
  
  if (existingConversation) {
    selectConversation(existingConversation)
  } else {
    // 创建新对话
    const newMessage = db.sendMessage(
      currentUser.value.id,
      selectedUserId.value,
      '你好！'
    )
    
    // 重新加载对话列表
    loadConversations()
    
    // 选择新对话
    const newConversation = conversations.value.find(conv => 
      conv.participants.includes(selectedUserId.value!)
    )
    if (newConversation) {
      selectConversation(newConversation)
    }
  }
  
  showNewChatModal.value = false
  selectedUserId.value = null
}

// 查看用户资料
// 删除消息
const deleteMessage = (messageId: number) => {
  if (!confirm('确定要删除这条消息吗？')) return

  // 从列表中移除
  const index = messages.value.findIndex(m => m.id === messageId)
  if (index > -1) {
    messages.value.splice(index, 1)
  }

  // 从数据库删除
  db.deleteMessage(messageId)

  messageApi.success('消息已删除')
}

const viewProfile = () => {
  if (!selectedConversation.value || !currentUser.value) return
  
  const otherUserId = selectedConversation.value.participants.find(id => id !== currentUser.value!.id)
  if (otherUserId) {
    router.push(`/profile/${otherUserId}`)
  }
}

// 头像错误处理
const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = PlaceholderImages.avatar('U', 40)
}

// 监听消息变化，自动滚动
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

onMounted(() => {
  if (currentUser.value) {
    loadConversations()
  }
})
</script>

<style scoped>
.messages-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  /* cyber-page-container 样式已在全局定义 */
}

.messages-header {
  background: var(--cyber-gradient-2);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid rgba(0, 255, 255, 0.3);
  padding: 20px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(0, 255, 255, 0.1);
  position: relative;
  z-index: 10;
}

.messages-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  /* cyber-title 样式已在全局定义 */
}

.header-actions {
  display: flex;
  gap: 12px;
}

.messages-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.conversations-sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  border-right: 2px solid rgba(0, 255, 255, 0.2);
  /* cyber-card 样式已在全局定义 */
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 2px solid rgba(0, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--cyber-gradient-3);
  box-shadow: 0 2px 10px rgba(0, 255, 255, 0.1);
}

.sidebar-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--cyber-cyan);
  margin: 0;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.conversations-list::-webkit-scrollbar {
  width: 8px;
}

.conversations-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.conversations-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--cyber-cyan), var(--cyber-purple));
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.conversations-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--cyber-pink), var(--cyber-cyan));
  box-shadow: 0 0 20px rgba(255, 0, 128, 0.7);
}

.conversation-item {
  padding: 14px 20px;
  margin: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 255, 255, 0.02);
  border: 1px solid transparent;
  position: relative;
}

.conversation-item:hover {
  background: rgba(0, 255, 255, 0.08);
  border-color: rgba(0, 255, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.15);
  transform: translateX(4px);
}

.conversation-item.active {
  background: linear-gradient(90deg, 
    rgba(255, 0, 128, 0.15) 0%, 
    rgba(255, 107, 53, 0.1) 50%,
    rgba(255, 215, 0, 0.08) 100%) !important;
  border-left: 4px solid var(--cyber-pink) !important;
  border-radius: 0 8px 8px 0 !important;
  box-shadow: 
    0 0 30px rgba(255, 0, 128, 0.4),
    inset 0 0 30px rgba(255, 107, 53, 0.1) !important;
  transform: translateX(0) !important;
}

.conversation-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--cyber-cyan);
  box-shadow: 
    0 0 15px rgba(0, 255, 255, 0.4),
    inset 0 0 10px rgba(0, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.conversation-item:hover .conversation-avatar img {
  border-color: var(--cyber-pink);
  box-shadow: 
    0 0 20px rgba(255, 0, 128, 0.6),
    inset 0 0 15px rgba(255, 0, 128, 0.2);
  transform: scale(1.05);
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
}

.conversation-preview {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.conversation-time {
  font-size: 10px;
  color: rgba(0, 255, 255, 0.6);
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* cyber-card 样式已在全局定义 */
}

.no-conversation {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(0, 255, 255, 0.5);
}

.no-conversation-icon {
  font-size: 80px;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.5));
  animation: float-icon 3s ease-in-out infinite;
}

@keyframes float-icon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.no-conversation-text {
  font-size: 16px;
  color: var(--cyber-cyan);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 16px 24px;
  border-bottom: 2px solid rgba(0, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--cyber-gradient-3);
  box-shadow: 0 2px 10px rgba(0, 255, 255, 0.1);
}

.chat-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--cyber-cyan);
  box-shadow: 
    0 0 15px rgba(0, 255, 255, 0.4),
    inset 0 0 10px rgba(0, 255, 255, 0.1);
}

.chat-user-details {
  display: flex;
  flex-direction: column;
}

.chat-user-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.chat-user-status {
  font-size: 12px;
  color: var(--cyber-green);
  display: flex;
  align-items: center;
  gap: 6px;
}

.chat-user-status::before {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--cyber-green);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--cyber-green);
  animation: cyber-pulse 2s infinite;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.messages-list {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 300px);
  min-height: 400px;
  background: rgba(0, 0, 0, 0.2);
}

.messages-list::-webkit-scrollbar {
  width: 8px;
}

.messages-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.messages-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--cyber-cyan), var(--cyber-purple));
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.messages-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--cyber-pink), var(--cyber-cyan));
  box-shadow: 0 0 20px rgba(255, 0, 128, 0.7);
}

.message-item {
  display: flex;
  justify-content: flex-start;
}

.message-item.own-message {
  justify-content: flex-end;
}

.message-content {
  max-width: 70%;
  background: var(--cyber-gradient-2);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 16px;
  padding: 12px 16px;
  position: relative;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.message-content:hover {
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(0, 255, 255, 0.2);
  transform: translateY(-1px);
}

.message-item.own-message .message-content {
  background: linear-gradient(135deg, 
    rgba(255, 0, 128, 0.15) 0%, 
    rgba(128, 0, 255, 0.12) 100%);
  border-color: rgba(255, 0, 128, 0.4);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(255, 0, 128, 0.2);
}

.message-text {
  font-size: 14px;
  color: #fff;
  line-height: 1.6;
  margin-bottom: 6px;
  word-wrap: break-word;
}

.message-time {
  font-size: 10px;
  color: rgba(0, 255, 255, 0.5);
}

.message-status {
  font-size: 10px;
  color: var(--cyber-green);
  margin-top: 2px;
  text-shadow: 0 0 5px rgba(0, 255, 65, 0.5);
}

.message-input {
  padding: 20px 24px;
  border-top: 2px solid rgba(0, 255, 255, 0.2);
  display: flex;
  gap: 12px;
  align-items: center;
  background: var(--cyber-gradient-3);
  box-shadow: 0 -2px 10px rgba(0, 255, 255, 0.1);
}

.message-input :deep(.n-input) {
  flex: 1;
  background: rgba(0, 255, 255, 0.05);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.message-input :deep(.n-input:focus-within) {
  border-color: var(--cyber-cyan);
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.3),
    inset 0 0 10px rgba(0, 255, 255, 0.1);
  background: rgba(0, 255, 255, 0.08);
}

.message-input :deep(.n-input__input-el) {
  color: #fff;
}

.message-input :deep(.n-input__input-el::placeholder) {
  color: rgba(0, 255, 255, 0.4);
}

.new-chat-form {
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
  .conversations-sidebar {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid var(--interknot-border-primary);
  }
  
  .messages-content {
    flex-direction: column;
  }
  
  .conversation-item {
    padding: 8px 12px;
  }
  
  .conversation-avatar img {
    width: 32px;
    height: 32px;
  }
  
  .conversation-name {
    font-size: 13px;
  }
  
  .conversation-preview {
    font-size: 11px;
  }
}
</style>