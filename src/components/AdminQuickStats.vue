<template>
  <n-space
    vertical
    :size="16"
  >
    <!-- 快速统计卡片 -->
    <n-grid
      :cols="4"
      :x-gap="16"
    >
      <n-gi
        v-for="stat in stats"
        :key="stat.key"
      >
        <n-card
          class="stat-card"
          :class="`stat-card-${stat.type}`"
          hoverable
          @click="handleStatClick(stat.key)"
        >
          <n-space
            vertical
            align="center"
            :size="8"
          >
            <n-icon
              :size="32"
              :color="stat.color"
            >
              <component :is="stat.icon" />
            </n-icon>
            <n-statistic
              :value="stat.value"
              class="stat-value"
            >
              <template #suffix>
                <n-text
                  :depth="3"
                  style="font-size: 14px"
                >
                  {{ stat.unit }}
                </n-text>
              </template>
            </n-statistic>
            <n-text>{{ stat.label }}</n-text>
            <n-space
              v-if="stat.trend"
              align="center"
              :size="4"
            >
              <n-icon
                :size="16"
                :color="stat.trend > 0 ? '#4CAF50' : '#F44336'"
              >
                <ArrowUpIcon v-if="stat.trend > 0" />
                <ArrowDownIcon v-else />
              </n-icon>
              <n-text
                :type="stat.trend > 0 ? 'success' : 'error'"
                style="font-size: 12px"
              >
                {{ Math.abs(stat.trend) }}%
              </n-text>
            </n-space>
          </n-space>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 最近活动 -->
    <n-card
      title="最近活动"
      class="recent-activity-card"
    >
      <n-timeline>
        <n-timeline-item
          v-for="activity in recentActivities"
          :key="activity.id"
          :type="activity.type"
          :time="formatTime(activity.time)"
        >
          <template #icon>
            <n-icon>
              <component :is="activity.icon" />
            </n-icon>
          </template>
          <n-space
            vertical
            :size="4"
          >
            <n-text>{{ activity.title }}</n-text>
            <n-text
              depth="3"
              style="font-size: 12px"
            >
              {{ activity.description }}
            </n-text>
          </n-space>
        </n-timeline-item>
      </n-timeline>
    </n-card>

    <!-- 系统健康状态 -->
    <n-card
      title="系统状态"
      class="system-health-card"
    >
      <n-space
        vertical
        :size="12"
      >
        <div
          v-for="health in systemHealth"
          :key="health.name"
          class="health-item"
        >
          <n-space
            justify="space-between"
            align="center"
          >
            <n-space align="center">
              <n-icon
                :size="20"
                :color="health.color"
              >
                <component :is="health.icon" />
              </n-icon>
              <n-text>{{ health.name }}</n-text>
            </n-space>
            <n-tag
              :type="health.status"
              size="small"
            >
              {{ health.statusText }}
            </n-tag>
          </n-space>
          <n-progress
            :percentage="health.percentage"
            :status="health.status"
            :show-indicator="false"
            style="margin-top: 8px"
          />
        </div>
      </n-space>
    </n-card>
  </n-space>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { db } from '@/utils/database'
import {
  People as PeopleIcon,
  Document as DocumentIcon,
  Chatbubbles as ChatbubblesIcon,
  Alert as AlertIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  PersonAdd as PersonAddIcon,
  Create as CreateIcon,
  Trash as TrashIcon,
  Server as ServerIcon,
  HardwareChip as DatabaseIcon,
  Cloud as CloudIcon
} from '@vicons/ionicons5'

interface Stat {
  key: string
  label: string
  value: number
  unit?: string
  color: string
  type: string
  icon: any
  trend?: number
}

const emit = defineEmits(['stat-click'])

// 统计数据
const stats = computed<Stat[]>(() => {
  const users = db.getUsers()
  const posts = db.getPosts()
  const comments = db.getComments()
  const pendingPosts = posts.filter(p => p.status === 'pending')

  return [
    {
      key: 'users',
      label: '总用户',
      value: users.length,
      color: '#4CAF50',
      type: 'success',
      icon: PeopleIcon,
      trend: 12
    },
    {
      key: 'posts',
      label: '总帖子',
      value: posts.length,
      color: '#2196F3',
      type: 'info',
      icon: DocumentIcon,
      trend: 8
    },
    {
      key: 'comments',
      label: '总评论',
      value: comments.length,
      color: '#FF9800',
      type: 'warning',
      icon: ChatbubblesIcon,
      trend: -3
    },
    {
      key: 'pending',
      label: '待审核',
      value: pendingPosts.length,
      color: '#F44336',
      type: 'error',
      icon: AlertIcon
    }
  ]
})

// 最近活动
const recentActivities = computed(() => {
  const activities = []
  const users = db.getUsers().sort((a, b) => 
    new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
  ).slice(0, 3)
  
  const posts = db.getPosts().sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 3)

  users.forEach(user => {
    activities.push({
      id: `user-${user.id}`,
      type: 'success',
      icon: PersonAddIcon,
      title: '新用户注册',
      description: `${user.nickname} 加入了论坛`,
      time: user.joinDate
    })
  })

  posts.forEach(post => {
    activities.push({
      id: `post-${post.id}`,
      type: 'info',
      icon: CreateIcon,
      title: '新帖子发布',
      description: post.title,
      time: post.createdAt
    })
  })

  return activities.sort((a, b) => 
    new Date(b.time).getTime() - new Date(a.time).getTime()
  ).slice(0, 5)
})

// 系统健康状态
const systemHealth = computed(() => {
  const totalStorage = 5 * 1024 * 1024 // 5MB
  const usedStorage = new Blob([JSON.stringify(localStorage)]).size
  const storagePercentage = (usedStorage / totalStorage) * 100

  return [
    {
      name: '存储空间',
      percentage: storagePercentage,
      status: storagePercentage > 80 ? 'error' : storagePercentage > 60 ? 'warning' : 'success',
      statusText: storagePercentage > 80 ? '紧张' : storagePercentage > 60 ? '正常' : '良好',
      color: storagePercentage > 80 ? '#F44336' : storagePercentage > 60 ? '#FF9800' : '#4CAF50',
      icon: DatabaseIcon
    },
    {
      name: '系统性能',
      percentage: 85,
      status: 'success',
      statusText: '良好',
      color: '#4CAF50',
      icon: ServerIcon
    },
    {
      name: '网络状态',
      percentage: 95,
      status: 'success',
      statusText: '优秀',
      color: '#4CAF50',
      icon: CloudIcon
    }
  ]
})

const handleStatClick = (key: string) => {
  emit('stat-click', key)
}

const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
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
</script>

<style scoped>
.stat-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.stat-card-success {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
  border-color: rgba(76, 175, 80, 0.3);
}

.stat-card-info {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%);
  border-color: rgba(33, 150, 243, 0.3);
}

.stat-card-warning {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%);
  border-color: rgba(255, 152, 0, 0.3);
}

.stat-card-error {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%);
  border-color: rgba(244, 67, 54, 0.3);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
}

.recent-activity-card,
.system-health-card {
  background: rgba(255, 255, 255, 0.02);
}

.health-item {
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}
</style>

