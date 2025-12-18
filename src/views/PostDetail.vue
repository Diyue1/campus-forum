<template>
  <div class="post-detail-container cyber-page-container">
    <CyberDecor />
    <div class="cyber-content">
      <n-back-top />
    
      <!-- 返回按钮 -->
      <div class="back-section">
        <n-button
          class="back-btn"
          @click="$router.back()"
        >
          <template #icon>
            <n-icon>
              <ArrowBackIcon />
            </n-icon>
          </template>
          返回
        </n-button>
      </div>

      <div class="detail-content">
        <!-- 左侧主内容 -->
        <div class="main-content">
          <!-- 帖子详情卡片 -->
          <n-card class="post-detail-card cyber-card">
            <!-- 作者信息 -->
            <div class="author-section">
              <div class="author-info">
                <n-avatar
                  :src="post?.author.avatar"
                  :fallback-src="PlaceholderImages.avatar(post?.author.name?.[0] || 'U', 60)"
                  size="large"
                  class="author-avatar"
                />
                <div class="author-details">
                  <div class="author-name">
                    {{ post?.author.name }}
                  </div>
                  <div class="post-meta">
                    <span class="post-time">{{ formatTime(post?.createdAt) }}</span>
                    <n-divider vertical />
                    <span class="post-category">#{{ post?.topic }}</span>
                  </div>
                </div>
              </div>
              <n-button
                type="primary"
                size="small"
                class="follow-author-btn"
              >
                关注
              </n-button>
            </div>

            <!-- 帖子标题 -->
            <h1 class="post-title cyber-title">
              {{ post?.title }}
            </h1>

            <!-- 帖子内容 -->
            <div class="post-content">
              <p>{{ post?.content }}</p>
            </div>

            <!-- 图片展示 -->
            <div
              v-if="post?.images && post.images.length > 0"
              class="images-gallery"
            >
              <n-image-group>
                <n-space>
                  <n-image
                    v-for="image in post.images"
                    :key="image.id"
                    :src="image.url"
                    :alt="post.title"
                    width="200"
                    class="gallery-image"
                    show-toolbar-tooltip
                  />
                </n-space>
              </n-image-group>
            </div>

            <!-- 互动统计 -->
            <div class="interaction-stats">
              <n-space>
                <n-statistic
                  label="点赞"
                  :value="post?.likes || 0"
                  class="stat-item"
                >
                  <template #prefix>
                    <n-icon color="#FF6B35">
                      <HeartIcon />
                    </n-icon>
                  </template>
                </n-statistic>
                <n-statistic
                  label="评论"
                  :value="post?.comments || 0"
                  class="stat-item"
                >
                  <template #prefix>
                    <n-icon color="#00BCD4">
                      <ChatbubbleIcon />
                    </n-icon>
                  </template>
                </n-statistic>
                <n-statistic
                  label="分享"
                  :value="post?.shares || 0"
                  class="stat-item"
                >
                  <template #prefix>
                    <n-icon color="#4CAF50">
                      <ShareIcon />
                    </n-icon>
                  </template>
                </n-statistic>
              </n-space>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <n-space>
                <n-button
                  :type="isLiked ? 'primary' : 'default'"
                  class="action-btn like-btn"
                  @click="handleLike"
                >
                  <template #icon>
                    <n-icon>
                      <HeartIcon v-if="!isLiked" />
                      <HeartFilledIcon v-else />
                    </n-icon>
                  </template>
                  {{ isLiked ? '已点赞' : '点赞' }}
                </n-button>
              
                <n-button
                  class="action-btn"
                  @click="scrollToComments"
                >
                  <template #icon>
                    <n-icon>
                      <ChatbubbleIcon />
                    </n-icon>
                  </template>
                  评论
                </n-button>
              
                <n-button
                  class="action-btn"
                  @click="handleShare"
                >
                  <template #icon>
                    <n-icon>
                      <ShareIcon />
                    </n-icon>
                  </template>
                  分享
                </n-button>
              
                <n-button
                  class="action-btn"
                  @click="handleCollect"
                >
                  <template #icon>
                    <n-icon>
                      <BookmarkIcon />
                    </n-icon>
                  </template>
                  收藏
                </n-button>

                <n-button
                  class="action-btn"
                  type="error"
                  @click="showReportModal = true"
                >
                  <template #icon>
                    <n-icon>
                      <FlagIcon />
                    </n-icon>
                  </template>
                  举报
                </n-button>
              </n-space>
            </div>
          </n-card>

          <!-- 评论区域 -->
          <n-card
            ref="commentsRef"
            class="comments-section"
          >
            <template #header>
              <div class="comments-header">
                <span>评论 ({{ comments.length }})</span>
              </div>
            </template>

            <!-- 发表评论 -->
            <div class="comment-input-section">
              <n-input
                v-model:value="newComment"
                type="textarea"
                placeholder="写下你的评论..."
                :rows="3"
                class="comment-input"
              />
              <div class="comment-actions">
                <n-space justify="end">
                  <n-button
                    quaternary
                    @click="newComment = ''"
                  >
                    取消
                  </n-button>
                  <n-button
                    type="primary"
                    :disabled="!newComment.trim()"
                    class="submit-comment-btn"
                    @click="handleAddComment"
                  >
                    发表评论
                  </n-button>
                </n-space>
              </div>
            </div>

            <!-- 评论列表 -->
            <div class="comments-list">
              <div
                v-for="comment in comments"
                :key="comment.id"
                class="comment-item"
              >
                <n-avatar
                  :src="comment.author.avatar"
                  :fallback-src="PlaceholderImages.avatar(comment.author.name?.[0] || 'U', 40)"
                  size="medium"
                  class="comment-avatar"
                />
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.author.name }}</span>
                    <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                  </div>
                  <div class="comment-text">
                    {{ comment.content }}
                  </div>
                  <div class="comment-actions">
                    <n-button
                      text
                      size="small"
                      @click="handleCommentLike(comment.id)"
                    >
                      <template #icon>
                        <n-icon size="14">
                          <HeartIcon />
                        </n-icon>
                      </template>
                      {{ comment.likes }}
                    </n-button>
                    <n-button
                      text
                      size="small"
                      @click="startReply(comment)"
                    >
                      回复
                    </n-button>
                    <n-button
                      v-if="userStore.currentUser && (userStore.currentUser.id === comment.author.id || userStore.currentUser.role === 'admin')"
                      text
                      size="small"
                      type="error"
                      @click="handleDeleteComment(comment.id)"
                    >
                      删除
                    </n-button>
                  </div>
                
                  <!-- 回复列表 -->
                  <div
                    v-if="comment.replies && comment.replies.length > 0"
                    class="replies-list"
                  >
                    <div
                      v-for="reply in comment.replies"
                      :key="reply.id"
                      class="reply-item"
                    >
                      <n-avatar
                        :src="reply.author.avatar"
                        :fallback-src="PlaceholderImages.avatar(reply.author.name?.[0] || 'U', 32)"
                        size="small"
                        class="reply-avatar"
                      />
                      <div class="reply-content">
                        <div class="reply-header">
                          <span class="reply-author">{{ reply.author.name }}</span>
                          <span class="reply-time">{{ formatTime(reply.createdAt) }}</span>
                        </div>
                        <div class="reply-text">
                          {{ reply.content }}
                        </div>
                        <div class="reply-actions">
                          <n-button
                            text
                            size="tiny"
                            @click="handleReplyLike(reply.id)"
                          >
                            <template #icon>
                              <n-icon size="12">
                                <HeartIcon />
                              </n-icon>
                            </template>
                            {{ reply.likes }}
                          </n-button>
                        </div>
                      </div>
                    </div>
                  </div>
                
                  <!-- 回复输入框 -->
                  <div
                    v-if="replyingTo === comment.id"
                    class="reply-input-section"
                  >
                    <n-input
                      v-model:value="replyContent"
                      placeholder="写下你的回复..."
                      type="textarea"
                      :rows="2"
                      class="reply-input"
                    />
                    <div class="reply-actions">
                      <n-button
                        size="small"
                        @click="cancelReply"
                      >
                        取消
                      </n-button>
                      <n-button
                        type="primary"
                        size="small"
                        :disabled="!replyContent.trim()"
                        @click="submitReply(comment.id)"
                      >
                        发表回复
                      </n-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </n-card>
        </div>

        <!-- 举报模态框 -->
        <n-modal
          v-model:show="showReportModal"
          preset="card"
          title="举报帖子"
          style="width: 500px"
        >
          <n-form>
            <n-form-item label="举报类型">
              <n-select
                v-model:value="reportType"
                :options="reportOptions"
                placeholder="请选择举报类型"
              />
            </n-form-item>
            <n-form-item label="举报原因">
              <n-input
                v-model:value="reportReason"
                type="textarea"
                :rows="4"
                placeholder="请详细描述举报原因..."
              />
            </n-form-item>
          </n-form>
          <template #footer>
            <n-space justify="end">
              <n-button @click="showReportModal = false">
                取消
              </n-button>
              <n-button
                type="error"
                @click="submitReport"
              >
                提交举报
              </n-button>
            </n-space>
          </template>
        </n-modal>

        <!-- 右侧推荐 -->
        <div class="sidebar-content">
          <!-- 作者其他帖子 -->
          <n-card
            title="作者的其他帖子"
            class="related-posts-card"
          >
            <n-space vertical>
              <div
                v-for="relatedPost in relatedPosts"
                :key="relatedPost.id"
                class="related-post-item"
                @click="goToPost(relatedPost.id)"
              >
                <div class="related-post-title">
                  {{ relatedPost.title }}
                </div>
                <div class="related-post-stats">
                  <span>{{ relatedPost.likes }}赞</span>
                  <span>{{ relatedPost.comments }}评论</span>
                </div>
              </div>
            </n-space>
          </n-card>

          <!-- 相关推荐 -->
          <n-card
            title="相关推荐"
            class="recommendations-card"
          >
            <n-space vertical>
              <div
                v-for="rec in recommendations"
                :key="rec.id"
                class="recommendation-item"
                @click="goToPost(rec.id)"
              >
                <n-image
                  :src="rec.cover"
                  width="60"
                  height="60"
                  class="rec-cover"
                />
                <div class="rec-info">
                  <div class="rec-title">
                    {{ rec.title }}
                  </div>
                  <div class="rec-author">
                    {{ rec.author }}
                  </div>
                </div>
              </div>
            </n-space>
          </n-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CyberDecor from '@/components/CyberDecor.vue'
