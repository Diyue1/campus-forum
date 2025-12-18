<template>
  <div class="explore-container cyber-page-container">
    <CyberDecor />
    <div class="cyber-content">
      <!-- 搜索区域 -->
      <div class="search-section cyber-card">
        <n-input
          v-model:value="searchQuery"
          placeholder="搜索帖子、用户..."
          size="large"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <n-icon><SearchIcon /></n-icon>
          </template>
        </n-input>
      </div>

      <!-- 筛选和排序区域 -->
      <div class="filter-sort-section">
        <n-card class="filter-card cyber-card">
          <n-space
            justify="space-between"
            align="center"
          >
            <!-- 快速筛选标签 -->
            <n-space>
              <n-tag
                v-for="category in quickFilters"
                :key="category.key"
                :type="activeCategory === category.key ? 'primary' : 'default'"
                checkable
                :checked="activeCategory === category.key"
                class="category-tag"
                @update:checked="() => handleCategoryChange(category.key)"
              >
                {{ category.icon }} {{ category.label }}
              </n-tag>
            </n-space>

            <!-- 排序和高级筛选 -->
            <n-space>
              <n-select
                v-model:value="sortBy"
                :options="sortOptions"
                placeholder="排序方式"
                style="width: 120px;"
                size="small"
              />
              <n-button
                :type="showAdvancedFilter ? 'primary' : 'default'"
                size="small"
                @click="showAdvancedFilter = !showAdvancedFilter"
              >
                <template #icon>
                  <n-icon>
                    <FilterIcon />
                  </n-icon>
                </template>
                高级筛选
              </n-button>
            </n-space>
          </n-space>
        </n-card>
      </div>



      <!-- 热门话题区域 -->
      <div class="hot-topics-section">
        <n-card
          title="🔥 热门话题"
          class="topics-card cyber-card"
        >
          <n-grid
            :cols="4"
            :x-gap="16"
            :y-gap="16"
          >
            <n-grid-item
              v-for="topic in hotTopics"
              :key="topic.id"
            >
              <div
                class="topic-card"
                @click="searchTopic(topic.name)"
              >
                <div class="topic-icon">
                  {{ topic.icon }}
                </div>
                <div class="topic-info">
                  <div class="topic-name">
                    #{{ topic.name }}
                  </div>
                  <div class="topic-count">
                    {{ topic.count }}条讨论
                  </div>
                </div>
              </div>
            </n-grid-item>
          </n-grid>
        </n-card>
      </div>

      <!-- 搜索结果/推荐内容 -->
      <div class="results-section">
        <n-tabs
          v-model:value="activeResultTab"
          type="line"
          class="result-tabs"
        >
          <n-tab-pane
            name="posts"
            tab="帖子"
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
          </n-tab-pane>
        
          <n-tab-pane
            name="users"
            tab="用户"
          >
            <n-grid
              :cols="3"
              :x-gap="16"
              :y-gap="16"
            >
              <n-grid-item
                v-for="user in searchUsers"
                :key="user.id"
              >
                <UserCard :user="user" />
              </n-grid-item>
            </n-grid>
          </n-tab-pane>
        </n-tabs>
      </div>

      <!-- 加载更多 -->
      <div
        v-if="hasMore"
        class="load-more-section"
      >
        <n-button
          :loading="loading"
          size="large"
          class="load-more-btn"
          @click="loadMore"
        >
          {{ loading ? '加载中...' : '加载更多' }}
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CyberDecor from '@/components/CyberDecor.vue'
import ModernPostCard from '@/components/ModernPostCard.vue'
import UserCard from '@/components/UserCard.vue'
import { db } from '@/utils/database'
import {
  SearchOutline as SearchIcon,
  FunnelOutline as FilterIcon
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const activeCategory = ref('all')
const activeResultTab = ref('posts')
const loading = ref(false)
const hasMore = ref(true)
const posts = ref<any[]>([])
const searchUsers = ref<any[]>([])
const showAdvancedFilter = ref(false)
const sortBy = ref('latest')
const currentFilters = ref<any>({})

const quickFilters = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: 'hot', label: '热门', icon: '🔥' },
  { key: 'study', label: '学习', icon: '📚' },
  { key: 'life', label: '生活', icon: '🏫' },
  { key: 'food', label: '美食', icon: '🍜' },
  { key: 'travel', label: '旅行', icon: '✈️' }
]

