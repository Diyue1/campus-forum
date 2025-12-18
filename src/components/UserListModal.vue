<template>
  <div class="user-list-modal">
    <n-space vertical>
      <div
        v-for="user in users"
        :key="user.id"
        class="user-item"
      >
        <div class="user-info">
          <n-avatar
            :src="user.avatar"
            size="medium"
            class="user-avatar"
          />
          <div class="user-details">
            <div class="user-name">
              {{ user.nickname }}
            </div>
            <div class="user-desc">
              {{ user.bio || user.username }}
            </div>
          </div>
        </div>
        <n-button
          size="small"
          type="primary"
          ghost
          class="follow-btn"
        >
          关注
        </n-button>
      </div>
    </n-space>
    
    <n-empty
      v-if="users.length === 0"
      description="暂无用户"
      class="empty-state"
    />
  </div>
</template>

<script setup lang="ts">
interface User {
  id: number
  nickname: string
  username: string
  avatar: string
  bio?: string
}

defineProps<{
  users: User[]
}>()
</script>

<style scoped>
.user-list-modal {
  max-height: 400px;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-item:last-child {
  border-bottom: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.user-avatar {
  border: 1px solid rgba(255, 107, 53, 0.3);
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.user-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.follow-btn {
  background: rgba(255, 107, 53, 0.2);
  border: 1px solid rgba(255, 107, 53, 0.4);
  color: #FF6B35;
  font-weight: 600;
}

.empty-state {
  padding: 40px 0;
}
</style>


