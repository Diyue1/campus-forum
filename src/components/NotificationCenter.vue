<template>
  <div class="notification-center">
    <!-- 通知按钮 -->
    <n-badge
      :value="unreadCount"
      :max="99"
      :show-zero="false"
    >
      <n-button
        circle
        quaternary
        size="medium"
        class="notification-btn"
        @click="showNotifications = !showNotifications"
      >
        <template #icon>
          <n-icon size="20">
            <NotificationsIcon />
          </n-icon>
        </template>
      </n-button>
    </n-badge>

    <!-- 通知面板 -->
    <n-drawer
      v-model:show="showNotifications"
      :width="380"
      placement="right"
      class="notification-drawer"
    >
      <n-drawer-content
        title="通知中心"
        closable
      >
        <template #header-extra>
          <n-button
            text
            size="small"
            :disabled="unreadCount === 0"
            @click="markAllAsRead"
          >
            全部已读
          </n-button>
        </template>

        <!-- 通知筛选 -->
        <div class="notification-filters">
          <n-tabs
            v-model:value="activeFilter"
            type="line"
            size="small"
          >
            <n-tab-pane
              name="all"
              tab="全部"
            />
            <n-tab-pane
              name="unread"
              tab="未读"
            />
            <n-tab-pane
              name="like"
              tab="点赞"
            />
            <n-tab-pane
              name="comment"
              tab="评论"
            />
            <n-tab-pane
              name="follow"
              tab="关注"
            />
            <n-tab-pane
              name="system"
              tab="系统"
            />
          </n-tabs>
        </div>

        <!-- 通知列表 -->
        <div class="notifications-list">
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-avatar">
              <n-avatar
                :src="notification.avatar"
                size="small"
                class="avatar"
              />
              <div
                class="notification-type-icon"
                :class="`type-${notification.type}`"
              >
                <n-icon size="12">
                  <component :is="getNotificationIcon(notification.type)" />
                </n-icon>
              </div>
            </div>

            <div class="notification-content">
              <div class="notification-text">
                <span class="notification-user">{{ notification.user }}</span>
                {{ notification.action }}
                <span
                  v-if="notification.target"
                  class="notification-target"
                >
                  {{ notification.target }}
                </span>
              </div>
              <div class="notification-time">
                {{ formatTime(notification.createdAt) }}
              </div>
            </div>

            <div class="notification-actions">
              <n-button
                v-if="!notification.read"
                text
                size="tiny"
                class="mark-read-btn"
                @click.stop="markAsRead(notification.id)"
              >
                <n-icon size="14">
                  <CheckmarkIcon />
                </n-icon>
              </n-button>
              <n-button
                text
                size="tiny"
                class="delete-btn"
                @click.stop="deleteNotification(notification.id)"
              >
                <n-icon size="14">
                  <CloseIcon />
                </n-icon>
              </n-button>
            </div>
          </div>

          <!-- 空状态 -->
          <div
            v-if="filteredNotifications.length === 0"
            class="empty-notifications"
          >
            <n-empty
              description="暂无通知"
              size="small"
            >
              <template #icon>
                <n-icon
                  size="48"
                  color="#666"
                >
                  <NotificationsIcon />
                </n-icon>
              </template>
            </n-empty>
          </div>

          <!-- 加载更多 -->
          <div
            v-if="hasMore"
            class="load-more"
          >
            <n-button
              text
              size="small"
              :loading="loading"
              @click="loadMoreNotifications"
            >
              加载更多
            </n-button>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>

    <!-- 实时通知弹窗 -->
    <div
      v-if="realtimeNotification"
      class="realtime-notification"
    >
      <n-alert
        :type="getAlertType(realtimeNotification.type)"
        :title="realtimeNotification.title"
        closable
        class="notification-alert"
        @close="realtimeNotification = null"
      >
        {{ realtimeNotification.content }}
      </n-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { db } from '@/utils/database'
import { PlaceholderImages } from '@/utils/imageGenerator'
import {
  NotificationsOutline as NotificationsIcon,
  HeartOutline as LikeIcon,
  ChatbubbleEllipsesOutline as CommentIcon,
  PersonAddOutline as FollowIcon,
  InformationCircleOutline as SystemIcon,
  CheckmarkOutline as CheckmarkIcon,
  CloseOutline as CloseIcon
} from '@vicons/ionicons5'

const router = useRouter()
const userStore = useUserStore()

const showNotifications = ref(false)
const activeFilter = ref('all')
const loading = ref(false)
const hasMore = ref(true)
const realtimeNotification = ref<any>(null)

// 从数据库获取通知
const notifications = computed(() => {
  if (!userStore.currentUser) return []
  return db.getNotifications(userStore.currentUser.id)
})

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const filteredNotifications = computed(() => {
  let filtered = notifications.value

  switch (activeFilter.value) {
    case 'unread':
      filtered = filtered.filter(n => !n.read)
      break
    case 'like':
      filtered = filtered.filter(n => n.type === 'like')
      break
    case 'comment':
      filtered = filtered.filter(n => n.type === 'comment')
      break
    case 'follow':
      filtered = filtered.filter(n => n.type === 'follow')
      break
    case 'system':
      filtered = filtered.filter(n => n.type === 'system')
      break
  }

  return filtered.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    like: LikeIcon,
    comment: CommentIcon,
    follow: FollowIcon,
    system: SystemIcon
  }
  return iconMap[type] || SystemIcon
}