const sortOptions = [
  { label: '最新发布', value: 'latest' },
  { label: '最多点赞', value: 'likes' },
  { label: '最多评论', value: 'comments' },
  { label: '最多浏览', value: 'views' }
]

const hotTopics = ref([
  { id: 1, name: '校园生活', icon: '🏫', count: 1234 },
  { id: 2, name: '学习分享', icon: '📚', count: 856 },
  { id: 3, name: '美食推荐', icon: '🍜', count: 642 },
  { id: 4, name: '社团活动', icon: '🎭', count: 523 },
  { id: 5, name: '求职经验', icon: '💼', count: 387 },
  { id: 6, name: '技术交流', icon: '💻', count: 295 },
  { id: 7, name: '运动健身', icon: '🏃', count: 234 },
  { id: 8, name: '旅行分享', icon: '✈️', count: 198 }
])

const postColumns = computed(() => {
  const columnCount = 3
  const cols: any[][] = Array.from({ length: columnCount }, () => [])
  const colHeights = Array(columnCount).fill(0)
  
  posts.value.forEach(post => {
    const minHeightIndex = colHeights.indexOf(Math.min(...colHeights))
    cols[minHeightIndex].push(post)
    colHeights[minHeightIndex] += post.estimatedHeight || 300
  })
  
  return cols
})

// 使用导入的数据生成函数
const generateFilteredPosts = (count: number) => {
  // 只获取已审核通过的帖子
  let allPosts = db.getPosts().filter(p => p.status === 'approved' || !p.status)
  
  // 应用筛选条件
  if (activeCategory.value !== 'all') {
    const categoryMap: Record<string, string[]> = {
      hot: [], // 热门帖子通过isHot字段筛选
      study: ['学习经验', '考试攻略'],
      life: ['校园生活', '宿舍生活'],
      food: ['美食推荐'],
      travel: ['旅行分享']
    }
    
    if (activeCategory.value === 'hot') {
      allPosts = allPosts.filter(post => post.isHot)
    } else if (categoryMap[activeCategory.value]) {
      allPosts = allPosts.filter(post => 
        categoryMap[activeCategory.value].includes(post.topic)
      )
    }
  }
  
  // 应用高级筛选
  if (currentFilters.value.topics?.length > 0) {
    allPosts = allPosts.filter(post => 
      currentFilters.value.topics.includes(post.topic)
    )
  }
  
  if (currentFilters.value.hasImages) {
    allPosts = allPosts.filter(post => post.images && post.images.length > 0)
  }
  
  if (currentFilters.value.isHot) {
    allPosts = allPosts.filter(post => post.isHot)
  }
  
  // 应用排序
  switch (sortBy.value) {
    case 'likes':
      allPosts.sort((a, b) => b.likes - a.likes)
      break
    case 'comments':
      allPosts.sort((a, b) => b.comments - a.comments)
      break
    case 'views':
      allPosts.sort((a, b) => b.views - a.views)
      break
    default:
      allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  
  return allPosts.slice(0, count).map(post => ({
    ...post,
    estimatedHeight: 250 + Math.floor(Math.random() * 200) + ((post.images?.length || 0) * 100)
  }))
}

const handleCategoryChange = (category: string) => {
  activeCategory.value = category
  posts.value = []
  hasMore.value = true
  loadPosts()
}

const handleFiltersChanged = (filters: any) => {
  currentFilters.value = filters
  posts.value = []
  hasMore.value = true
  loadPosts()
}

const searchTopic = (topicName: string) => {
  searchQuery.value = topicName
  router.push({
    path: '/explore',
    query: { q: topicName }
  })
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/explore',
      query: { q: searchQuery.value }
    })
  }
}