import { useUserStore } from '@/stores/user'
import { useMessage } from 'naive-ui'
import { db } from '@/utils/database'
import { PlaceholderImages } from '@/utils/imageGenerator'
import { Logger, LogActions } from '@/utils/logger'
import {
  ArrowBackOutline as ArrowBackIcon,
  HeartOutline as HeartIcon,
  Heart as HeartFilledIcon,
  ChatbubbleEllipsesOutline as ChatbubbleIcon,
  ShareSocialOutline as ShareIcon,
  BookmarkOutline as BookmarkIcon,
  FlagOutline as FlagIcon
} from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

const post = ref<any>(null)
const isLiked = ref(false)
const newComment = ref('')
const comments = ref<any[]>([])
const relatedPosts = ref<any[]>([])
const recommendations = ref<any[]>([])
const commentsRef = ref<HTMLElement>()

// 举报相关
const showReportModal = ref(false)
const reportType = ref('')
const reportReason = ref('')
const reportOptions = [
  { label: '垃圾广告', value: 'spam' },
  { label: '色情低俗', value: 'porn' },
  { label: '违法违规', value: 'illegal' },
  { label: '侮辱谩骂', value: 'abuse' },
  { label: '虚假信息', value: 'fake' },
  { label: '其他', value: 'other' }
]

