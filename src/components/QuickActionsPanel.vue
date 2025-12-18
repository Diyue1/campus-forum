<template>
  <n-card
    title="快捷操作"
    class="quick-actions-panel"
  >
    <n-space
      vertical
      :size="12"
    >
      <n-button
        type="primary"
        block
        size="large"
        :disabled="!isLoggedIn"
        @click="$router.push('/create')"
      >
        <template #icon>
          <n-icon><AddCircleIcon /></n-icon>
        </template>
        发布新帖子
      </n-button>

      <n-button
        block
        @click="$router.push('/explore')"
      >
        <template #icon>
          <n-icon><CompassIcon /></n-icon>
        </template>
        探索发现
      </n-button>

      <n-button
        block
        :disabled="!isLoggedIn"
        @click="$router.push('/messages')"
      >
        <template #icon>
          <n-icon><ChatbubblesIcon /></n-icon>
        </template>
        我的消息
        <n-badge
          v-if="unreadCount > 0"
          :value="unreadCount"
          :max="99"
          style="margin-left: 8px"
        />
      </n-button>

      <n-divider style="margin: 8px 0" />

      <n-space
        vertical
        :size="8"
      >
        <n-text
          depth="3"
          style="font-size: 12px"
        >
          今日数据
        </n-text>
        <n-space justify="space-between">
          <n-text>发帖数</n-text>
          <n-text strong>
            {{ todayStats.posts }}
          </n-text>
        </n-space>
        <n-space justify="space-between">
          <n-text>获赞数</n-text>
          <n-text strong>
            {{ todayStats.likes }}
          </n-text>
        </n-space>
        <n-space justify="space-between">
          <n-text>评论数</n-text>
          <n-text strong>
            {{ todayStats.comments }}
          </n-text>
        </n-space>
      </n-space>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { db } from '@/utils/database'
import {
  AddCircle as AddCircleIcon,
  Compass as CompassIcon,
  Chatbubbles as ChatbubblesIcon
} from '@vicons/ionicons5'

const router = useRouter()
const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)

// 未读消息数
const unreadCount = computed(() => {
  if (!userStore.currentUser) return 0
  const notifications = db.getNotifications(userStore.currentUser.id)
  return notifications.filter(n => !n.read).length
})

// 今日统计
const todayStats = computed(() => {
  if (!userStore.currentUser) {
    return { posts: 0, likes: 0, comments: 0 }
  }

  const today = new Date().toDateString()
  const posts = db.getPosts().filter(p => {
    return p.authorId === userStore.currentUser!.id &&
           new Date(p.createdAt).toDateString() === today
  })

  const comments = db.getComments().filter(c => {
    return c.authorId === userStore.currentUser!.id &&
           new Date(c.createdAt).toDateString() === today
  })

  const likes = posts.reduce((sum, post) => sum + post.likes, 0)

  return {
    posts: posts.length,
    likes,
    comments: comments.length
  }
})
</script>

<style scoped>
.quick-actions-panel {
  position: sticky;
  top: 24px;
}
</style>

