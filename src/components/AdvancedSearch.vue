<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    title="高级搜索"
    class="advanced-search-modal"
    style="width: 600px"
  >
    <n-space
      vertical
      :size="16"
    >
      <!-- 关键词搜索 -->
      <n-input
        v-model:value="searchQuery"
        placeholder="输入关键词搜索..."
        size="large"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <n-icon><SearchIcon /></n-icon>
        </template>
      </n-input>

      <!-- 筛选条件 -->
      <n-collapse>
        <n-collapse-item
          title="筛选条件"
          name="filters"
        >
          <n-space
            vertical
            :size="12"
          >
            <!-- 话题筛选 -->
            <div>
              <n-text
                depth="3"
                style="font-size: 12px"
              >
                话题
              </n-text>
              <n-select
                v-model:value="filters.topic"
                :options="topicOptions"
                placeholder="选择话题"
                clearable
                style="margin-top: 8px"
              />
            </div>

            <!-- 时间范围 -->
            <div>
              <n-text
                depth="3"
                style="font-size: 12px"
              >
                时间范围
              </n-text>
              <n-select
                v-model:value="filters.timeRange"
                :options="timeRangeOptions"
                placeholder="选择时间范围"
                clearable
                style="margin-top: 8px"
              />
            </div>

            <!-- 排序方式 -->
            <div>
              <n-text
                depth="3"
                style="font-size: 12px"
              >
                排序方式
              </n-text>
              <n-select
                v-model:value="filters.sortBy"
                :options="sortOptions"
                placeholder="选择排序方式"
                style="margin-top: 8px"
              />
            </div>

            <!-- 其他筛选 -->
            <div>
              <n-text
                depth="3"
                style="font-size: 12px"
              >
                其他
              </n-text>
              <n-space style="margin-top: 8px">
                <n-checkbox v-model:checked="filters.hasImages">
                  包含图片
                </n-checkbox>
                <n-checkbox v-model:checked="filters.isHot">
                  仅热门
                </n-checkbox>
              </n-space>
            </div>
          </n-space>
        </n-collapse-item>
      </n-collapse>

      <!-- 搜索历史 -->
      <div v-if="searchHistory.length > 0">
        <n-space
          justify="space-between"
          align="center"
        >
          <n-text
            depth="3"
            style="font-size: 12px"
          >
            搜索历史
          </n-text>
          <n-button
            text
            size="tiny"
            @click="clearHistory"
          >
            清除
          </n-button>
        </n-space>
        <n-space
          style="margin-top: 8px"
          size="small"
        >
          <n-tag
            v-for="(item, index) in searchHistory"
            :key="index"
            closable
            style="cursor: pointer"
            @close="removeHistoryItem(index)"
            @click="searchQuery = item"
          >
            {{ item }}
          </n-tag>
        </n-space>
      </div>

      <!-- 热门搜索 -->
      <div>
        <n-text
          depth="3"
          style="font-size: 12px"
        >
          热门搜索
        </n-text>
        <n-space
          style="margin-top: 8px"
          size="small"
        >
          <n-tag
            v-for="item in hotSearches"
            :key="item"
            type="warning"
            style="cursor: pointer"
            @click="searchQuery = item"
          >
            🔥 {{ item }}
          </n-tag>
        </n-space>
      </div>
    </n-space>

    <template #footer>
      <n-space justify="end">
        <n-button @click="handleReset">
          重置
        </n-button>
        <n-button
          type="primary"
          @click="handleSearch"
        >
          <template #icon>
            <n-icon><SearchIcon /></n-icon>
          </template>
          搜索
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search as SearchIcon } from '@vicons/ionicons5'

interface Props {
  show: boolean
}

interface Filters {
  topic: string | null
  timeRange: string | null
  sortBy: string
  hasImages: boolean
  isHot: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:show', 'search'])

const router = useRouter()

const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const searchQuery = ref('')
const filters = ref<Filters>({
  topic: null,
  timeRange: null,
  sortBy: 'latest',
  hasImages: false,
  isHot: false
})

// 搜索历史
const searchHistory = ref<string[]>(
  JSON.parse(localStorage.getItem('search_history') || '[]')
)

// 话题选项
const topicOptions = [
  { label: '校园生活', value: '校园生活' },
  { label: '学习交流', value: '学习交流' },
  { label: '美食分享', value: '美食分享' },
  { label: '运动健身', value: '运动健身' },
  { label: '游戏娱乐', value: '游戏娱乐' }
]

// 时间范围选项
const timeRangeOptions = [
  { label: '最近一天', value: '1d' },
  { label: '最近一周', value: '7d' },
  { label: '最近一月', value: '30d' },
  { label: '最近三月', value: '90d' }
]

// 排序选项
const sortOptions = [
  { label: '最新发布', value: 'latest' },
  { label: '最多点赞', value: 'likes' },
  { label: '最多评论', value: 'comments' },
  { label: '最多浏览', value: 'views' }
]

// 热门搜索
const hotSearches = ref([
  '期末复习',
  '美食推荐',
  '社团活动',
  '考研经验',
  '实习招聘'
])

// 执行搜索
const handleSearch = () => {
  if (!searchQuery.value.trim()) return

  // 保存搜索历史
  if (!searchHistory.value.includes(searchQuery.value)) {
    searchHistory.value.unshift(searchQuery.value)
    if (searchHistory.value.length > 10) {
      searchHistory.value = searchHistory.value.slice(0, 10)
    }
    localStorage.setItem('search_history', JSON.stringify(searchHistory.value))
  }

  // 触发搜索事件
  emit('search', {
    query: searchQuery.value,
    filters: filters.value
  })

  // 跳转到搜索结果页
  router.push({
    path: '/explore',
    query: {
      q: searchQuery.value,
      topic: filters.value.topic || undefined,
      timeRange: filters.value.timeRange || undefined,
      sortBy: filters.value.sortBy,
      hasImages: filters.value.hasImages ? '1' : undefined,
      isHot: filters.value.isHot ? '1' : undefined
    }
  })

  visible.value = false
}

// 重置筛选
const handleReset = () => {
  searchQuery.value = ''
  filters.value = {
    topic: null,
    timeRange: null,
    sortBy: 'latest',
    hasImages: false,
    isHot: false
  }
}

// 清除搜索历史
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('search_history')
}

// 删除单个历史记录
const removeHistoryItem = (index: number) => {
  searchHistory.value.splice(index, 1)
  localStorage.setItem('search_history', JSON.stringify(searchHistory.value))
}
</script>

<style scoped>
.advanced-search-modal {
  max-height: 80vh;
  overflow-y: auto;
}
</style>