// 回复功能相关变量
const replyingTo = ref<number | null>(null)
const replyContent = ref('')

const formatTime = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const loadPostDetail = async () => {
  const postId = parseInt(route.params.id as string)
  
  try {
    // 从数据库获取帖子详情
    const postData = db.getPostById(postId)
    if (!postData) {
      message.error('帖子不存在')
      router.push('/')
      return
    }
    
    // 获取作者信息
    const authorData = db.getUserById(postData.authorId)
    
    post.value = {
      ...postData,
      author: {
        id: authorData?.id,
        name: authorData?.nickname,
        avatar: authorData?.avatar
      }
    }
    
    // 检查当前用户是否已点赞
    if (userStore.currentUser) {
      isLiked.value = postData.likedBy?.includes(userStore.currentUser.id) || false
    }
    
    // 增加浏览量
    db.updatePost(postId, { views: postData.views + 1 })
    
    // 获取作者的其他帖子
    const allPosts = db.getPosts()
    relatedPosts.value = allPosts
      .filter(p => p.authorId === postData.authorId && p.id !== postId)
      .slice(0, 5)
    
    // 获取推荐帖子（相同话题）
    recommendations.value = allPosts
      .filter(p => p.topic === postData.topic && p.id !== postId)
      .slice(0, 3)
      .map(p => ({
        id: p.id,
        title: p.title,
        cover: p.images?.[0]?.url || PlaceholderImages.postCover(p.id, p.topic, 120, 80),
        author: db.getUserById(p.authorId)?.nickname || '匿名用户'
      }))
    
    // 模拟评论数据
    // 从数据库加载真实评论
    const postComments = db.getComments().filter(c => c.postId === postId)
    comments.value = postComments.map(c => {
      const author = db.getUserById(c.authorId)
      return {
        id: c.id,
        author: {
          name: author?.nickname || '匿名用户',
          avatar: author?.avatar || PlaceholderImages.avatar('U', 40)
        },
        content: c.content,
        likes: c.likes,
        createdAt: c.createdAt
      }
    })
    
  } catch (error) {
    Logger.error(LogActions.POST_LOAD_FAIL, { 
      error: error instanceof Error ? error.message : String(error),
      postId: route.params.id 
    }, userStore.currentUser?.id, userStore.currentUser?.username)
    message.error('加载帖子详情失败')
  }
}