const loadPosts = async () => {
  loading.value = true
  
  try {
    const searchQuery = (route.query.q as string) || ''
    
    // 使用数据库搜索功能
    const searchResults = db.searchPosts(searchQuery, {
      topic: activeCategory.value === 'all' ? undefined : getTopicFilter(activeCategory.value),
      hasImages: currentFilters.value.hasImages,
      isHot: currentFilters.value.isHot || activeCategory.value === 'hot',
      sortBy: sortBy.value
    })
    
    posts.value = searchResults.map(post => ({
      ...post,
      estimatedHeight: 250 + Math.floor(Math.random() * 200) + ((post.images?.length || 0) * 100)
    }))
    
    // 模拟搜索用户
    const allUsers = db.getUsers()
    if (searchQuery) {
      searchUsers.value = allUsers.filter(user => 
        user.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10)
    } else {
      searchUsers.value = allUsers.slice(0, 5)
    }
    
    hasMore.value = false // 暂时禁用加载更多
    
  } finally {
    loading.value = false
  }
}

// 获取话题筛选条件
const getTopicFilter = (category: string) => {
  const categoryMap: Record<string, string> = {
    study: '学习经验',
    life: '校园生活', 
    food: '美食推荐',
    travel: '旅行分享'
  }
  return categoryMap[category]
}

const loadMore = () => {
  if (!loading.value && hasMore.value) {
    loadPosts()
  }
}

const goToPostDetail = (postId: number) => {
  router.push(`/post/${postId}`)
}

// 监听排序变化
watch(sortBy, () => {
  posts.value = []
  hasMore.value = true
  loadPosts()
})

// 监听路由查询参数
watch(() => route.query, (newQuery) => {
  if (newQuery.q) {
    // 处理搜索查询
    posts.value = []
    hasMore.value = true
    loadPosts()
  }
}, { immediate: true })

onMounted(() => {
  // 初始化用户数据
  const allUsers = db.getUsers()
  searchUsers.value = allUsers.slice(0, 3).map(user => ({
    ...user,
    followers: user.followers || 0,
    posts: user.posts || 0
  }))
  
  loadPosts()
})
</script>

<style scoped>
.explore-container {
  /* cyber-page-container 样式已在全局定义 */
}

.search-section {
  margin-bottom: 32px;
}

.search-section :deep(.n-input) {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 16px;
  transition: all 0.3s ease;
  font-size: 16px;
}

.search-section :deep(.n-input:hover) {
  border-color: rgba(255, 107, 53, 0.6);
  background: rgba(255, 255, 255, 0.12);
}

.search-section :deep(.n-input:focus-within) {
  border-color: rgba(255, 107, 53, 0.8);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
}

.filter-sort-section {
  margin-bottom: 32px;
}

.advanced-filter-section {
  margin-bottom: 24px;
}

.filter-card {
  background: rgba(31, 31, 35, 0.8);
  border: 1px solid rgba(255, 107, 53, 0.2);
}

.category-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.hot-topics-section {
  margin-bottom: 32px;
}

.topics-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 107, 53, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.topic-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(255, 107, 53, 0.15);
}

.topic-card:hover {
  background: rgba(255, 107, 53, 0.15);
  border-color: rgba(255, 107, 53, 0.5);
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 40px rgba(255, 107, 53, 0.3);
}

.topic-icon {
  font-size: 32px;
  filter: drop-shadow(0 2px 8px rgba(255, 107, 53, 0.3));
}

.topic-info {
  flex: 1;
}

.topic-name {
  font-weight: 700;
  font-size: 16px;
  color: #FF6B35;
  margin-bottom: 6px;
  text-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.topic-count {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.results-section {
  margin-bottom: 32px;
}

.result-tabs {
  --n-tab-text-color-active: #FF6B35;
  --n-bar-color: #FF6B35;
}

.waterfall-container {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card-item {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.post-card-item:hover {
  transform: translateY(-6px) scale(1.02);
}

.load-more-section {
  display: flex;
  justify-content: center;
  margin: 40px 0;
}

.load-more-btn {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(255, 138, 101, 0.2));
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 107, 53, 0.4);
  font-weight: 600;
  padding: 12px 48px;
  border-radius: 24px;
  transition: all 0.3s ease;
}

.load-more-btn:hover {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.3), rgba(255, 138, 101, 0.3));
  border-color: rgba(255, 107, 53, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.4);
}

.load-more-section {
  display: flex;
  justify-content: center;
  margin: 32px 0;
}

.load-more-btn {
  background: linear-gradient(45deg, #FF6B35, #FF9800);
  border: none;
  color: white;
  font-weight: 600;
}
</style>

