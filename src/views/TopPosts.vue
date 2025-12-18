<template>
  <div class="top-posts-container cyber-page-container">
    <CyberDecor />
    <div class="cyber-content">
      <div class="page-header">
        <h1 class="cyber-title">
          📌 置顶帖子
        </h1>
        <p class="subtitle">
          管理员精选的重要内容
        </p>
      </div>
    
      <n-empty
        v-if="topPosts.length === 0"
        description="暂无置顶帖子"
      >
        <template #icon>
          <n-icon
            size="60"
            color="#FF6B35"
          >
            <PinIcon />
          </n-icon>
        </template>
      </n-empty>
    
      <div
        v-else
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CyberDecor from '@/components/CyberDecor.vue'
import { db } from '@/utils/database'
import ModernPostCard from '@/components/ModernPostCard.vue'
import { Pin as PinIcon } from '@vicons/ionicons5'

const router = useRouter()
const topPosts = ref<any[]>([])

const postColumns = computed(() => {
  const columns: any[][] = [[], [], []]
  topPosts.value.forEach((post, index) => {
    columns[index % 3].push(post)
  })
  return columns
})

const loadTopPosts = () => {
  // 只获取已审核且置顶的帖子
  const posts = db.getPosts().filter(p => p.isTop && (p.status === 'approved' || !p.status))
  topPosts.value = posts.map(p => ({
    ...p,
    estimatedHeight: 300
  }))
}

const goToPostDetail = (id: number) => {
  router.push(`/post/${id}`)
}

onMounted(loadTopPosts)
</script>

<style scoped>
.top-posts-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 20px;
  border: 2px solid rgba(102, 126, 234, 0.3);
}

.page-header h1 {
  font-size: 36px;
  color: white;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.posts-grid {
  margin-top: 24px;
}

.waterfall-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card-item {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.post-card-item:hover {
  transform: translateY(-4px);
}
</style>