const handleLike = () => {
  if (!userStore.currentUser) {
    message.warning('请先登录')
    return
  }

  if (!post.value) return

  const newLikedState = db.toggleLike(post.value.id, userStore.currentUser.id)
  isLiked.value = newLikedState

  // 更新帖子的点赞数
  const updatedPost = db.getPostById(post.value.id)
  if (updatedPost) {
    post.value.likes = updatedPost.likes
  }

  // 刷新用户数据
  userStore.refreshUser()

  const action = newLikedState ? '点赞' : '取消点赞'
  message.success(`${action}成功`)
}

const handleShare = () => {
  message.success('分享链接已复制到剪贴板')
}

const handleCollect = () => {
  message.success('收藏成功')
}

const submitReport = () => {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录')
    return
  }

  if (!reportType.value) {
    message.warning('请选择举报类型')
    return
  }

  if (!reportReason.value.trim()) {
    message.warning('请填写举报原因')
    return
  }

  // 使用 database 保存举报
  const newReport = db.reportPost({
    postId: post.value.id,
    reporterId: userStore.currentUser.id,
    reason: reportReason.value,
    type: reportType.value as 'spam' | 'inappropriate' | 'harassment' | 'other'
  })
  
  Logger.info(LogActions.POST_REPORT, { 
    postId: post.value.id,
    reportId: newReport.id 
  }, userStore.currentUser.id, userStore.currentUser.username)

  message.success('举报已提交，感谢您的反馈')
  showReportModal.value = false
  reportType.value = ''
  reportReason.value = ''
}

const handleAddComment = () => {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录')
    return
  }

  if (!newComment.value.trim()) return

  const postId = parseInt(route.params.id as string)

  // 创建评论
  const comment = db.createComment({
    postId: postId,
    authorId: userStore.currentUser!.id,
    content: newComment.value,
    parentId: null
  })

  // 添加到评论列表
  const author = db.getUserById(userStore.currentUser!.id)
  comments.value.unshift({
    id: comment.id,
    author: {
      name: author?.nickname || '当前用户',
      avatar: author?.avatar || PlaceholderImages.avatar('U', 40)
    },
    content: comment.content,
    likes: 0,
    createdAt: comment.createdAt
  })

  newComment.value = ''
  message.success('评论发表成功')

  if (post.value) {
    post.value.comments += 1
  }
}

