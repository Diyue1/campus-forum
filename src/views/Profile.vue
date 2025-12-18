<template>
  <div class="profile-container cyber-page-container">
    <CyberDecor />
    <div class="cyber-content">
      <!-- 用户信息卡片 -->
      <n-card class="profile-header-card cyber-card">
        <div class="profile-header">
          <!-- 背景图 -->
          <div class="profile-bg">
            <n-image
              src="PlaceholderImages.placeholder(1200, 300, 'Profile Background')"
              class="bg-image"
            />
            <div class="bg-overlay" />
          </div>
        
          <!-- 用户基本信息 -->
          <div class="user-basic-info">
            <div class="avatar-section">
              <n-avatar
                :src="userProfile?.avatar"
                size="large"
                class="user-avatar"
              />
              <n-button
                v-if="isOwnProfile"
                size="small"
                class="edit-avatar-btn"
                @click="handleEditAvatar"
              >
                <template #icon>
                  <n-icon>
                    <CameraIcon />
                  </n-icon>
                </template>
              </n-button>
            </div>
          
            <div class="user-info">
              <div class="user-name-section">
                <h1 class="user-name cyber-title">
                  {{ userProfile?.nickname }}
                </h1>
                <n-tag
                  :type="getLevelTagType(userProfile?.level)"
                  size="small"
                  class="level-tag"
                >
                  Lv.{{ userProfile?.level }}
                </n-tag>
              </div>
            
              <div class="user-meta">
                <span class="username">@{{ userProfile?.username }}</span>
                <n-divider vertical />
                <span class="join-date">{{ formatJoinDate(userProfile?.createdAt) }}</span>
              </div>
            
              <div
                v-if="userProfile?.bio"
                class="user-bio"
              >
                {{ userProfile.bio }}
              </div>
            
              <!-- 用户统计 -->
              <div class="user-stats">
                <div
                  class="stat-item"
                  @click="showFollowersModal = true"
                >
                  <div class="stat-value">
                    {{ userProfile?.followers || 0 }}
                  </div>
                  <div class="stat-label">
                    粉丝
                  </div>
                </div>
                <div
                  class="stat-item"
                  @click="showFollowingModal = true"
                >
                  <div class="stat-value">
                    {{ userProfile?.following || 0 }}
                  </div>
                  <div class="stat-label">
                    关注
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">
                    {{ userProfile?.posts || 0 }}
                  </div>
                  <div class="stat-label">
                    帖子
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">
                    {{ userProfile?.exp || 0 }}
                  </div>
                  <div class="stat-label">
                    经验值
                  </div>
                </div>
              </div>
            </div>
          
            <!-- 操作按钮 -->
            <div class="action-buttons">
              <n-space v-if="!isOwnProfile">
                <n-button
                  type="primary"
                  class="follow-btn"
                >
                  <template #icon>
                    <n-icon>
                      <PersonAddIcon />
                    </n-icon>
                  </template>
                  关注
                </n-button>
                <n-button class="message-btn">
                  <template #icon>
                    <n-icon>
                      <ChatbubbleIcon />
                    </n-icon>
                  </template>
                  私信
                </n-button>
              </n-space>
              <n-space v-else>
                <n-button
                  class="edit-btn"
                  @click="showEditProfile = true"
                >
                  <template #icon>
                    <n-icon>
                      <EditIcon />
                    </n-icon>
                  </template>
                  编辑资料
                </n-button>
                <n-button
                  class="settings-btn"
                  @click="handleSettings"
                >
                  <template #icon>
                    <n-icon>
                      <SettingsIcon />
                    </n-icon>
                  </template>
                  设置
                </n-button>
              </n-space>
            </div>
          </div>
        </div>
      </n-card>

      <!-- 内容标签页 -->
      <div class="content-tabs-section">
        <n-tabs
          v-model:value="activeTab"
          type="line"
          size="large"
          class="profile-tabs"
        >
          <n-tab-pane
            name="posts"
            tab="帖子"
          >
            <template #tab>
              <n-icon
                size="18"
                style="margin-right: 6px;"
              >
                <DocumentIcon />
              </n-icon>
              帖子 ({{ userPosts.length }})
            </template>
          </n-tab-pane>
        
          <n-tab-pane
            name="likes"
            tab="点赞"
          >
            <template #tab>
              <n-icon
                size="18"
                style="margin-right: 6px;"
              >
                <HeartIcon />
              </n-icon>
              点赞
            </template>
          </n-tab-pane>
        
          <n-tab-pane
            name="collections"
            tab="收藏"
          >
            <template #tab>
              <n-icon
                size="18"
                style="margin-right: 6px;"
              >
                <BookmarkIcon />
              </n-icon>
              收藏
            </template>
          </n-tab-pane>
        
          <n-tab-pane
            v-if="isOwnProfile"
            name="achievements"
            tab="成就"
          >
            <template #tab>
              <n-icon
                size="18"
                style="margin-right: 6px;"
              >
                <TrophyIcon />
              </n-icon>
              成就
            </template>
          </n-tab-pane>

          <n-tab-pane
            v-if="isOwnProfile"
            name="checkin"
            tab="签到"
          >
            <template #tab>
              <n-icon
                size="18"
                style="margin-right: 6px;"
              >
                <CalendarIcon />
              </n-icon>
              签到
            </template>
          </n-tab-pane>
        </n-tabs>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 帖子列表 -->
        <div
          v-if="activeTab === 'posts'"
          class="posts-grid"
        >
          <div class="waterfall-container">
            <div
              v-for="(column, index) in postColumns"
              :key="index"
              class="waterfall-column"
            >
              <ModernPostCard
                v-for="post in column"
                :key="post.id"
                :post="post"
                class="post-card-item"
                @click="goToPostDetail(post.id)"
              />
            </div>
          </div>
        </div>

        <!-- 点赞列表 -->
        <div
          v-else-if="activeTab === 'likes'"
          class="likes-grid"
        >
          <n-empty
            v-if="likedPosts.length === 0"
            description="暂无点赞内容"
          >
            <template #icon>
              <n-icon
                size="60"
                color="#FF6B35"
              >
                <HeartIcon />
              </n-icon>
            </template>
          </n-empty>
          <div
            v-else
            class="waterfall-container"
          >
            <div
              v-for="(column, index) in likedPostColumns"
              :key="index"
              class="waterfall-column"
            >
              <ModernPostCard
                v-for="post in column"
                :key="post.id"
                :post="post"
                class="post-card-item"
                @click="goToPostDetail(post.id)"
              />
            </div>
          </div>
        </div>

        <!-- 收藏列表 -->
        <div
          v-else-if="activeTab === 'collections'"
          class="collections-grid"
        >
          <n-empty
            v-if="collectedPosts.length === 0"
            description="暂无收藏内容"
          >
            <template #icon>
              <n-icon
                size="60"
                color="#FF6B35"
              >
                <BookmarkIcon />
              </n-icon>
            </template>
          </n-empty>
        </div>

        <!-- 成就系统 -->
        <div
          v-else-if="activeTab === 'achievements'"
          class="achievements-grid"
        >
          <n-grid
            :cols="3"
            :x-gap="16"
            :y-gap="16"
          >
            <n-grid-item
              v-for="achievement in achievements"
              :key="achievement.id"
            >
              <n-card
                class="achievement-card"
                :class="{ 'unlocked': achievement.unlocked }"
              >
                <div class="achievement-icon">
                  {{ achievement.icon }}
                </div>
                <div class="achievement-info">
                  <div class="achievement-name">
                    {{ achievement.name }}
                  </div>
                  <div class="achievement-desc">
                    {{ achievement.description }}
                  </div>
                  <div
                    v-if="!achievement.unlocked"
                    class="achievement-progress"
                  >
                    <n-progress
                      :percentage="achievement.progress"
                      :show-indicator="false"
                      :height="4"
                    />
                    <span class="progress-text">{{ achievement.current }}/{{ achievement.target }}</span>
                  </div>
                </div>
              </n-card>
            </n-grid-item>
          </n-grid>
        </div>

        <!-- 签到面板 -->
        <div
          v-else-if="activeTab === 'checkin'"
          class="checkin-section"
        >
          <CheckInPanel />
        </div>
      </div>

      <!-- 编辑资料模态框 -->
      <n-modal
        v-model:show="showEditProfile"
        preset="card"
        title="编辑个人资料"
        size="medium"
        class="edit-profile-modal"
      >
        <EditProfileForm
          :user="userProfile"
          @save="handleSaveProfile"
          @cancel="showEditProfile = false"
        />
      </n-modal>

      <!-- 关注者列表模态框 -->
      <n-modal
        v-model:show="showFollowersModal"
        preset="card"
        title="粉丝列表"
        size="medium"
      >
        <UserListModal :users="followers" />
      </n-modal>

      <!-- 关注列表模态框 -->
      <n-modal
        v-model:show="showFollowingModal"
        preset="card"
        title="关注列表"
        size="medium"
      >
        <UserListModal :users="following" />
      </n-modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CyberDecor from '@/components/CyberDecor.vue'
