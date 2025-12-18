<template>
  <div
    class="modern-post-card"
    @click="handlePostClick"
  >
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="author-info">
        <n-avatar
          :src="authorInfo?.avatar"
          :fallback-src="PlaceholderImages.avatar(authorInfo?.nickname?.[0] || 'U', 40)"
          size="small"
          class="author-avatar"
        />
        <div class="author-details">
          <div class="author-name">
            {{ authorInfo?.nickname || '匿名用户' }}
          </div>
          <div class="post-time">
            {{ formatTime(post.createdAt) }}
          </div>
        </div>
      </div>
      <div class="post-badges">
        <n-tag
          v-if="post.isTop"
          type="error"
          size="small"
          round
        >
          <template #icon>
            <span>📌</span>
          </template>
          置顶
        </n-tag>
        <n-tag
          v-if="post.isHot"
          type="warning"
          size="small"
          round
        >
          <template #icon>
            <span>🔥</span>
          </template>
          热门
        </n-tag>
        <n-tag
          v-if="isNewPost"
          type="success"
          size="small"
          round
        >
          <template #icon>
            <span>✨</span>
          </template>
          新帖
        </n-tag>
      </div>
    </div>

    <!-- 帖子内容 -->
    <div class="card-body">
      <h3 class="post-title">
        {{ post.title }}
      </h3>
      <p
        v-if="post.content"
        class="post-content"
      >
        {{ truncateContent(post.content, 120) }}
      </p>

      <!-- 图片展示 -->
      <div
        v-if="post.images && post.images.length > 0"
        class="post-images"
      >
        <div
          class="image-grid"
          :class="`grid-${Math.min(post.images.length, 3)}`"
        >
          <div
            v-for="(img, index) in post.images.slice(0, 3)"
            :key="index"
            class="image-item"
            @click.stop
          >
            <img
              :src="img.url"
              :alt="post.title"
              class="post-image"
              @error="handleImageError"
            >
            <div
              v-if="index === 2 && post.images.length > 3"
              class="more-overlay"
            >
              <span>+{{ post.images.length - 3 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 话题和标签 -->
      <div class="post-meta">
        <n-tag
          v-if="post.topic"
          type="info"
          size="small"
          round
          class="topic-tag"
        >
          #{{ post.topic }}
        </n-tag>
        <n-tag
          v-for="tag in post.tags?.slice(0, 2)"
          :key="tag"
          size="small"
          round
          class="tag-item"
        >
          {{ tag }}
        </n-tag>
      </div>
    </div>

    <!-- 卡片底部 -->
    <div class="card-footer">
      <div class="interaction-buttons">
        <button
          class="interaction-btn"
          :class="{ active: isLiked }"
          @click.stop="handleLike"
        >
          <span class="btn-icon">{{ isLiked ? '❤️' : '🤍' }}</span>
          <span class="btn-text">{{ post.likes }}</span>
        </button>

        <button
          class="interaction-btn"
          @click.stop="handleComment"
        >
          <span class="btn-icon">💬</span>
          <span class="btn-text">{{ post.comments }}</span>
        </button>

        <button
          class="interaction-btn"
          @click.stop="handleShare"
        >
          <span class="btn-icon">🔗</span>
          <span class="btn-text">{{ post.shares }}</span>
        </button>

        <button class="interaction-btn">
          <span class="btn-icon">👁️</span>
          <span class="btn-text">{{ post.views }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { db } from '@/utils/database'
import { PlaceholderImages } from '@/utils/imageGenerator'

interface Post {
  id: number
  title: string
  content: string
  authorId: number
  topic?: string
  images?: Array<{
    id: number
    url: string
    width: number
    height: number
  }>
  likes: number
  comments: number
  shares: number
  views: number
  createdAt: string
  updatedAt: string
  isHot?: boolean
  isTop?: boolean
  tags?: string[]
  likedBy?: number[]
}

const props = defineProps<{
  post: Post
}>()

const message = useMessage()
const userStore = useUserStore()
const isLiked = ref(false)

onMounted(() => {
  if (userStore.currentUser) {
    const post = db.getPostById(props.post.id)
    if (post) {
      isLiked.value = post.likedBy?.includes(userStore.currentUser.id) || false
    }
  }
})

const authorInfo = computed(() => {
  if (props.post.authorId) {
    return db.getUserById(props.post.authorId)
  }
  return null
})

const isNewPost = computed(() => {
  const now = new Date()
  const postTime = new Date(props.post.createdAt)
  const diffHours = (now.getTime() - postTime.getTime()) / (1000 * 60 * 60)
  return diffHours < 24
})

const handlePostClick = () => {
  window.location.href = `/post/${props.post.id}`
}

const handleLike = () => {
  if (!userStore.currentUser) {
    message.warning('请先登录')
    return
  }
  const newLikedState = db.toggleLike(props.post.id, userStore.currentUser.id)
  isLiked.value = newLikedState
  message.success(newLikedState ? '点赞成功' : '取消点赞')
}

const handleComment = () => {
  window.location.href = `/post/${props.post.id}#comments`
}

const handleShare = () => {
  const url = `${window.location.origin}/post/${props.post.id}`
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url)
      .then(() => message.success('链接已复制到剪贴板'))
      .catch(() => message.success('分享功能已触发'))
  } else {
    message.success('分享功能已触发')
  }
}

const truncateContent = (content: string, maxLength: number) => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

const formatTime = (dateString: string) => {
  const now = new Date()
  const postTime = new Date(dateString)
  const diff = now.getTime() - postTime.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return postTime.toLocaleDateString('zh-CN')
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 使用更好看的占位图
  img.src = `https://via.placeholder.com/400x300/667eea/ffffff?text=${encodeURIComponent(props.post.topic || '图片')}`
}
</script>

<style scoped>
.modern-post-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.modern-post-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(102, 126, 234, 0.3);
  border-color: rgba(102, 126, 234, 0.5);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  border: 2px solid rgba(102, 126, 234, 0.3);
  transition: transform 0.3s ease;
}

.modern-post-card:hover .author-avatar {
  transform: scale(1.1);
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  line-height: 1.2;
}

.post-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.post-badges {
  display: flex;
  gap: 6px;
}

.card-body {
  padding: 20px;
}

.post-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-content {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-images {
  margin: 16px 0;
}

.image-grid {
  display: grid;
  gap: 8px;
  border-radius: 12px;
  overflow: hidden;
}

.image-grid.grid-1 {
  grid-template-columns: 1fr;
}

.image-grid.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.image-grid.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-item:hover .post-image {
  transform: scale(1.1);
}

.more-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.topic-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.tag-item {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-footer {
  padding: 12px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
}

.interaction-buttons {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.interaction-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.7);
}

.interaction-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: translateY(-2px);
}

.interaction-btn.active {
  color: #ff6b6b;
}

.btn-icon {
  font-size: 18px;
  line-height: 1;
}

.btn-text {
  font-size: 13px;
  font-weight: 600;
}

/* 响应式 */
@media (max-width: 768px) {
  .card-header {
    padding: 12px 16px;
  }

  .card-body {
    padding: 16px;
  }

  .post-title {
    font-size: 16px;
  }

  .post-content {
    font-size: 13px;
  }

  .interaction-btn {
    padding: 6px 12px;
  }

  .btn-icon {
    font-size: 16px;
  }

  .btn-text {
    font-size: 12px;
  }
}
</style>

