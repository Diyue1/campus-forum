<template>
  <div
    class="interknot-card"
    :class="{ 
      'hot-post': post.isHot,
      'top-post': post.isTop,
      'new-post': isNewPost
    }"
    @click="handlePostClick"
  >
    <!-- 绳网风格图片区域 -->
    <div
      v-if="post.images && post.images.length > 0"
      class="interknot-image-section"
    >
      <img
        :src="post.images[0].url"
        :alt="post.title"
        class="interknot-image"
        @error="handleImageError"
      >
      <div
        v-if="post.images.length > 1"
        class="image-count-badge"
      >
        <span class="count-icon">📷</span>
        <span class="count-text">+{{ post.images.length - 1 }}</span>
      </div>
    </div>

    <!-- 绳网风格内容区域 -->
    <div class="interknot-content">
      <!-- 标题 -->
      <h3 class="interknot-title">
        {{ post.title }}
      </h3>
      
      <!-- 内容预览 -->
      <p
        v-if="post.content"
        class="interknot-description"
      >
        {{ truncateContent(post.content, 80) }}
      </p>

      <!-- 话题标签 -->
      <div
        v-if="post.topic"
        class="interknot-topic"
      >
        <span class="topic-tag">#{{ post.topic }}</span>
      </div>

      <!-- 标签组 -->
      <div
        v-if="post.tags && post.tags.length > 0"
        class="interknot-tags"
      >
        <span 
          v-for="tag in post.tags.slice(0, 3)" 
          :key="tag" 
          class="tag-item"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- 绳网风格底部信息 -->
    <div class="interknot-footer">
      <!-- 作者信息 -->
      <div class="author-section">
        <img
          :src="authorInfo?.avatar"
          :alt="authorInfo?.nickname"
          class="author-avatar"
          @error="handleAvatarError"
        >
        <div class="author-details">
          <span class="author-name">{{ authorInfo?.nickname || '匿名用户' }}</span>
          <span class="post-time">{{ formatTime(post.createdAt) }}</span>
        </div>
      </div>

      <!-- 互动按钮 -->
      <div class="interaction-section">
        <button
          class="interaction-btn like-btn"
          :class="{ 'liked': isLiked }"
          @click.stop="handleLike"
        >
          <span class="btn-icon">❤️</span>
          <span class="btn-count">{{ post.likes }}</span>
        </button>

        <button
          class="interaction-btn comment-btn"
          @click.stop="handleComment"
        >
          <span class="btn-icon">💬</span>
          <span class="btn-count">{{ post.comments }}</span>
        </button>

        <button
          class="interaction-btn share-btn"
          @click.stop="handleShare"
        >
          <span class="btn-icon">📤</span>
        </button>
      </div>
    </div>

    <!-- 绳网风格状态标识 -->
    <div
      v-if="post.isTop"
      class="interknot-badge top"
    >
      <span class="badge-icon">📌</span>
      <span class="badge-text">置顶</span>
    </div>

    <div
      v-if="post.isHot"
      class="interknot-badge hot"
    >
      <span class="badge-icon">🔥</span>
      <span class="badge-text">热门</span>
    </div>

    <div
      v-if="isNewPost"
      class="interknot-badge new"
    >
      <span class="badge-icon">🆕</span>
      <span class="badge-text">最新</span>
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
  collectedBy?: number[]
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
  return diffHours < 24 // 24小时内为新帖子
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
  const action = newLikedState ? '点赞' : '取消点赞'
  message.success(`${action}成功`)
}

const handleComment = () => {
  window.location.href = `/post/${props.post.id}#comments`
}

const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: props.post.title,
      text: props.post.content,
      url: `${window.location.origin}/post/${props.post.id}`
    })
  } else {
    navigator.clipboard?.writeText(`${window.location.origin}/post/${props.post.id}`)
      .then(() => {
        message.success('链接已复制到剪贴板')
      })
      .catch(() => {
        message.success('分享功能已触发')
      })
  }
}

const truncateContent = (content: string, maxLength: number) => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

const formatTime = (dateString: string) => {
  const now = new Date()
  const postTime = new Date(dateString)
  const diffMs = now.getTime() - postTime.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffHours < 1) return '刚刚'
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return postTime.toLocaleDateString()
}

