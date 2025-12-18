<template>
  <n-card class="user-card">
    <div class="user-header">
      <n-avatar
        :src="user.avatar"
        size="large"
        class="user-avatar"
      />
      <div class="user-info">
        <div class="user-name">
          {{ user.nickname }}
        </div>
        <div class="user-bio">
          {{ user.bio }}
        </div>
      </div>
    </div>
    
    <div class="user-stats">
      <div class="stat-item">
        <div class="stat-value">
          {{ user.followers }}
        </div>
        <div class="stat-label">
          粉丝
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-value">
          {{ user.posts }}
        </div>
        <div class="stat-label">
          帖子
        </div>
      </div>
    </div>
    
    <n-button
      type="primary"
      block
      class="follow-btn"
    >
      关注
    </n-button>
  </n-card>
</template>

<script setup lang="ts">
interface User {
  id: number
  nickname: string
  avatar: string
  bio: string
  followers: number
  posts: number
}

defineProps<{
  user: User
}>()
</script>

<style scoped>
.user-card {
  background: rgba(31, 31, 35, 0.9);
  border: 1px solid rgba(255, 107, 53, 0.2);
  transition: all 0.3s ease;
}

.user-card:hover {
  border-color: rgba(255, 107, 53, 0.4);
  transform: translateY(-4px);
}

.user-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.user-avatar {
  border: 2px solid rgba(255, 107, 53, 0.3);
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.user-bio {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.user-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #FF6B35;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.follow-btn {
  background: linear-gradient(45deg, #FF6B35, #FF9800);
  border: none;
  font-weight: 600;
}
</style>


