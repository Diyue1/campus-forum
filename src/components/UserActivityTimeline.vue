<template>
  <n-card
    title="最近活动"
    class="activity-timeline"
  >
    <n-timeline>
      <n-timeline-item
        v-for="activity in activities"
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
          <n-button
            v-if="activity.link"
            text
            size="tiny"
            type="primary"
            @click="$router.push(activity.link)"
          >
            查看详情 →
          </n-button>
        </n-space>
      </n-timeline-item>
    </n-timeline>

    <n-empty
      v-if="activities.length === 0"
      description="暂无活动记录"
      style="margin: 24px 0"
    />
  </n-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { db } from '@/utils/database'
import {
  Create as CreateIcon,
  Chatbubble as CommentIcon,
  Heart as LikeIcon,
  PersonAdd as FollowIcon,
  Star as StarIcon
} from '@vicons/ionicons5'

interface Props {
  userId: number
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  limit: 10
})

interface Activity {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  icon: any
  title: string
  description: string
  time: string
  link?: string
}

// 获取用户活动
const activities = computed<Activity[]>(() => {
  const result: Activity[] = []
  
  // 获取用户发布的帖子
  const userPosts = db.getPosts()
    .filter(p => p.authorId === props.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
  
  userPosts.forEach(post => {
    result.push({
      id: `post-${post.id}`,
      type: 'success',
      icon: CreateIcon,
      title: '发布了新帖子',
      description: post.title,
      time: post.createdAt,
      link: `/post/${post.id}`
    })
  })
  
  // 获取用户的评论
  const userComments = db.getComments()
    .filter(c => c.authorId === props.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
  
  userComments.forEach(comment => {
    const post = db.getPostById(comment.postId)
    if (post) {
      result.push({
        id: `comment-${comment.id}`,
        type: 'info',
        icon: CommentIcon,
        title: '发表了评论',
        description: `在《${post.title}》中评论`,
        time: comment.createdAt,
        link: `/post/${post.id}`
      })
    }
  })
  
  // 按时间排序
  result.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  
  return result.slice(0, props.limit)
})

// 格式化时间
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
  
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.activity-timeline {
  background: rgba(255, 255, 255, 0.02);
}
</style>

