import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../../../src/stores/user'
import { db } from '../../../src/utils/database'
import { RateLimit } from '../../../src/utils/rateLimit'

// 模拟数据库模块
vi.mock('../../../src/utils/database', () => ({
  db: {
    getCurrentUser: vi.fn(),
    setCurrentUser: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    updateUser: vi.fn(),
    getUserById: vi.fn(),
    logout: vi.fn()
  }
}))

// 模拟 RateLimit
vi.mock('../../../src/utils/rateLimit', () => ({
  RateLimit: {
    check: vi.fn().mockReturnValue(true),
    reset: vi.fn()
  },
  RateLimitConfig: {
    LOGIN: {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000
    },
    REGISTER: {
      maxRequests: 3,
      windowMs: 60 * 60 * 1000
    }
  }
}))

// 模拟 messageService
vi.mock('../../../src/utils/message', () => ({
  messageService: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}))

// 模拟 Logger
vi.mock('../../../src/utils/logger', () => ({
  Logger: {
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn()
  },
  LogActions: {
    USER_LOGIN: 'USER_LOGIN',
    USER_LOGOUT: 'USER_LOGOUT',
    USER_REGISTER: 'USER_REGISTER',
    USER_UPDATE: 'USER_UPDATE',
    SECURITY_RATE_LIMIT: 'SECURITY_RATE_LIMIT',
    SECURITY_LOGIN_FAIL: 'SECURITY_LOGIN_FAIL',
    SYSTEM_ERROR: 'SYSTEM_ERROR'
  }
}))

describe('User Store', () => {
  let store: ReturnType<typeof useUserStore>
  
  const mockUser = {
    id: 1,
    username: 'testuser',
    nickname: '测试用户',
    avatar: 'avatar.jpg',
    email: 'test@example.com',
    bio: '这是测试用户',
    role: 'user' as const,
    status: 'active' as const,
    posts: 0,
    followers: 0,
    following: 0,
    likes: 0,
    level: 1,
    exp: 0,
    joinDate: new Date().toISOString(),
    password: 'hashedpassword'
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // 重置模拟实现
    vi.mocked(db.getCurrentUser).mockReturnValue(null)
    vi.mocked(db.login).mockReturnValue(mockUser)
    vi.mocked(db.register).mockReturnValue(mockUser)
    vi.mocked(db.updateUser).mockImplementation((id, updates) => ({ ...mockUser, ...updates }))
    vi.mocked(db.getUserById).mockReturnValue(mockUser)
    vi.mocked(RateLimit.check).mockReturnValue(true)
    
    store = useUserStore()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with null user when no user is logged in', () => {
    vi.mocked(db.getCurrentUser).mockReturnValue(null)
    store.initUser()
    expect(store.currentUser).toBeNull()
    expect(store.isLoggedIn).toBe(false)
  })

  it('should initialize with user when user is logged in', () => {
    vi.mocked(db.getCurrentUser).mockReturnValue(mockUser)
    store.initUser()
    expect(store.currentUser).toEqual(mockUser)
    expect(store.isLoggedIn).toBe(true)
  })

  it('should set current user', () => {
    store.setUser(mockUser)
    expect(store.currentUser).toEqual(mockUser)
    expect(store.isLoggedIn).toBe(true)
    expect(db.setCurrentUser).toHaveBeenCalledWith(mockUser)
  })

  it('should clear current user when setting to null', () => {
    store.setUser(mockUser)
    store.setUser(null)
    expect(store.currentUser).toBeNull()
    expect(store.isLoggedIn).toBe(false)
    expect(db.setCurrentUser).toHaveBeenCalledWith(null)
  })

  describe('login', () => {
    it('should login successfully with valid credentials', () => {
      const result = store.login('testuser', 'password123')
      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(store.currentUser).toEqual(mockUser)
      expect(db.login).toHaveBeenCalledWith('testuser', 'password123')
    })

    it('should fail login with rate limit exceeded', () => {
      vi.mocked(RateLimit.check).mockReturnValueOnce(false)
      
      const result = store.login('testuser', 'wrongpassword')
      
      expect(result.success).toBe(false)
      expect(result.message).toContain('登录请求过于频繁')
      expect(db.login).not.toHaveBeenCalled()
    })

    it('should fail login with invalid credentials', () => {
      vi.mocked(db.login).mockReturnValueOnce(null)
      
      const result = store.login('wronguser', 'wrongpassword')
      
      expect(result.success).toBe(false)
      expect(result.message).toContain('用户名或密码错误')
    })
  })

  describe('register', () => {
    const newUser = {
      username: 'newuser',
      nickname: '新用户',
      email: 'new@example.com',
      password: 'password123'
    }

    it('should register a new user', () => {
      vi.mocked(db.register).mockReturnValueOnce({ ...mockUser, username: 'newuser' })
      
      const result = store.register(newUser)
      
      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(db.register).toHaveBeenCalledWith(newUser)
    })
  })

  describe('logout', () => {
    it('should logout user', () => {
      store.setUser(mockUser)
      store.logout()
      
      expect(store.currentUser).toBeNull()
      expect(db.logout).toHaveBeenCalled()
    })
  })

  describe('updateUser', () => {
    it('should update user data', () => {
      store.setUser(mockUser)
      const updates = { nickname: '更新后的昵称', bio: '新的个人简介' }
      
      store.updateUser(updates)
      
      expect(db.updateUser).toHaveBeenCalledWith(mockUser.id, updates)
      expect(store.currentUser).toEqual({
        ...mockUser,
        ...updates
      })
    })
  })

  describe('refreshUser', () => {
    it('should refresh user data', () => {
      store.setUser(mockUser)
      const updatedUser = { ...mockUser, nickname: '更新后的昵称' }
      vi.mocked(db.getUserById).mockReturnValueOnce(updatedUser)
      
      store.refreshUser()
      
      expect(db.getUserById).toHaveBeenCalledWith(mockUser.id)
      expect(store.currentUser).toEqual(updatedUser)
    })

    it('should handle error when refreshing user data', () => {
      store.setUser(mockUser)
      vi.mocked(db.getUserById).mockReturnValueOnce(null)
      
      store.refreshUser()
      
      expect(db.getUserById).toHaveBeenCalledWith(mockUser.id)
      // refreshUser 不会清空 currentUser，只是不更新
      expect(store.currentUser).toEqual(mockUser)
    })
  })
})
