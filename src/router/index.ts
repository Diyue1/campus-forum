import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import { useUserStore } from '@/stores/user'
import { Logger } from '@/utils/logger'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 3D 校园场景（独立路由，不使用 Layout）
    {
      path: '/campus-3d',
      name: 'Campus3D',
      component: () => import('@/views/Campus3D.vue')
    },
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/views/UserHome.vue')
        },
        {
          path: '/explore',
          name: 'Explore',
          component: () => import('@/views/Explore.vue').catch((error) => {
            Logger.error('路由加载失败', { 
              route: 'Explore',
              error: error instanceof Error ? error.message : String(error)
            })
            return import('@/views/ErrorPage.vue')
          })
        },
        {
          path: '/post/:id',
          name: 'PostDetail',
          component: () => import('@/views/PostDetail.vue').catch(() => import('@/views/ErrorPage.vue'))
        },
        {
          path: '/create',
          name: 'CreatePost',
          component: () => import('@/views/CreatePost.vue').catch(() => import('@/views/ErrorPage.vue'))
        },
        {
          path: '/profile/:id?',
          name: 'Profile',
          component: () => import('@/views/Profile.vue').catch(() => import('@/views/ErrorPage.vue'))
        },
        {
          path: '/settings',
          name: 'Settings',
          component: () => import('@/views/Settings.vue').catch(() => import('@/views/ErrorPage.vue'))
        },
        {
          path: '/messages',
          name: 'Messages',
          component: () => import('@/views/Messages.vue')
        },
        {
          path: '/top-posts',
          name: 'TopPosts',
          component: () => import('@/views/TopPosts.vue')
        },
        {
          path: '/admin-old',
          name: 'AdminDashboardOld',
          component: () => import('@/views/AdminDashboard.vue'),
          meta: { requiresAdmin: true }
        }
      ]
    },
    // 管理员专用路由
    {
      path: '/admin',
      component: () => import('@/views/AdminLayout.vue'),
      meta: { requiresAdmin: true },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard'
        },
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/Dashboard.vue')
        },
        {
          path: 'users',
          name: 'AdminUsers',
          component: () => import('@/views/admin/Users.vue')
        },
        {
          path: 'posts',
          name: 'AdminPosts',
          component: () => import('@/views/admin/Posts.vue')
        },
        {
          path: 'comments',
          name: 'AdminComments',
          component: () => import('@/views/admin/Comments.vue')
        },
        {
          path: 'approval',
          name: 'AdminApproval',
          component: () => import('@/views/admin/Approval.vue')
        },
        {
          path: 'topics',
          name: 'AdminTopics',
          component: () => import('@/views/admin/Topics.vue')
        },
        {
          path: 'reports',
          name: 'AdminReports',
          component: () => import('@/views/admin/Reports.vue')
        },
        {
          path: 'settings',
          name: 'AdminSettings',
          component: () => import('@/views/admin/Settings.vue')
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin) {
    if (!userStore.currentUser) {
      next('/')
      return
    }
    if (userStore.currentUser.role !== 'admin') {
      next('/')
      return
    }
  }

  next()
})

export default router