const handleCommentLike = (commentId: number) => {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录')
    return
  }

  const comment = comments.value.find(c => c.id === commentId)
  if (comment) {
    // 切换点赞状态
    const dbComment = db.getComments().find(c => c.id === commentId)
    if (dbComment) {
      const isLiked = dbComment.likedBy?.includes(userStore.currentUser!.id)

      if (isLiked) {
        // 取消点赞
        dbComment.likedBy = dbComment.likedBy?.filter(id => id !== userStore.currentUser!.id)
        dbComment.likes = Math.max(0, dbComment.likes - 1)
        comment.likes = dbComment.likes
        message.info('取消点赞')
      } else {
        // 点赞
        if (!dbComment.likedBy) {
          dbComment.likedBy = []
        }
        dbComment.likedBy.push(userStore.currentUser!.id)
        dbComment.likes += 1
        comment.likes = dbComment.likes
        message.success('点赞成功')
      }

      // 保存到数据库
      db.updateComment(commentId, {
        likes: dbComment.likes,
        likedBy: dbComment.likedBy
      })
    }
  }
}

// 开始回复
const startReply = (comment: any) => {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }
  replyingTo.value = comment.id
  replyContent.value = ''
}

// 取消回复
const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
}

// 提交回复
const submitReply = (commentId: number) => {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }

  if (!replyContent.value.trim()) {
    alert('请输入回复内容')
    return
  }

  const postId = parseInt(route.params.id as string)

  // 创建回复（作为子评论）
  const reply = db.createComment({
    postId: postId,
    authorId: userStore.currentUser!.id,
    content: replyContent.value.trim(),
    parentId: commentId
  })

  // 添加到评论的回复列表
  const comment = comments.value.find(c => c.id === commentId)
  if (comment) {
    if (!comment.replies) {
      comment.replies = []
    }

    const author = db.getUserById(userStore.currentUser!.id)
    comment.replies.push({
      id: reply.id,
      content: reply.content,
      author: {
        name: author?.nickname || '匿名用户',
        avatar: author?.avatar || PlaceholderImages.avatar('U', 32)
      },
      createdAt: reply.createdAt,
      likes: 0
    })
  }

  replyContent.value = ''
  replyingTo.value = null

  alert('回复发表成功')
}

// 删除评论
const handleDeleteComment = (commentId: number) => {
  if (!confirm('确定要删除这条评论吗？')) return

  // 从数据库删除
  db.deleteComment(commentId)

  // 从列表中移除
  const index = comments.value.findIndex(c => c.id === commentId)
  if (index > -1) {
    comments.value.splice(index, 1)
    if (post.value) {
      post.value.comments = Math.max(0, post.value.comments - 1)
    }
  }

  alert('评论已删除')
}

// 回复点赞
const handleReplyLike = (replyId: number) => {
  comments.value.forEach(comment => {
    if (comment.replies) {
      const reply = comment.replies.find((r: any) => r.id === replyId)
      if (reply) {
        reply.likes += 1
        alert('点赞成功')
      }
    }
  })
}

