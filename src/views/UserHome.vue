<template>
  <div class="user-home">
    <!-- 赛博朋克装饰元素 -->
    <div class="cyber-decorations">
      <!-- 侧边数据流 -->
      <div class="side-data-stream left-stream" />
      <div class="side-data-stream right-stream" />
      
      <!-- 顶部霓虹条 -->
      <div class="top-neon-bar" />
      
      <!-- 浮动代码片段 -->
      <div class="floating-code code-1">
        // SYSTEM_ONLINE
      </div>
      <div class="floating-code code-2">
        // DATA_SYNC
      </div>
      <div class="floating-code code-3">
        // NET_ACTIVE
      </div>
    </div>
    
    <!-- 顶部横幅 -->
    <div class="hero-banner">
      <div class="hero-content">
        <h1 class="hero-title">
          欢迎来到校园绳网
        </h1>
        <p class="hero-subtitle">
          分享你的校园生活，发现更多精彩
        </p>
        <n-space
          v-if="!userStore.isLoggedIn"
          class="hero-actions"
        >
          <n-button
            type="primary"
            size="large"
            @click="showAuthModal('register')"
          >
            立即加入
          </n-button>
          <n-button
            size="large"
            @click="showAuthModal('login')"
          >
            登录
          </n-button>
        </n-space>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 内容区装饰线 -->
      <div class="content-decor-lines">
        <div class="decor-line decor-line-1" />
        <div class="decor-line decor-line-2" />
      </div>
      <n-grid
        :cols="24"
        :x-gap="24"
      >
        <!-- 主内容区 -->
        <n-gi :span="24">
          <!-- 话题导航 -->
          <n-card class="topics-card">
            <n-space>
              <n-tag
                v-for="topic in topics"
                :key="topic.value"
                :type="selectedTopic === topic.value ? 'primary' : 'default'"
                :bordered="false"
                size="large"
                class="topic-tag"
                style="cursor: pointer"
                @click="selectedTopic = topic.value"
              >
                <template #icon>
                  <n-icon>
                    <component :is="topic.icon" />
                  </n-icon>
                </template>
                {{ topic.label }}
              </n-tag>
            </n-space>
          </n-card>

          <!-- 排序和筛选 -->
          <n-card class="filter-card">
            <n-space
              justify="space-between"
              align="center"
            >
              <n-radio-group
                v-model:value="sortBy"
                name="sort"
              >
                <n-radio-button value="latest">
                  最新
                </n-radio-button>
                <n-radio-button value="hot">
                  最热
                </n-radio-button>
                <n-radio-button value="trending">
                  热门
                </n-radio-button>
              </n-radio-group>

              <n-space>
                <n-button
                  v-if="userStore.isLoggedIn"
                  type="primary"
                  @click="$router.push('/create')"
                >
                  <template #icon>
                    <n-icon><AddIcon /></n-icon>
                  </template>
                  发布帖子
                </n-button>
              </n-space>
            </n-space>
          </n-card>

          <!-- 帖子列表 - 使用瀑布流布局 -->
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
                class="waterfall-item"
              />
            </div>
          </div>

          <!-- 加载更多 -->
          <n-space
            justify="center"
            style="margin-top: 24px"
          >
            <n-button
              v-if="hasMore"
              :loading="loading"
              size="large"
              @click="loadMore"
            >
              加载更多
            </n-button>
            <n-text
              v-else
              depth="3"
            >
              没有更多内容了
            </n-text>
          </n-space>
        </n-gi>
      </n-grid>
    </div>

    <!-- 认证模态框 -->
    <ModernAuthModal
      v-model:show="authModalVisible"
      :mode="authMode"
      @success="handleAuthSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { db, type Post } from '@/utils/database'
import { PlaceholderImages } from '@/utils/imageGenerator'
import ModernAuthModal from '@/components/ModernAuthModal.vue'
import ModernPostCard from '@/components/ModernPostCard.vue'
import {
  Add as AddIcon,
  School as SchoolIcon,
  GameController as GameIcon,
  Restaurant as FoodIcon,
  Fitness as SportsIcon,
  Briefcase as StudyIcon,
  Chatbubbles as ChatIcon
} from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