const getAlertType = (type: string) => {
  const typeMap: Record<string, string> = {
    like: 'success',
    comment: 'info',
    follow: 'success',
    system: 'warning'
  }
  return typeMap[type] || 'info'
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

const handleNotificationClick = (notification: any) => {
  // 标记为已读
  if (!notification.read) {
    markAsRead(notification.id)
  }

  // 根据通知类型跳转
  switch (notification.type) {
    case 'like':
    case 'comment':
      if (notification.target) {
        router.push('/') // 跳转到相关帖子
      }
      break
    case 'follow':
      router.push(`/profile/${notification.userId}`)
      break
  }

  showNotifications.value = false
}

const markAsRead = (notificationId: number) => {
  const notification = notifications.value.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
    // 保存到数据库
    if (userStore.currentUser) {
      db.markNotificationAsRead(notificationId)
    }
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(n => {
    n.read = true
    // 保存到数据库
    if (userStore.currentUser) {
      db.markNotificationAsRead(n.id)
    }
  })
}

const deleteNotification = (notificationId: number) => {
  const index = notifications.value.findIndex(n => n.id === notificationId)
  if (index > -1) {
    notifications.value.splice(index, 1)
    // 从数据库删除
    if (userStore.currentUser) {
      db.deleteNotification(notificationId)
    }
  }
}

const loadMoreNotifications = async () => {
  loading.value = true
  
  // 模拟加载更多通知
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 这里可以添加更多通知数据
  hasMore.value = false
  loading.value = false
}

// 模拟实时通知
const simulateRealtimeNotification = () => {
  const types = ['like', 'comment', 'follow']
  const users = ['新用户', '学霸小王', '摄影达人']
  const actions = {
    like: '点赞了你的帖子',
    comment: '评论了你的帖子',
    follow: '关注了你'
  }

  const type = types[Math.floor(Math.random() * types.length)]
  const user = users[Math.floor(Math.random() * users.length)]

  const newNotification = {
    id: Date.now(),
    type,
    user,
    avatar: PlaceholderImages.avatar(user[0], 40),
    action: actions[type as keyof typeof actions],
    target: type !== 'follow' ? '《校园生活分享》' : '',
    read: false,
    createdAt: new Date().toISOString()
  }

  notifications.value.unshift(newNotification)

  // 显示实时通知弹窗
  realtimeNotification.value = {
    type,
    title: '新通知',
    content: `${user}${actions[type as keyof typeof actions]}`
  }

  // 3秒后自动隐藏
  setTimeout(() => {
    realtimeNotification.value = null
  }, 3000)
}

let notificationInterval: any

onMounted(() => {
  // 模拟实时通知，每30秒一次
  notificationInterval = setInterval(simulateRealtimeNotification, 30000)
})

onUnmounted(() => {
  if (notificationInterval) {
    clearInterval(notificationInterval)
  }
})
</script>

<style scoped>
.notification-center {
  position: relative;
}

.notification-btn {
  transition: all 0.3s ease;
}

.notification-btn:hover {
  transform: scale(1.1);
}

.notification-drawer {
  --n-color: rgba(31, 31, 35, 0.95);
}

.notification-filters {
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
}

.notifications-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 8px;
  border: 1px solid transparent;
}

.notification-item:hover {
  background: rgba(255, 107, 53, 0.05);
  border-color: rgba(255, 107, 53, 0.2);
}

.notification-item.unread {
  background: rgba(255, 107, 53, 0.1);
  border-color: rgba(255, 107, 53, 0.3);
}

.notification-avatar {
  position: relative;
  flex-shrink: 0;
}

.notification-type-icon {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(31, 31, 35, 0.9);
}

.type-like {
  background: #FF6B35;
  color: white;
}

.type-comment {
  background: #00BCD4;
  color: white;
}

.type-follow {
  background: #4CAF50;
  color: white;
}

.type-system {
  background: #FF9800;
  color: white;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-text {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.notification-user {
  font-weight: 600;
  color: #FF6B35;
}

.notification-target {
  font-weight: 600;
  color: #00BCD4;
}

.notification-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.notification-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.mark-read-btn {
  color: #4CAF50;
}

.delete-btn {
  color: #F44336;
}

.empty-notifications {
  padding: 40px 0;
  text-align: center;
}

.load-more {
  text-align: center;
  padding: 16px 0;
}

.realtime-notification {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 2000;
  max-width: 320px;
}

.notification-alert {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 滚动条样式 */
.notifications-list::-webkit-scrollbar {
  width: 4px;
}

.notifications-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.notifications-list::-webkit-scrollbar-thumb {
  background: rgba(255, 107, 53, 0.5);
  border-radius: 2px;
}
</style>

