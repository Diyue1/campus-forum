<template>
  <n-layout class="layout-container">
    <!-- 顶部导航栏 -->
    <n-layout-header
      class="header"
      bordered
    >
      <div class="header-content">
        <!-- Logo区域 -->
        <div class="logo-section">
          <div class="logo">
            <n-icon
              size="32"
              color="#FF6B35"
            >
              <LogoIcon />
            </n-icon>
            <span class="logo-text">校园绳网</span>
          </div>
        </div>

        <!-- 搜索栏 -->
        <div class="search-section">
          <n-input
            v-model:value="searchValue"
            placeholder="搜索帖子、用户..."
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
            @click="showAdvancedSearch = true"
          >
            <template #prefix>
              <n-icon>
                <SearchIcon />
              </n-icon>
            </template>
            <template #suffix>
              <n-button
                text
                @click.stop="showAdvancedSearch = true"
              >
                高级
              </n-button>
            </template>
          </n-input>
        </div>

        <!-- 用户操作区域 -->
        <div class="user-section">
          <n-space>
            <!-- 3D 校园入口按钮 -->
            <n-button
              type="info"
              size="medium"
              class="campus-3d-btn"
              @click="$router.push('/campus-3d')"
            >
              <template #icon>
                <n-icon>
                  <CubeIcon />
                </n-icon>
              </template>
              3D校园
            </n-button>

            <!-- 发帖按钮 - 仅登录用户可见 -->
            <n-button
              v-if="userStore.isLoggedIn"
              type="primary"
              size="medium"
              class="create-btn"
              @click="$router.push('/create')"
            >
              <template #icon>
                <n-icon>
                  <AddIcon />
                </n-icon>
              </template>
              发帖
            </n-button>

            <!-- 通知中心 - 仅登录用户可见 -->
            <NotificationCenter v-if="userStore.isLoggedIn" />

            <!-- 登录/注册按钮 - 未登录用户可见 -->
            <template v-if="!userStore.isLoggedIn">
              <n-button @click="showAuthModal('login')">
                登录
              </n-button>
              <n-button
                type="primary"
                @click="showAuthModal('register')"
              >
                注册
              </n-button>
            </template>

            <!-- 用户头像菜单 - 仅登录用户可见 -->
            <n-dropdown 
              v-if="userStore.isLoggedIn"
              :options="userMenuOptions" 
              @select="handleUserMenuSelect"
            >
              <n-avatar
                :src="userStore.currentUser?.avatar"
                :fallback-src="PlaceholderImages.avatar(userStore.currentUser?.nickname?.[0] || 'U', 40)"
                size="medium"
                class="user-avatar"
              />
            </n-dropdown>
          </n-space>
        </div>
      </div>
    </n-layout-header>

    <!-- 主体内容区域 -->
    <n-layout
      has-sider
      class="main-layout"
    >
      <!-- 左侧导航栏 -->
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        show-trigger
        class="sidebar"
      >
        <n-menu
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          :value="activeMenu"
          class="nav-menu"
          @update:value="handleMenuSelect"
        />
      </n-layout-sider>

      <!-- 内容区域 -->
      <n-layout-content class="content-area">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>

  <!-- 登录/注册弹窗 -->
  <ModernAuthModal
    v-model:show="showAuth"
    :mode="authMode"
    @success="handleAuthSuccess"
  />

  <!-- 高级搜索弹窗 -->
  <AdvancedSearch
    v-model:show="showAdvancedSearch"
    @search="handleAdvancedSearch"
  />
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import NotificationCenter from './NotificationCenter.vue'
import ModernAuthModal from './ModernAuthModal.vue'
import AdvancedSearch from './AdvancedSearch.vue'
import { PlaceholderImages } from '@/utils/imageGenerator'
import { Logger, LogActions } from '@/utils/logger'
import {
  HomeOutline as HomeIcon,
  CompassOutline as ExploreIcon,
  PersonOutline as ProfileIcon,
  ChatbubbleEllipsesOutline as MessagesIcon,
  SearchOutline as SearchIcon,
  AddOutline as AddIcon,
  LogOutOutline as LogoutIcon,
  SettingsOutline as SettingsIcon,
  FlashOutline as LogoIcon,
  CubeOutline as CubeIcon
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
// const message = useMessage() // 移除直接使用

const collapsed = ref(false)
const searchValue = ref('')
const showAuth = ref(false)
const authMode = ref<'login' | 'register'>('login')
const showAdvancedSearch = ref(false)



const activeMenu = computed(() => {
  const routeMap: Record<string, string> = {
    'Home': 'home',
    'Explore': 'explore',
    'Profile': 'profile',
    'Messages': 'messages'
  }
  return routeMap[route.name as string] || 'home'
})

// 导航菜单选项
const menuOptions = [
  {
    label: '首页',
    key: 'home',
    icon: () => h(HomeIcon)
  },
  {
    label: '发现',
    key: 'explore',
    icon: () => h(ExploreIcon)
  },
  {
    label: '置顶',
    key: 'top-posts',
    icon: () => h('span', '📌')
  },
  {
    label: '个人中心',
    key: 'profile',
    icon: () => h(ProfileIcon)
  },
  {
    label: '消息',
    key: 'messages',
    icon: () => h(MessagesIcon)
  }
]

// 用户菜单选项
const userMenuOptions = computed(() => {
  const options: any[] = [
    {
      label: '个人资料',
      key: 'profile',
      icon: () => h(ProfileIcon)
    },
    {
      label: '设置',
      key: 'settings',
      icon: () => h(SettingsIcon)
    }
  ]

  // 如果是管理员，添加管理员入口
  if (userStore.currentUser?.role === 'admin') {
    options.push({
      type: 'divider',
      key: 'd1'
    })
    options.push({
      label: '管理员控制台',
      key: 'admin',
      icon: () => h('span', '🛡️')
    })
  }

  options.push({
    type: 'divider',
    key: 'd2'
  })
  options.push({
    label: '退出登录',
    key: 'logout',
    icon: () => h(LogoutIcon)
  })

  return options
})



// 显示登录/注册弹窗
const showAuthModal = (mode: 'login' | 'register') => {
  authMode.value = mode
  showAuth.value = true
}

// 处理搜索
const handleSearch = () => {
  if (searchValue.value.trim()) {
    router.push({
      path: '/explore',
      query: { q: searchValue.value }
    })
  }
}

// 处理高级搜索
const handleAdvancedSearch = (searchData: any) => {
  Logger.info('高级搜索', { searchData }, userStore.currentUser?.id, userStore.currentUser?.username)
}

// 处理登录/注册成功
const handleAuthSuccess = (user: any) => {
  Logger.info(LogActions.USER_LOGIN, { userId: user.id, username: user.username }, user.id, user.username)
  // 如果是管理员，跳转到管理员后台
  if (user.role === 'admin') {
    setTimeout(() => {
      router.push('/admin')
    }, 500)
  }
}

const handleMenuSelect = (key: string) => {
  // 检查是否需要登录
  if (!userStore.isLoggedIn && ['profile', 'messages'].includes(key)) {
    showAuthModal('login')
    return
  }
  
  const routeMap: Record<string, string> = {
    'home': '/',
    'explore': '/explore',
    'top-posts': '/top-posts',
    'profile': `/profile/${userStore.currentUser?.id}`,
    'messages': '/messages'
  }
  router.push(routeMap[key] || '/')
}

const handleUserMenuSelect = (key: string) => {
  switch (key) {
    case 'profile':
      router.push(`/profile/${userStore.currentUser?.id}`)
      break
    case 'settings':
      router.push('/settings')
      break
    case 'admin':
      router.push('/admin')
      break
    case 'logout':
      userStore.logout()
      alert('已退出登录')
      break
  }
}


</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  background: var(--zzz-gradient-bg);
}

.header {
  height: var(--zzz-header-height);
  background: var(--zzz-bg-overlay);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--zzz-border-primary);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.logo-section {
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  background: var(--zzz-gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-section {
  flex: 1;
  max-width: 400px;
  margin: 0 40px;
}

.search-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
}

.user-section {
  flex-shrink: 0;
}

.campus-3d-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
  50% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
}

.create-btn {
  background: linear-gradient(45deg, #FF6B35, #FF9800);
  border: none;
  font-weight: 600;
}

.user-avatar {
  cursor: pointer;
  border: 2px solid rgba(255, 107, 53, 0.3);
  transition: border-color 0.3s ease;
}

.user-avatar:hover {
  border-color: #FF6B35;
}

.main-layout {
  min-height: calc(100vh - 64px);
}

.sidebar {
  background: rgba(24, 24, 28, 0.8);
  border-right: 1px solid rgba(255, 107, 53, 0.2);
}

.nav-menu {
  padding: 16px 0;
}

.content-area {
  background: transparent;
  padding: 24px;
  overflow-y: auto;
}


</style>