import { useUserStore } from '@/stores/user'
import { useMessage } from 'naive-ui'
import { db } from '@/utils/database'
import { PlaceholderImages } from '@/utils/imageGenerator'
import ModernPostCard from '@/components/ModernPostCard.vue'
import EditProfileForm from '@/components/EditProfileForm.vue'
import UserListModal from '@/components/UserListModal.vue'
import CheckInPanel from '@/components/CheckInPanel.vue'
import {
  CameraOutline as CameraIcon,
  PersonAddOutline as PersonAddIcon,
  ChatbubbleEllipsesOutline as ChatbubbleIcon,
  CreateOutline as EditIcon,
  SettingsOutline as SettingsIcon,
  DocumentTextOutline as DocumentIcon,
  HeartOutline as HeartIcon,
  BookmarkOutline as BookmarkIcon,
  TrophyOutline as TrophyIcon,
  CalendarOutline as CalendarIcon
} from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

const activeTab = ref('posts')
const showEditProfile = ref(false)
const showFollowersModal = ref(false)
const showFollowingModal = ref(false)

const userProfile = ref<any>(null)
const userPosts = ref<any[]>([])
const likedPosts = ref<any[]>([])
const collectedPosts = ref<any[]>([])
const followers = ref<any[]>([])
const following = ref<any[]>([])

