import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/utils/database'

describe('Database Utility', () => {
  beforeEach(() => {
    // 清理测试数据
    localStorage.clear()
  })

  describe('User Management', () => {
    it('should create a new user', () => {
      const user = db.createUser({
        username: 'testuser',
        password: 'password123',
        nickname: '测试用户',
        email: 'test@example.com'
      })

      expect(user).toBeDefined()
      expect(user.username).toBe('testuser')
      expect(user.nickname).toBe('测试用户')
      expect(user.email).toBe('test@example.com')
    })

    it('should get user by id', () => {
      const user = db.createUser({
        username: 'testuser',
        password: 'password123',
        nickname: '测试用户',
        email: 'test@example.com'
      })

      const foundUser = db.getUserById(user.id)
      expect(foundUser).toBeDefined()
      expect(foundUser?.id).toBe(user.id)
    })

    it('should get user by username', () => {
      db.createUser({
        username: 'testuser',
        password: 'password123',
        nickname: '测试用户',
        email: 'test@example.com'
      })

      const foundUser = db.getUserByUsername('testuser')
      expect(foundUser).toBeDefined()
      expect(foundUser?.username).toBe('testuser')
    })
  })

  describe('Post Management', () => {
    it('should create a new post', () => {
      const user = db.createUser({
        username: 'testuser',
        password: 'password123',
        nickname: '测试用户',
        email: 'test@example.com'
      })

      const post = db.createPost({
        title: '测试帖子',
        content: '这是一个测试帖子',
        topic: '测试',
        authorId: user.id,
        authorName: user.nickname,
        authorAvatar: user.avatar,
        images: [],
        tags: []
      })

      expect(post).toBeDefined()
      expect(post.title).toBe('测试帖子')
      expect(post.authorId).toBe(user.id)
    })

    it('should get all posts', () => {
      const user = db.createUser({
        username: 'testuser',
        password: 'password123',
        nickname: '测试用户',
        email: 'test@example.com'
      })

      db.createPost({
        title: '测试帖子1',
        content: '内容1',
        topic: '测试',
        authorId: user.id,
        authorName: user.nickname,
        authorAvatar: user.avatar,
        images: [],
        tags: []
      })

      db.createPost({
        title: '测试帖子2',
        content: '内容2',
        topic: '测试',
        authorId: user.id,
        authorName: user.nickname,
        authorAvatar: user.avatar,
        images: [],
        tags: []
      })

      const posts = db.getPosts()
      expect(posts.length).toBeGreaterThanOrEqual(2)
    })
  })
})