// 话题列表
const topics = [
  { label: '全部', value: 'all', icon: ChatIcon },
  { label: '校园生活', value: '校园生活', icon: SchoolIcon },
  { label: '学习交流', value: '学习交流', icon: StudyIcon },
  { label: '美食分享', value: '美食分享', icon: FoodIcon },
  { label: '运动健身', value: '运动健身', icon: SportsIcon },
  { label: '游戏娱乐', value: '游戏娱乐', icon: GameIcon }
]

const selectedTopic = ref('all')
const sortBy = ref('latest')
const loading = ref(false)
const pageSize = 10
const currentPage = ref(1)

// 认证模态框
const authModalVisible = ref(false)
const authMode = ref<'login' | 'register'>('login')

const showAuthModal = (mode: 'login' | 'register') => {
  authMode.value = mode
  authModalVisible.value = true
}

const handleAuthSuccess = () => {
  authModalVisible.value = false
  message.success('登录成功！')
}

// 获取所有帖子
const allPosts = computed(() => {
  // 只显示已审核通过的帖子
  let posts = db.getPosts().filter(p => p.status === 'approved' || !p.status)
  
  // 话题筛选
  if (selectedTopic.value !== 'all') {
    posts = posts.filter(p => p.topic === selectedTopic.value)
  }
  
  // 排序
  if (sortBy.value === 'latest') {
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } else if (sortBy.value === 'hot') {
    posts.sort((a, b) => b.likes - a.likes)
  } else if (sortBy.value === 'trending') {
    posts.sort((a, b) => {
      const scoreA = a.likes * 2 + a.comments * 3 + a.views
      const scoreB = b.likes * 2 + b.comments * 3 + b.views
      return scoreB - scoreA
    })
  }
  
  // 置顶帖子优先
  const topPosts = posts.filter(p => p.isTop)
  const normalPosts = posts.filter(p => !p.isTop)
  
  return [...topPosts, ...normalPosts]
})

// 显示的帖子
const displayedPosts = computed(() => {
  return allPosts.value.slice(0, currentPage.value * pageSize)
})

const hasMore = computed(() => {
  return displayedPosts.value.length < allPosts.value.length
})

// 瀑布流布局 - 3列
const postColumns = computed(() => {
  const columns: Post[][] = [[], [], []]
  displayedPosts.value.forEach((post, index) => {
    columns[index % 3].push(post)
  })
  return columns
})

const loadMore = () => {
  loading.value = true
  setTimeout(() => {
    currentPage.value++
    loading.value = false
  }, 500)
}

// 热门话题
const trendingTopics = computed(() => {
  const posts = db.getPosts()
  const topicCounts: Record<string, number> = {}
  
  posts.forEach(post => {
    topicCounts[post.topic] = (topicCounts[post.topic] || 0) + 1
  })
  
  return Object.entries(topicCounts)
    .map(([name, count]) => ({
      name,
      value: name,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

// 推荐用户
const recommendedUsers = computed(() => {
  const users = db.getUsers()
    .filter(u => u.id !== userStore.currentUser?.id)
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 5)
  
  return users
})

// 工具函数
const getTrendingColor = (index: number) => {
  if (index === 0) return 'error'
  if (index === 1) return 'warning'
  if (index === 2) return 'info'
  return 'default'
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.user-home {
  min-height: 100vh;
  background: #000000;
  background-attachment: fixed;
  position: relative;
  overflow-x: hidden;
}

.cyber-decorations {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.side-data-stream {
  position: absolute;
  width: 2px;
  height: 100%;
  background: linear-gradient(180deg, transparent, #00F0FF, #FF00FF, transparent);
  box-shadow: 0 0 20px #00F0FF;
  animation: stream-flow 3s linear infinite;
}

.left-stream {
  left: 5%;
  animation-delay: 0s;
}

.right-stream {
  right: 5%;
  animation-delay: 1.5s;
}

@keyframes stream-flow {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 200px;
  }
}

.top-neon-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #00F0FF, #FF00FF, #FFFF00, transparent);
  box-shadow: 0 0 20px #00F0FF;
  animation: neon-sweep 4s linear infinite;
}

@keyframes neon-sweep {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.floating-code {
  position: absolute;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00F0FF;
  text-shadow: 0 0 10px #00F0FF;
  opacity: 0.6;
  animation: float-code 4s ease-in-out infinite;
}

.code-1 {
  top: 15%;
  right: 10%;
  animation-delay: 0s;
}

.code-2 {
  top: 45%;
  left: 8%;
  animation-delay: 1.5s;
}

.code-3 {
  top: 75%;
  right: 15%;
  animation-delay: 3s;
}

@keyframes float-code {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) translateX(10px);
    opacity: 0.8;
  }
}

.content-decor-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.decor-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.3), transparent);
  height: 1px;
  width: 100%;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}

.decor-line-1 {
  top: 30%;
  animation: line-pulse 3s ease-in-out infinite;
}

.decor-line-2 {
  top: 70%;
  animation: line-pulse 3s ease-in-out infinite 1.5s;
}

@keyframes line-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scaleX(0.8);
  }
  50% {
    opacity: 0.8;
    transform: scaleX(1);
  }
}

