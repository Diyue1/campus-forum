<template>
  <div class="admin-dashboard">
    <h2>数据统计</h2>

    <!-- 统计卡片 -->
    <n-grid
      :cols="4"
      :x-gap="16"
      :y-gap="16"
      style="margin-bottom: 24px"
    >
      <n-gi>
        <n-card class="stat-card">
          <n-statistic
            label="总用户数"
            :value="stats.totalUsers"
          >
            <template #prefix>
              <n-icon
                size="24"
                color="#667eea"
              >
                <PeopleIcon />
              </n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card class="stat-card">
          <n-statistic
            label="总帖子数"
            :value="stats.totalPosts"
          >
            <template #prefix>
              <n-icon
                size="24"
                color="#764ba2"
              >
                <DocumentIcon />
              </n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card class="stat-card">
          <n-statistic
            label="总评论数"
            :value="stats.totalComments"
          >
            <template #prefix>
              <n-icon
                size="24"
                color="#f093fb"
              >
                <ChatbubbleIcon />
              </n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card class="stat-card">
          <n-statistic
            label="今日活跃"
            :value="stats.activeToday"
          >
            <template #prefix>
              <n-icon
                size="24"
                color="#4facfe"
              >
                <TrendingUpIcon />
              </n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 最近活动 -->
    <n-card
      title="最近活动"
      style="margin-bottom: 24px"
    >
      <n-list>
        <n-list-item
          v-for="activity in recentActivities"
          :key="activity.id"
        >
          <n-thing
            :title="activity.title"
            :description="activity.description"
          >
            <template #avatar>
              <n-avatar :src="activity.avatar" />
            </template>
            <template #footer>
              <n-text depth="3">
                {{ formatTime(activity.time) }}
              </n-text>
            </template>
          </n-thing>
        </n-list-item>
      </n-list>
    </n-card>

    <!-- 快速操作 -->
    <n-card title="快速操作">
      <n-space>
        <n-button
          type="primary"
          @click="$router.push('/admin/users')"
        >
          用户管理
        </n-button>
        <n-button
          type="info"
          @click="$router.push('/admin/posts')"
        >
          帖子管理
        </n-button>
        <n-button
          type="warning"
          @click="$router.push('/admin/comments')"
        >
          评论管理
        </n-button>
        <n-button
          type="error"
          @click="$router.push('/admin/reports')"
        >
          举报管理
        </n-button>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db } from '@/utils/database'
import {
  People as PeopleIcon,
  DocumentText as DocumentIcon,
  Chatbubble as ChatbubbleIcon,
  TrendingUp as TrendingUpIcon
} from '@vicons/ionicons5'

const stats = ref({
  totalUsers: 0,
  totalPosts: 0,
  totalComments: 0,
  activeToday: 0
})

const recentActivities = ref<any[]>([])

const loadStats = () => {
  stats.value.totalUsers = db.getUsers().length
  stats.value.totalPosts = db.getPosts().length
  stats.value.totalComments = db.getComments().length
  
  // 计算今日活跃用户
  const today = new Date().toDateString()
  const users = db.getUsers()
  stats.value.activeToday = users.filter(u => {
    const lastLogin = u.lastLoginAt ? new Date(u.lastLoginAt).toDateString() : null
    return lastLogin === today
  }).length
}

const loadRecentActivities = () => {
  const posts = db.getPosts().slice(0, 5)
  recentActivities.value = posts.map(post => {
    const author = db.getUserById(post.authorId)
    return {
      id: post.id,
      title: `${author?.nickname} 发布了新帖子`,
      description: post.title,
      avatar: author?.avatar,
      time: post.createdAt
    }
  })
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadStats()
  loadRecentActivities()
})
</script>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
}

.admin-dashboard h2 {
  color: white;
  margin-bottom: 24px;
  font-size: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.n-card) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.n-card-header) {
  color: white;
  font-weight: 600;
}

:deep(.n-statistic-label) {
  color: rgba(255, 255, 255, 0.7);
}

:deep(.n-statistic-value) {
  color: white;
}

:deep(.n-list-item) {
  color: rgba(255, 255, 255, 0.9);
}

:deep(.n-thing-header__title) {
  color: white;
}

:deep(.n-thing-header__extra) {
  color: rgba(255, 255, 255, 0.7);
}
</style>