// 图片加载错误处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = PlaceholderImages.placeholder(300, 200, '图片加载失败')
}

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = PlaceholderImages.avatar('U', 24)
}
</script>

<style scoped>
.interknot-card {
  background: var(--interknot-bg-card);
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: var(--interknot-radius-lg);
  backdrop-filter: blur(20px);
  transition: all var(--interknot-transition-normal);
  position: relative;
  overflow: hidden;
  width: var(--interknot-card-width);
  height: var(--interknot-card-height);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.1), inset 0 0 20px rgba(0, 240, 255, 0.05);
}

.interknot-card:hover {
  border-color: rgba(0, 240, 255, 0.8);
  box-shadow: 
    0 0 5px #00F0FF,
    0 0 10px #00F0FF,
    0 0 20px #00F0FF,
    0 0 40px rgba(255, 0, 255, 0.3),
    inset 0 0 30px rgba(0, 240, 255, 0.1);
  transform: translateY(-6px);
}

/* 赛博朋克顶部霓虹线 */
.interknot-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00F0FF, #FF00FF, #FFFF00, transparent);
  opacity: 0;
  transition: all var(--interknot-transition-normal);
}

.interknot-card:hover::before {
  opacity: 1;
  left: 100%;
  animation: neon-sweep 1.5s ease-in-out;
}

@keyframes neon-sweep {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* 赛博网格背景 */
.interknot-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(0deg, transparent 24%, rgba(0, 240, 255, 0.03) 25%, rgba(0, 240, 255, 0.03) 26%, transparent 27%),
    linear-gradient(90deg, transparent 24%, rgba(0, 240, 255, 0.03) 25%, rgba(0, 240, 255, 0.03) 26%, transparent 27%);
  background-size: 20px 20px;
  opacity: 0;
  transition: opacity var(--interknot-transition-normal);
  pointer-events: none;
  z-index: 0;
}

.interknot-card:hover::after {
  opacity: 1;
  animation: grid-pulse 2s ease-in-out infinite;
}

@keyframes grid-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.interknot-image-section {
  position: relative;
  width: 100%;
  height: var(--interknot-image-height);
  overflow: hidden;
}

.interknot-image-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 240, 255, 0.1) 100%);
  z-index: 1;
  pointer-events: none;
}

.interknot-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--interknot-transition-fast), filter var(--interknot-transition-fast);
  filter: brightness(0.9) contrast(1.1);
}

.interknot-card:hover .interknot-image {
  transform: scale(1.08);
  filter: brightness(1) contrast(1.2) saturate(1.2);
}

/* 扫描线效果 */
.interknot-image-section::after {
  content: '';
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00F0FF, transparent);
  box-shadow: 0 0 10px #00F0FF;
  z-index: 2;
  pointer-events: none;
}

.interknot-card:hover .interknot-image-section::after {
  animation: scan-down 2s linear infinite;
}

@keyframes scan-down {
  0% { top: -100%; }
  100% { top: 100%; }
}

.image-count-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.9);
  color: #00F0FF;
  padding: 4px 8px;
  border-radius: var(--interknot-radius-sm);
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid rgba(0, 240, 255, 0.5);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
  z-index: 3;
  backdrop-filter: blur(10px);
}

.count-icon {
  font-size: 12px;
}

.count-text {
  font-size: 11px;
}

.interknot-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.interknot-title {
  font-size: 16px;
  font-weight: 700;
  color: #00F0FF;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
  position: relative;
  z-index: 1;
  transition: all var(--interknot-transition-fast);
}

.interknot-card:hover .interknot-title {
  text-shadow: 
    0 0 5px #00F0FF,
    0 0 10px #00F0FF,
    0 0 20px #00F0FF;
  color: #33F3FF;
}