const scrollToComments = () => {
  nextTick(() => {
    if (commentsRef.value && typeof commentsRef.value.scrollIntoView === 'function') {
      commentsRef.value.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

const goToPost = (postId: number) => {
  router.push(`/post/${postId}`)
}

onMounted(() => {
  loadPostDetail()
})
</script>

<style scoped>
.post-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.back-section {
  margin-bottom: 24px;
}

.back-btn {
  background: rgba(31, 31, 35, 0.8);
  border: 1px solid rgba(255, 107, 53, 0.2);
  color: #FFFFFF;
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
}

.main-content {
  min-width: 0;
}

.post-detail-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  backdrop-filter: blur(30px);
  border: 2px solid;
  border-image: linear-gradient(135deg, #667eea, #764ba2) 1;
  border-radius: 20px;
  margin-bottom: 24px;
  box-shadow: 0 0 40px rgba(102, 126, 234, 0.3), inset 0 0 20px rgba(102, 126, 234, 0.1);
  overflow: hidden;
  position: relative;
}

.post-detail-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  animation: scan 3s infinite;
}

@keyframes scan {
  0% { left: -100%; }
  100% { left: 100%; }
}

.author-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.author-avatar {
  border: 2px solid rgba(255, 107, 53, 0.3);
}

.author-details {
  flex: 1;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.post-category {
  color: #FF6B35;
  font-weight: 600;
}

.follow-author-btn {
  background: linear-gradient(45deg, #FF6B35, #FF9800);
  border: none;
}

.post-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 24px 0;
  line-height: 1.4;
  color: #FFFFFF;
}

.post-content {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 24px;
}

.post-content p {
  margin-bottom: 16px;
}

.images-gallery {
  margin-bottom: 24px;
}

.gallery-image {
  border-radius: 8px;
  cursor: pointer;
}

.interaction-stats {
  margin-bottom: 24px;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  --n-value-text-color: #FFFFFF;
  --n-label-text-color: rgba(255, 255, 255, 0.6);
}

.action-buttons {
  display: flex;
  justify-content: center;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.2);
  color: #FFFFFF;
  transition: all 0.3s ease;
}

.action-btn:hover {
  border-color: #FF6B35;
  background: rgba(255, 107, 53, 0.1);
}

.like-btn.n-button--primary-type {
  background: linear-gradient(45deg, #FF6B35, #FF9800);
  border: none;
}

.comments-section {
  background: rgba(31, 31, 35, 0.9);
  border: 1px solid rgba(255, 107, 53, 0.2);
}

.comments-header {
  font-size: 18px;
  font-weight: 600;
}

.comment-input-section {
  margin-bottom: 24px;
}

.comment-input {
  margin-bottom: 12px;
}

.submit-comment-btn {
  background: linear-gradient(45deg, #FF6B35, #FF9800);
  border: none;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  flex-shrink: 0;
  border: 1px solid rgba(255, 107, 53, 0.3);
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 600;
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.comment-text {
  margin-bottom: 8px;
  line-height: 1.5;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

/* 回复功能样式 */
.replies-list {
  margin-top: 12px;
  padding-left: 20px;
  border-left: 2px solid var(--interknot-border-secondary);
}

.reply-item {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 0;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-avatar {
  flex-shrink: 0;
  border: 1px solid var(--interknot-border-primary);
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.reply-author {
  font-size: 13px;
  font-weight: 600;
  color: var(--interknot-text-primary);
}

.reply-time {
  font-size: 11px;
  color: var(--interknot-text-tertiary);
}

.reply-text {
  font-size: 13px;
  color: var(--interknot-text-secondary);
  line-height: 1.4;
  margin-bottom: 6px;
}

.reply-actions {
  display: flex;
  gap: 8px;
}

.reply-input-section {
  margin-top: 12px;
  padding: 12px;
  background: var(--interknot-bg-glass);
  border: 1px solid var(--interknot-border-secondary);
  border-radius: var(--interknot-radius-md);
}

.reply-input {
  margin-bottom: 8px;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.related-posts-card,
.recommendations-card {
  background: rgba(31, 31, 35, 0.9);
  border: 1px solid rgba(255, 107, 53, 0.2);
}

.related-post-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.related-post-item:hover {
  background: rgba(255, 107, 53, 0.1);
}

.related-post-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  line-height: 1.4;
}

.related-post-stats {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  gap: 12px;
}

.recommendation-item {
  display: flex;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.recommendation-item:hover {
  background: rgba(255, 107, 53, 0.1);
}

.rec-cover {
  border-radius: 6px;
  flex-shrink: 0;
}

.rec-info {
  flex: 1;
}

.rec-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  line-height: 1.3;
}

.rec-author {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .detail-content {
    grid-template-columns: 1fr;
  }
  
  .sidebar-content {
    order: -1;
  }
}
</style>