const isOwnProfile = computed(() => {
  const profileId = route.params.id
  return !profileId || profileId === userStore.currentUser?.id?.toString()
})

const postColumns = computed(() => {
  const columnCount = 3
  const cols: any[][] = Array.from({ length: columnCount }, () => [])
  const colHeights = Array(columnCount).fill(0)
  
  userPosts.value.forEach(post => {
    const minHeightIndex = colHeights.indexOf(Math.min(...colHeights))
    cols[minHeightIndex].push(post)
    colHeights[minHeightIndex] += post.estimatedHeight || 300
  })
  
  return cols
})

const likedPostColumns = computed(() => {
  const columnCount = 3
  const cols: any[][] = Array.from({ length: columnCount }, () => [])
  const colHeights = Array(columnCount).fill(0)
  
  likedPosts.value.forEach(post => {
    const minHeightIndex = colHeights.indexOf(Math.min(...colHeights))
    cols[minHeightIndex].push(post)
    colHeights[minHeightIndex] += post.estimatedHeight || 300
  })
  
  return cols
})

// 计算成就
const achievements = computed(() => {
  if (!userProfile.value) return []

  const posts = userProfile.value.posts || 0
  const followers = userProfile.value.followers || 0
  const totalLikes = userPosts.value.reduce((sum, post) => sum + (post.likes || 0), 0)

  return [
    {
      id: 1,
      name: '新手上路',
      description: '发布第一篇帖子',
      icon: '🎯',
      unlocked: posts >= 1,
      progress: Math.min(100, posts * 100),
      current: posts,
      target: 1
    },
    {
      id: 2,
      name: '创作者',
      description: '发布10篇帖子',
      icon: '✍️',
      unlocked: posts >= 10,
      progress: Math.min(100, (posts / 10) * 100),
      current: posts,
      target: 10
    },
    {
      id: 3,
      name: '人气王',
      description: '获得100个点赞',
      icon: '❤️',
      unlocked: totalLikes >= 100,
      progress: Math.min(100, (totalLikes / 100) * 100),
      current: totalLikes,
      target: 100
    },
    {
      id: 4,
      name: '社交达人',
      description: '获得50个粉丝',
      icon: '👥',
      unlocked: followers >= 50,
      progress: Math.min(100, (followers / 50) * 100),
      current: followers,
      target: 50
    },
    {
      id: 5,
      name: '活跃用户',
      description: '连续签到7天',
      icon: '🔥',
      unlocked: false,
      progress: 0,
      current: 0,
      target: 7
    },
    {
      id: 6,
      name: '资深会员',
      description: '达到20级',
      icon: '⭐',
      unlocked: (userProfile.value.level || 0) >= 20,
      progress: Math.min(100, ((userProfile.value.level || 0) / 20) * 100),
      current: userProfile.value.level || 0,
      target: 20
    }
  ]
})

const getLevelTagType = (level?: number) => {
  if (!level) return 'default'
  if (level < 10) return 'info'
  if (level < 20) return 'success'
  if (level < 30) return 'warning'
  return 'error'
}

const formatJoinDate = (dateString?: string) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long'
  }) + '加入'
}

const loadUserProfile = async () => {
  const profileId = route.params.id

  // 如果是自己的资料页，使用当前用户信息
  if (isOwnProfile.value) {
    userProfile.value = userStore.currentUser
  } else {
    // 加载其他用户信息
    const userId = parseInt(profileId as string)
    userProfile.value = db.getUserById(userId)
  }

  // 加载用户帖子
  loadUserPosts()
  // 加载点赞和收藏
  loadLikedPosts()
  loadCollectedPosts()
}

const loadUserPosts = () => {
  if (!userProfile.value) return

  // 加载用户的真实帖子
  const allPosts = db.getPosts()
  userPosts.value = allPosts.filter(post => post.authorId === userProfile.value.id)
}