.interknot-description {
  font-size: 13px;
  color: var(--interknot-text-secondary);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.interknot-topic {
  margin-top: auto;
}

.topic-tag {
  font-size: 12px;
  color: #00F0FF;
  background: rgba(0, 240, 255, 0.1);
  padding: 4px 8px;
  border-radius: var(--interknot-radius-sm);
  font-weight: 600;
  border: 1px solid rgba(0, 240, 255, 0.3);
  box-shadow: 0 0 5px rgba(0, 240, 255, 0.2);
  transition: all var(--interknot-transition-fast);
}

.topic-tag:hover {
  background: rgba(0, 240, 255, 0.2);
  border-color: rgba(0, 240, 255, 0.6);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
}

.interknot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.tag-item {
  font-size: 10px;
  color: rgba(255, 0, 255, 0.9);
  background: rgba(255, 0, 255, 0.05);
  padding: 2px 6px;
  border-radius: var(--interknot-radius-xs);
  border: 1px solid rgba(255, 0, 255, 0.3);
  box-shadow: 0 0 3px rgba(255, 0, 255, 0.2);
  transition: all var(--interknot-transition-fast);
}

.tag-item:hover {
  background: rgba(255, 0, 255, 0.15);
  border-color: rgba(255, 0, 255, 0.6);
  box-shadow: 0 0 8px rgba(255, 0, 255, 0.4);
}

.interknot-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 240, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(180deg, transparent, rgba(0, 240, 255, 0.03));
  position: relative;
  z-index: 1;
}

.interknot-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00F0FF, transparent);
  opacity: 0;
  transition: opacity var(--interknot-transition-normal);
}

.interknot-card:hover .interknot-footer::before {
  opacity: 1;
}

.author-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(0, 240, 255, 0.5);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
  transition: all var(--interknot-transition-fast);
}

.author-avatar:hover {
  border-color: #00F0FF;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.6);
  transform: scale(1.1);
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-size: 12px;
  color: var(--interknot-text-primary);
  font-weight: 500;
}

.post-time {
  font-size: 10px;
  color: var(--interknot-text-tertiary);
}

.interaction-section {
  display: flex;
  gap: 8px;
  align-items: center;
}

.interaction-btn {
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.2);
  color: rgba(0, 240, 255, 0.8);
  font-size: 12px;
  padding: 6px 10px;
  border-radius: var(--interknot-radius-sm);
  transition: all var(--interknot-transition-fast);
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.interaction-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(0, 240, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.4s, height 0.4s;
}

.interaction-btn:hover::before {
  width: 100px;
  height: 100px;
}

.interaction-btn:hover {
  background: rgba(0, 240, 255, 0.15);
  border-color: rgba(0, 240, 255, 0.6);
  color: #00F0FF;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
  transform: translateY(-2px);
}

.interaction-btn.liked {
  background: rgba(255, 0, 102, 0.15);
  border-color: rgba(255, 0, 102, 0.5);
  color: #FF0066;
  box-shadow: 0 0 10px rgba(255, 0, 102, 0.3);
}

.interaction-btn.liked:hover {
  box-shadow: 0 0 15px rgba(255, 0, 102, 0.5);
}

.btn-icon {
  font-size: 14px;
}

.btn-count {
  font-size: 11px;
  font-weight: 500;
}

.interknot-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 5px 10px;
  border-radius: var(--interknot-radius-sm);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
  border: 1px solid;
  backdrop-filter: blur(10px);
  text-shadow: 0 0 5px currentColor;
}

.interknot-badge.top {
  background: rgba(0, 240, 255, 0.2);
  border-color: #00F0FF;
  color: #00F0FF;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.5);
  animation: badge-glow 2s ease-in-out infinite;
}

.interknot-badge.hot {
  background: rgba(255, 0, 102, 0.2);
  border-color: #FF0066;
  color: #FF0066;
  box-shadow: 0 0 15px rgba(255, 0, 102, 0.5);
  animation: badge-glow 2s ease-in-out infinite;
}

.interknot-badge.new {
  background: rgba(0, 255, 136, 0.2);
  border-color: #00FF88;
  color: #00FF88;
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
  animation: badge-glow 2s ease-in-out infinite;
}

@keyframes badge-glow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.badge-icon {
  font-size: 12px;
}

.badge-text {
  font-size: 11px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .interknot-card {
    width: var(--interknot-card-width);
    height: var(--interknot-card-height);
  }
  
  .interknot-image-section {
    height: var(--interknot-image-height);
  }
  
  .interknot-content {
    padding: 12px;
  }
  
  .interknot-title {
    font-size: 14px;
  }
  
  .interknot-description {
    font-size: 12px;
  }
  
  .interknot-footer {
    padding: 8px 12px;
  }
  
  .author-name {
    font-size: 11px;
  }
  
  .post-time {
    font-size: 9px;
  }
  
  .interaction-btn {
    font-size: 11px;
    padding: 4px 6px;
  }
}
</style>