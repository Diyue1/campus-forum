<template>
  <div class="admin-layout">
    <!-- 顶部导航 -->
    <div class="admin-header">
      <div class="header-left">
        <h1>🛡️ 管理员控制台</h1>
      </div>
      <div class="header-right">
        <n-space>
          <n-tag type="error">
            管理员
          </n-tag>
          <span>{{ userStore.currentUser?.nickname }}</span>
          <n-button
            type="error"
            @click="handleLogout"
          >
            退出登录
          </n-button>
        </n-space>
      </div>
    </div>

    <!-- 侧边栏 + 内容区 -->
    <div class="admin-body">
      <!-- 侧边栏 -->
      <div class="admin-sidebar">
        <n-menu
          v-model:value="activeMenu"
          :options="menuOptions"
          @update:value="handleMenuSelect"
        />
      </div>

      <!-- 内容区 -->
      <div class="admin-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { NIcon } from 'naive-ui'
import {
  PeopleOutline,
  DocumentTextOutline,
  ChatbubblesOutline,
  SettingsOutline,
  StatsChartOutline,
  ShieldCheckmarkOutline
} from '@vicons/ionicons5'

const router = useRouter()
const userStore = useUserStore()
const activeMenu = ref('dashboard')

const renderIcon = (icon: any) => {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = [
  {
    label: '数据统计',
    key: 'dashboard',
    icon: renderIcon(StatsChartOutline)
  },
  {
    label: '用户管理',
    key: 'users',
    icon: renderIcon(PeopleOutline)
  },
  {
    label: '帖子管理',
    key: 'posts',
    icon: renderIcon(DocumentTextOutline)
  },
  {
    label: '评论管理',
    key: 'comments',
    icon: renderIcon(ChatbubblesOutline)
  },
  {
    label: '帖子审核',
    key: 'approval',
    icon: renderIcon(ShieldCheckmarkOutline)
  },
  {
    label: '举报管理',
    key: 'reports',
    icon: renderIcon(ShieldCheckmarkOutline)
  },
  {
    label: '热门话题',
    key: 'topics',
    icon: renderIcon(ChatbubblesOutline)
  },
  {
    label: '系统设置',
    key: 'settings',
    icon: renderIcon(SettingsOutline)
  }
]

const handleMenuSelect = (key: string) => {
  router.push(`/admin/${key}`)
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}

onMounted(() => {
  // 检查是否是管理员
  if (!userStore.currentUser || userStore.currentUser.role !== 'admin') {
    router.push('/')
  }
})
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #0f0c29;
}

.admin-header {
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.header-left h1 {
  margin: 0;
  color: white;
  font-size: 20px;
}

.header-right {
  color: white;
}

.admin-body {
  display: flex;
  height: calc(100vh - 64px);
}

.admin-sidebar {
  width: 240px;
  background: rgba(255, 255, 255, 0.05);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
</style>

