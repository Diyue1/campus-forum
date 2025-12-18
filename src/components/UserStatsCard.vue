<template>
  <n-card
    class="user-stats-card"
    :bordered="false"
  >
    <n-space
      vertical
      align="center"
      :size="16"
    >
      <!-- 用户头像 -->
      <n-avatar
        :src="user.avatar"
        :size="100"
        :fallback-src="PlaceholderImages.avatar(user.nickname[0], 100)"
        class="user-avatar"
      />

      <!-- 用户信息 -->
      <div class="user-info">
        <n-space
          align="center"
          :size="8"
        >
          <n-h3 style="margin: 0">
            {{ user.nickname }}
          </n-h3>
          <n-tag
            v-if="user.isVerified"
            type="success"
            size="small"
            :bordered="false"
          >
            <template #icon>
              <n-icon><CheckmarkCircleIcon /></n-icon>
            </template>
            已认证
          </n-tag>
          <n-tag
            v-if="user.role === 'admin'"
            type="error"
            size="small"
            :bordered="false"
          >
            管理员
          </n-tag>
        </n-space>
        <n-text
          depth="3"
          style="font-size: 14px"
        >
          @{{ user.username }}
        </n-text>
      </div>

      <!-- 用户简介 -->
      <n-text
        v-if="user.bio"
        class="user-bio"
      >
        {{ user.bio }}
      </n-text>

      <!-- 徽章 -->
      <n-space
        v-if="user.badges && user.badges.length > 0"
        size="small"
      >
        <n-tag
          v-for="badge in user.badges"
          :key="badge"
          type="warning"
          size="small"
          :bordered="false"
        >
          🏆 {{ badge }}
        </n-tag>
      </n-space>

      <!-- 等级信息 -->
      <div class="level-info">
        <n-space
          align="center"
          :size="8"
        >
          <n-icon
            size="20"
            color="#FFD700"
          >
            <StarIcon />
          </n-icon>
          <span>Lv.{{ user.level }}</span>
        </n-space>
        <n-progress
          type="line"
          :percentage="expPercentage"
          :show-indicator="false"
          :height="6"
          :border-radius="3"
          style="margin-top: 8px"
        />
        <n-text
          depth="3"
          style="font-size: 12px; margin-top: 4px"
        >
          {{ user.exp }} / {{ nextLevelExp }} EXP
        </n-text>
      </div>

      <!-- 统计数据 -->
      <n-grid
        :cols="3"
        :x-gap="12"
        class="stats-grid"
      >
        <n-gi>
          <div
            class="stat-item"
            @click="$emit('show-posts')"
          >
            <div class="stat-value">
              {{ user.posts }}
            </div>
            <div class="stat-label">
              帖子
            </div>
          </div>
        </n-gi>
        <n-gi>
          <div
            class="stat-item"
            @click="$emit('show-followers')"
          >
            <div class="stat-value">
              {{ user.followers }}
            </div>
            <div class="stat-label">
              粉丝
            </div>
          </div>
        </n-gi>
        <n-gi>
          <div
            class="stat-item"
            @click="$emit('show-following')"
          >
            <div class="stat-value">
              {{ user.following }}
            </div>
            <div class="stat-label">
              关注
            </div>
          </div>
        </n-gi>
      </n-grid>

      <!-- 操作按钮 -->
      <n-space
        v-if="showActions"
        style="width: 100%"
      >
        <n-button
          type="primary"
          block
          @click="$router.push('/profile')"
        >
          <template #icon>
            <n-icon><PersonIcon /></n-icon>
          </template>
          查看主页
        </n-button>
        <n-button
          block
          @click="$router.push('/settings')"
        >
          <template #icon>
            <n-icon><SettingsIcon /></n-icon>
          </template>
          设置
        </n-button>
      </n-space>

      <!-- 加入时间 -->
      <n-text
        depth="3"
        style="font-size: 12px"
      >
        加入于 {{ formatDate(user.joinDate) }}
      </n-text>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '@/utils/database'
import { PlaceholderImages } from '@/utils/imageGenerator'
import {
  CheckmarkCircle as CheckmarkCircleIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Settings as SettingsIcon
} from '@vicons/ionicons5'

interface Props {
  user: User
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true
})

defineEmits(['show-posts', 'show-followers', 'show-following'])

const router = useRouter()

// 计算下一级所需经验
const nextLevelExp = computed(() => {
  return props.user.level * 100
})

// 计算经验百分比
const expPercentage = computed(() => {
  return (props.user.exp / nextLevelExp.value) * 100
})

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.user-stats-card {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%);
  border: 1px solid rgba(255, 107, 53, 0.2);
}

.user-avatar {
  border: 3px solid rgba(255, 107, 53, 0.5);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.user-info {
  text-align: center;
}

.user-bio {
  text-align: center;
  max-width: 250px;
  line-height: 1.5;
}

.level-info {
  width: 100%;
  text-align: center;
}

.stats-grid {
  width: 100%;
}

.stat-item {
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #FF6B35;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}
</style>