const loadLikedPosts = () => {
  if (!userProfile.value) return

  // 加载用户点赞的帖子
  const allPosts = db.getPosts()
  likedPosts.value = allPosts.filter(post => post.likedBy?.includes(userProfile.value.id))
}

const loadCollectedPosts = () => {
  if (!userProfile.value) return

  // 加载用户收藏的帖子
  const allPosts = db.getPosts()
  collectedPosts.value = allPosts.filter(post => post.collectedBy?.includes(userProfile.value.id))
}

const handleEditAvatar = () => {
  // 创建文件输入元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return

    // 检查文件大小（限制2MB）
    if (file.size > 2 * 1024 * 1024) {
      message.error('图片大小不能超过2MB')
      return
    }

    try {
      // 转为Base64
      const reader = new FileReader()
      reader.onload = (event: any) => {
        const base64 = event.target.result

        // 更新头像
        if (userStore.currentUser) {
          userStore.updateUser({ avatar: base64 })
          if (userProfile.value) {
            userProfile.value.avatar = base64
          }
          message.success('头像更新成功')
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      message.error('头像上传失败')
    }
  }

  input.click()
}

const handleSettings = () => {
  router.push('/settings')
}

const handleSaveProfile = (updatedProfile: any) => {
  userProfile.value = { ...userProfile.value, ...updatedProfile }
  showEditProfile.value = false
  message.success('个人资料更新成功')
}

const goToPostDetail = (postId: number) => {
  router.push(`/post/${postId}`)
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.profile-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
  min-height: 100vh;
  background: linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}

.profile-header-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 107, 53, 0.3);
  margin-bottom: 32px;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
  border-radius: 24px;
  transition: all 0.3s ease;
}

.profile-header-card:hover {
  border-color: rgba(255, 107, 53, 0.5);
  box-shadow: 0 16px 64px rgba(255, 107, 53, 0.2);
}

.profile-header {
  position: relative;
}

.profile-bg {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent, rgba(31, 31, 35, 0.8));
}

.user-basic-info {
  position: relative;
  padding: 0 32px 32px;
  margin-top: -60px;
  display: flex;
  gap: 24px;
  align-items: flex-end;
}

.avatar-section {
  position: relative;
  flex-shrink: 0;
}

.user-avatar {
  width: 140px;
  height: 140px;
  border: 5px solid rgba(255, 107, 53, 0.6);
  background: rgba(31, 31, 35, 0.9);
  box-shadow: 0 12px 48px rgba(255, 107, 53, 0.4);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 16px 64px rgba(255, 107, 53, 0.6);
}

.edit-avatar-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  padding: 0;
  background: rgba(255, 107, 53, 0.9);
  border: none;
  color: white;
}

.user-info {
  flex: 1;
  margin-bottom: 8px;
}

.user-name-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.user-name {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #FF6B35, #FF9800);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.level-tag {
  font-weight: 600;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.username {
  color: #FF6B35;
  font-weight: 600;
}

.user-bio {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.user-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #FF6B35;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.action-buttons {
  flex-shrink: 0;
  margin-bottom: 8px;
}

.follow-btn {
  background: linear-gradient(45deg, #FF6B35, #FF9800);
  border: none;
  font-weight: 600;
}

.message-btn,
.edit-btn,
.settings-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.2);
  color: #FFFFFF;
}

.content-tabs-section {
  margin-bottom: 24px;
  background: rgba(31, 31, 35, 0.8);
  border-radius: 12px;
  padding: 16px 24px;
  border: 1px solid rgba(255, 107, 53, 0.2);
}

.profile-tabs {
  --n-tab-text-color-active: #FF6B35;
  --n-bar-color: #FF6B35;
}

.content-area {
  min-height: 400px;
}

.waterfall-container {
  display: flex;
  gap: 24px;
  margin-top: 32px;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.post-card-item {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.post-card-item:hover {
  transform: translateY(-6px) scale(1.02);
}



.achievements-grid {
  padding: 16px 0;
}

.achievement-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 107, 53, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  padding: 28px 20px;
  border-radius: 16px;
}

.achievement-card.unlocked {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.15), rgba(255, 138, 101, 0.15));
  border-color: rgba(255, 107, 53, 0.5);
  box-shadow: 0 8px 32px rgba(255, 107, 53, 0.3);
}

.achievement-card:hover {
  transform: translateY(-6px) scale(1.05);
  box-shadow: 0 12px 40px rgba(255, 107, 53, 0.4);
  border-color: rgba(255, 107, 53, 0.6);
}

.achievement-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.achievement-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #FFFFFF;
}

.achievement-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
}

.achievement-progress {
  margin-top: 12px;
}

.progress-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
  display: block;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-basic-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 16px 24px;
  }
  
  .user-stats {
    justify-content: center;
  }
  
  .waterfall-container {
    flex-direction: column;
  }
}
</style>