.hero-banner {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(255, 0, 255, 0.05) 100%);
  padding: 80px 24px;
  text-align: center;
  color: white;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  z-index: 2;
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(0deg, transparent 24%, rgba(0, 240, 255, 0.03) 25%, rgba(0, 240, 255, 0.03) 26%, transparent 27%),
    linear-gradient(90deg, transparent 24%, rgba(0, 240, 255, 0.03) 25%, rgba(0, 240, 255, 0.03) 26%, transparent 27%);
  background-size: 30px 30px;
  animation: grid-scroll 20s linear infinite;
  pointer-events: none;
}

@keyframes grid-scroll {
  0% { transform: translate(0, 0); }
  100% { transform: translate(30px, 30px); }
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
  position: relative;
  z-index: 2;
}

.topics-card {
  margin-bottom: 24px;
  background: rgba(10, 10, 20, 0.8);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(0, 240, 255, 0.3);
  box-shadow: 
    0 0 20px rgba(0, 240, 255, 0.2),
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 0 20px rgba(0, 240, 255, 0.05);
  position: relative;
  overflow: hidden;
}

.topics-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00F0FF, #FF00FF, transparent);
  animation: card-scan 3s linear infinite;
}

@keyframes card-scan {
  0% { left: -100%; }
  100% { left: 100%; }
}

.topic-tag {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
}

.topic-tag:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
}

.hero-title {
  font-size: 48px;
  font-weight: 900;
  margin: 0 0 16px 0;
  color: #00F0FF;
  text-shadow: 
    0 0 10px #00F0FF,
    0 0 20px #00F0FF,
    0 0 40px #00F0FF,
    0 0 80px rgba(255, 0, 255, 0.5);
  letter-spacing: 2px;
  animation: title-glow 2s ease-in-out infinite;
  position: relative;
  z-index: 1;
}

@keyframes title-glow {
  0%, 100% {
    text-shadow: 
      0 0 10px #00F0FF,
      0 0 20px #00F0FF,
      0 0 40px #00F0FF,
      0 0 80px rgba(255, 0, 255, 0.5);
  }
  50% {
    text-shadow: 
      0 0 20px #00F0FF,
      0 0 40px #00F0FF,
      0 0 80px #00F0FF,
      0 0 120px rgba(255, 0, 255, 0.8);
  }
}

.hero-subtitle {
  font-size: 20px;
  color: rgba(0, 240, 255, 0.8);
  margin: 0 0 32px 0;
  font-weight: 500;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
  position: relative;
  z-index: 1;
}

.trending-card,
.recommend-card {
  margin-bottom: 20px;
  background: rgba(10, 10, 20, 0.8);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(0, 240, 255, 0.3);
  box-shadow: 
    0 0 20px rgba(0, 240, 255, 0.2),
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 0 20px rgba(0, 240, 255, 0.05);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 107, 53, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.trending-item,
.recommend-item {
  padding: 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
}

.trending-item:hover,
.recommend-item:hover {
  background: rgba(255, 107, 53, 0.1);
  border-color: rgba(255, 107, 53, 0.3);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2);
}

.recommend-name {
  font-weight: 700;
  font-size: 15px;
  color: #fff;
}

/* 瀑布流布局 */
.waterfall-container {
  display: flex;
  gap: 24px;
  width: 100%;
  margin-top: 16px;
  position: relative;
}

.waterfall-container::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00F0FF, transparent);
  box-shadow: 0 0 10px #00F0FF;
  animation: waterfall-glow 2s ease-in-out infinite;
}

@keyframes waterfall-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.waterfall-item {
  break-inside: avoid;
  margin-bottom: 0;
}
</style>
