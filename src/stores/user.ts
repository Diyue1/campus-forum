import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, type User } from '@/utils/database'
import { Logger, LogActions } from '@/utils/logger'
import { RateLimit, RateLimitConfig } from '@/utils/rateLimit'
import { messageService } from '@/utils/message'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)

  // 初始化时检查是否有已登录用户
  const initUser = () => {
    const user = db.getCurrentUser()
    if (user) {
      currentUser.value = user
      Logger.info(LogActions.USER_LOGIN, { userId: user.id, username: user.username })
    }
  }

  const isLoggedIn = computed(() => currentUser.value !== null)

  const setUser = (user: User | null) => {
    currentUser.value = user
    if (user) {
      db.setCurrentUser(user)
    } else {
      db.setCurrentUser(null)
    }
  }

  const login = (username: string, password: string): { success: boolean; user?: User; message: string } => {
    // 频率限制检查
    if (!RateLimit.check(`login_${username}`, RateLimitConfig.LOGIN.maxRequests, RateLimitConfig.LOGIN.windowMs)) {
      Logger.warning(LogActions.SECURITY_RATE_LIMIT, { action: 'login', username })
      return {
        success: false,
        message: '登录请求过于频繁，请稍后再试'
      }
    }

    const user = db.login(username, password)
    if (user) {
      currentUser.value = user
      Logger.success(LogActions.USER_LOGIN, { userId: user.id, username: user.username })
      return {
        success: true,
        user,
        message: '登录成功'
      }
    } else {
      Logger.warning(LogActions.SECURITY_LOGIN_FAIL, { username })
      return {
        success: false,
        message: '用户名或密码错误'
      }
    }
  }

  const register = (userData: {
    username: string
    nickname: string
    email: string
    password: string
  }): { success: boolean; user?: User; message: string } => {
    // 频率限制检查
    if (!RateLimit.check(`register_${userData.username}`, RateLimitConfig.REGISTER.maxRequests, RateLimitConfig.REGISTER.windowMs)) {
      Logger.warning(LogActions.SECURITY_RATE_LIMIT, { action: 'register', username: userData.username })
      return {
        success: false,
        message: '注册请求过于频繁，请稍后再试'
      }
    }

    const user = db.register(userData)
    if (user) {
      currentUser.value = user
      Logger.success(LogActions.USER_REGISTER, { userId: user.id, username: user.username })
      return {
        success: true,
        user,
        message: '注册成功'
      }
    } else {
      return {
        success: false,
        message: '用户名已存在'
      }
    }
  }

  const logout = () => {
    if (currentUser.value) {
      Logger.info(LogActions.USER_LOGOUT, { userId: currentUser.value.id, username: currentUser.value.username })
    }
    db.logout()
    currentUser.value = null
  }

  const updateUser = (updates: Partial<User>) => {
    if (currentUser.value) {
      const updatedUser = db.updateUser(currentUser.value.id, updates)
      if (updatedUser) {
        currentUser.value = updatedUser
        Logger.info(LogActions.USER_UPDATE, { userId: updatedUser.id, updates })
      }
    }
  }

  const refreshUser = () => {
    if (currentUser.value) {
      const freshUser = db.getUserById(currentUser.value.id)
      if (freshUser) {
        currentUser.value = freshUser
      }
    }
  }

  // 初始化
  initUser()

  return {
    currentUser,
    isLoggedIn,
    setUser,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    initUser
  }
})


