import { PlaceholderImages } from './imageGenerator'
import bcrypt from 'bcryptjs'

// 本地存储管理系统 - 模拟数据库功能

export interface User {
  id: number
  username: string
  nickname: string
  email: string
  password: string
  avatar: string
  level: number
  exp: number
  followers: number
  following: number
  posts: number
  bio?: string
  badges?: string[]
  joinDate: string
  isVerified?: boolean
  followingList?: number[]
  followersList?: number[]
  role?: 'user' | 'admin' // 新增角色字段
  status?: 'active' | 'banned' | 'suspended' // 新增状态字段
  lastLoginAt?: string // 最后登录时间
  coins?: number // 金币数量
  blacklist?: number[] // 黑名单用户ID列表
  viewHistory?: number[] // 浏览历史帖子ID列表
  lastCheckIn?: string // 最后签到时间
  checkInDays?: number // 连续签到天数
  totalCheckIns?: number // 总签到次数
}

export interface Post {
  id: number
  title: string
  content: string
  authorId: number
  topic: string
  images?: Array<{
    id: number
    url: string
    width: number
    height: number
  }>
  likes: number
  comments: number
  shares: number
  views: number
  createdAt: string
  updatedAt: string
  isHot?: boolean
  isTop?: boolean
  tags?: string[]
  likedBy?: number[]
  collectedBy?: number[]
  status?: 'pending' | 'approved' | 'rejected' // 审核状态
  rejectionReason?: string // 拒绝原因
  reports?: Report[] // 举报记录
  rewards?: number // 打赏金币数
  rewardedBy?: number[] // 打赏用户ID列表
  poll?: Poll // 投票信息
}

// 举报接口
export interface Report {
  id: number
  postId: number
  reporterId: number
  reason: string
  type: 'spam' | 'inappropriate' | 'harassment' | 'other'
  createdAt: string
  status: 'pending' | 'resolved' | 'rejected'
}

// 投票接口
export interface Poll {
  question: string
  options: PollOption[]
  endTime?: string
  allowMultiple?: boolean
}

export interface PollOption {
  id: number
  text: string
  votes: number
  voters: number[]
}

// 草稿接口
export interface Draft {
  id: number
  userId: number
  title: string
  content: string
  topic: string
  images?: Array<{
    id: number
    url: string
    width: number
    height: number
  }>
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: number
  postId: number
  authorId: number
  content: string
  likes: number
  createdAt: string
  parentId?: number
  replies?: Comment[]
}

export interface Message {
  id: number
  senderId: number
  receiverId: number
  content: string
  type: 'text' | 'image' | 'file'
  isRead: boolean
  createdAt: string
  updatedAt: string
  replyTo?: number // 回复的消息ID
  attachments?: Array<{
    id: number
    url: string
    name: string
    size: number
    type: string
  }>
}

export interface Conversation {
  id: number
  participants: number[] // 参与者ID列表
  lastMessage?: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: number
  userId: number
  type: 'like' | 'comment' | 'follow' | 'system'
  fromUserId?: number
  postId?: number
  content: string
  read: boolean
  createdAt: string
}

class LocalDatabase {
  private readonly STORAGE_KEYS = {
    USERS: 'campus_forum_users',
    POSTS: 'campus_forum_posts',
    COMMENTS: 'campus_forum_comments',
    NOTIFICATIONS: 'campus_forum_notifications',
    MESSAGES: 'campus_forum_messages',
    CONVERSATIONS: 'campus_forum_conversations',
    CURRENT_USER: 'campus_forum_current_user',
    POST_ID_COUNTER: 'campus_forum_post_counter',
    USER_ID_COUNTER: 'campus_forum_user_counter',
    MESSAGE_COUNTER: 'campus_forum_message_counter',
    CONVERSATION_COUNTER: 'campus_forum_conversation_counter',
    DRAFTS: 'campus_forum_drafts',
    REPORTS: 'campus_forum_reports',
    SEARCH_HISTORY: 'campus_forum_search_history',
    HOT_SEARCHES: 'campus_forum_hot_searches'
  }

  // 用户管理
  getUsers(): User[] {
    const users = localStorage.getItem(this.STORAGE_KEYS.USERS)
    return users ? JSON.parse(users) : []
  }

  saveUsers(users: User[]): void {
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users))
  }

  getUserById(id: number): User | null {
    const users = this.getUsers()
    return users.find(user => user.id === id) || null
  }

  getUserByUsername(username: string): User | null {
    const users = this.getUsers()
    return users.find(user => user.username === username) || null
  }

  createUser(userData: Omit<User, 'id' | 'joinDate' | 'level' | 'exp' | 'followers' | 'following' | 'posts'>): User {
    const users = this.getUsers()
    const counter = this.getCounter('USER_ID_COUNTER')

    const newUser: User = {
      ...userData,
      id: counter,
      level: 1,
      exp: 0,
      followers: 0,
      following: 0,
      posts: 0,
      joinDate: new Date().toISOString(),
      followingList: [],
      followersList: [],
      role: 'user',
      status: 'active',
      lastLoginAt: new Date().toISOString()
    }

    users.push(newUser)
    this.saveUsers(users)
    this.incrementCounter('USER_ID_COUNTER')

    return newUser
  }

  updateUser(id: number, updates: Partial<User>): User | null {
    const users = this.getUsers()
    const userIndex = users.findIndex(user => user.id === id)
    
    if (userIndex === -1) return null
    
    users[userIndex] = { ...users[userIndex], ...updates }
    this.saveUsers(users)
    
    return users[userIndex]
  }

  deleteUser(userId: number): boolean {
    const users = this.getUsers()
    const index = users.findIndex(u => u.id === userId)

    if (index === -1) return false

    users.splice(index, 1)
    this.saveUsers(users)

    return true
  }

  // 帖子管理
  getPosts(): Post[] {
    const posts = localStorage.getItem(this.STORAGE_KEYS.POSTS)
    return posts ? JSON.parse(posts) : []
  }

  savePosts(posts: Post[]): void {
    localStorage.setItem(this.STORAGE_KEYS.POSTS, JSON.stringify(posts))
  }

  getPostById(id: number): Post | null {
    const posts = this.getPosts()
    return posts.find(post => post.id === id) || null
  }

  createPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments' | 'shares' | 'views'>): Post {
    const posts = this.getPosts()
    const counter = this.getCounter('POST_ID_COUNTER')
    
    const newPost: Post = {
      ...postData,
      id: counter,
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likedBy: [],
      collectedBy: []
    }

    posts.unshift(newPost)
    this.savePosts(posts)
    this.incrementCounter('POST_ID_COUNTER')
    
    // 更新用户帖子数量
    this.incrementUserPosts(postData.authorId)
    
    return newPost
  }

  updatePost(id: number, updates: Partial<Post>): Post | null {
    const posts = this.getPosts()
    const postIndex = posts.findIndex(post => post.id === id)
    
    if (postIndex === -1) return null
    
    posts[postIndex] = { 
      ...posts[postIndex], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    }
    this.savePosts(posts)
    
    return posts[postIndex]
  }

  deletePost(id: number): boolean {
    const posts = this.getPosts()
    const postIndex = posts.findIndex(post => post.id === id)
    
    if (postIndex === -1) return false
    
    const post = posts[postIndex]
    posts.splice(postIndex, 1)
    this.savePosts(posts)
    
    // 更新用户帖子数量
    this.decrementUserPosts(post.authorId)
    
    return true
  }

  // 点赞帖子
  likePost(postId: number, userId: number): boolean {
    const posts = this.getPosts()
    const post = posts.find(p => p.id === postId)

    if (!post) return false

    if (!post.likedBy) post.likedBy = []

    const index = post.likedBy.indexOf(userId)
    if (index > -1) {
      // 取消点赞
      post.likedBy.splice(index, 1)
      post.likes = Math.max(0, post.likes - 1)
    } else {
      // 点赞
      post.likedBy.push(userId)
      post.likes++
    }

    this.savePosts(posts)
    return true
  }

  // 收藏帖子
  collectPost(postId: number, userId: number): boolean {
    const posts = this.getPosts()
    const post = posts.find(p => p.id === postId)

    if (!post) return false

    if (!post.collectedBy) post.collectedBy = []

    const index = post.collectedBy.indexOf(userId)
    if (index > -1) {
      // 取消收藏
      post.collectedBy.splice(index, 1)
    } else {
      // 收藏
      post.collectedBy.push(userId)
    }

    this.savePosts(posts)
    return true
  }

  // 检查是否点赞
  isPostLiked(postId: number, userId: number): boolean {
    const post = this.getPostById(postId)
    return post?.likedBy?.includes(userId) || false
  }

  // 检查是否收藏
  isPostCollected(postId: number, userId: number): boolean {
    const post = this.getPostById(postId)
    return post?.collectedBy?.includes(userId) || false
  }

  // 搜索功能
  searchPosts(query: string, filters?: {
    topic?: string
    authorId?: number
    hasImages?: boolean
    isHot?: boolean
    sortBy?: 'latest' | 'likes' | 'comments' | 'views'
  }): Post[] {
    // 只获取已审核通过的帖子
    let posts = this.getPosts().filter(p => p.status === 'approved' || !p.status)

    // 文本搜索
    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.topic.toLowerCase().includes(searchTerm) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }
    
    // 应用筛选
    if (filters) {
      if (filters.topic) {
        posts = posts.filter(post => post.topic === filters.topic)
      }
      
      if (filters.authorId) {
        posts = posts.filter(post => post.authorId === filters.authorId)
      }
      
      if (filters.hasImages) {
        posts = posts.filter(post => post.images && post.images.length > 0)
      }
      
      if (filters.isHot) {
        posts = posts.filter(post => post.isHot)
      }
      
      // 排序
      switch (filters.sortBy) {
        case 'likes':
          posts.sort((a, b) => b.likes - a.likes)
          break
        case 'comments':
          posts.sort((a, b) => b.comments - a.comments)
          break
        case 'views':
          posts.sort((a, b) => b.views - a.views)
          break
        default:
          posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }
    }
    
    return posts
  }


  // 评论管理
  getComments(): Comment[] {
    const comments = localStorage.getItem(this.STORAGE_KEYS.COMMENTS)
    return comments ? JSON.parse(comments) : []
  }

  saveComments(comments: Comment[]): void {
    localStorage.setItem(this.STORAGE_KEYS.COMMENTS, JSON.stringify(comments))
  }

  getCommentsByPostId(postId: number): Comment[] {
    const comments = this.getComments()
    return comments.filter(c => c.postId === postId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  createComment(commentData: Omit<Comment, 'id' | 'createdAt' | 'likes'>): Comment {
    const comments = this.getComments()

    const newComment: Comment = {
      ...commentData,
      id: comments.length + 1,
      likes: 0,
      createdAt: new Date().toISOString()
    }

    comments.push(newComment)
    this.saveComments(comments)

    // 更新帖子评论数
    const post = this.getPostById(commentData.postId)
    if (post) {
      this.updatePost(commentData.postId, { comments: post.comments + 1 })
    }

    // 创建评论通知
    if (post && post.authorId !== commentData.authorId) {
      this.createNotification({
        userId: post.authorId,
        type: 'comment',
        fromUserId: commentData.authorId,
        postId: commentData.postId,
        content: '评论了你的帖子',
        read: false,
        createdAt: new Date().toISOString()
      })
    }

    return newComment
  }

  updateComment(commentId: number, updates: Partial<Comment>): Comment | null {
    const comments = this.getComments()
    const index = comments.findIndex(c => c.id === commentId)

    if (index === -1) return null

    comments[index] = { ...comments[index], ...updates }
    this.saveComments(comments)

    return comments[index]
  }

  deleteComment(commentId: number): boolean {
    const comments = this.getComments()
    const index = comments.findIndex(c => c.id === commentId)

    if (index === -1) return false

    const comment = comments[index]
    comments.splice(index, 1)
    this.saveComments(comments)

    // 更新帖子评论数
    const post = this.getPostById(comment.postId)
    if (post) {
      this.updatePost(comment.postId, { comments: Math.max(0, post.comments - 1) })
    }

    return true
  }

  // 通知管理
  getNotifications(userId: number): Notification[] {
    const notifications = localStorage.getItem(this.STORAGE_KEYS.NOTIFICATIONS)
    if (!notifications) return []

    const allNotifications: Notification[] = JSON.parse(notifications)
    return allNotifications.filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  createNotification(notification: Omit<Notification, 'id'>): Notification {
    const notifications = localStorage.getItem(this.STORAGE_KEYS.NOTIFICATIONS)
    const allNotifications: Notification[] = notifications ? JSON.parse(notifications) : []

    const newNotification: Notification = {
      ...notification,
      id: allNotifications.length + 1
    }

    allNotifications.push(newNotification)
    localStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(allNotifications))

    return newNotification
  }

  markNotificationAsRead(notificationId: number): void {
    const notifications = localStorage.getItem(this.STORAGE_KEYS.NOTIFICATIONS)
    if (!notifications) return

    const allNotifications: Notification[] = JSON.parse(notifications)
    const notification = allNotifications.find(n => n.id === notificationId)

    if (notification) {
      notification.read = true
      localStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(allNotifications))
    }
  }

  deleteNotification(notificationId: number): boolean {
    const notifications = localStorage.getItem(this.STORAGE_KEYS.NOTIFICATIONS)
    if (!notifications) return false

    const allNotifications: Notification[] = JSON.parse(notifications)
    const index = allNotifications.findIndex(n => n.id === notificationId)

    if (index === -1) return false

    allNotifications.splice(index, 1)
    localStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(allNotifications))

    return true
  }

  // 当前用户管理
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER)
    if (!userStr) return null
    
    const userData = JSON.parse(userStr)
    return this.getUserById(userData.id)
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify({ id: user.id }))
    } else {
      localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER)
    }
  }

  // 密码加密（使用 bcrypt）
  private hashPasswordSync(password: string): string {
    const salt = bcrypt.genSaltSync(10)
    return bcrypt.hashSync(password, salt)
  }

  // 验证密码
  private verifyPasswordSync(password: string, hash: string): boolean {
    try {
      return bcrypt.compareSync(password, hash)
    } catch (error) {
      return false
    }
  }

  // 检查是否是旧的 SHA256 密码格式
  private isOldPasswordFormat(hash: string): boolean {
    // bcrypt 哈希总是以 $2a$, $2b$, $2x$, $2y$ 开头
    return !hash.startsWith('$2')
  }

  // 登录验证
  login(username: string, password: string): User | null {
    const user = this.getUserByUsername(username)
    if (!user) return null

    let isPasswordValid = false

    // 检查用户状态
    if (user.status === 'banned') {
      return null // 被封禁的用户无法登录
    }

    // 兼容旧密码格式（明文或 SHA256）
    if (this.isOldPasswordFormat(user.password)) {
      // 旧格式：明文或 SHA256
      isPasswordValid = user.password === password

      // 如果验证成功，迁移到新的 bcrypt 格式
      if (isPasswordValid) {
        const newHash = this.hashPasswordSync(password)
        this.updateUser(user.id, { password: newHash })
        user.password = newHash
      }
    } else {
      // 新格式：bcrypt
      isPasswordValid = this.verifyPasswordSync(password, user.password)
    }

    if (isPasswordValid) {
      // 更新最后登录时间
      const updatedUser = this.updateUser(user.id, {
        lastLoginAt: new Date().toISOString()
      })

      this.setCurrentUser(updatedUser || user)
      return updatedUser || user
    }

    return null
  }

  // 注册
  register(userData: {
    username: string
    nickname: string
    email: string
    password: string
    avatar?: string
  }): User | null {
    // 检查用户名是否已存在
    if (this.getUserByUsername(userData.username)) {
      return null
    }

    // 使用 bcrypt 加密密码
    const hashedPassword = this.hashPasswordSync(userData.password)

    const newUser = this.createUser({
      ...userData,
      password: hashedPassword,
      avatar: userData.avatar || PlaceholderImages.avatar(userData.nickname[0], 80),
    })

    this.setCurrentUser(newUser)
    return newUser
  }

  // 登出
  logout(): void {
    this.setCurrentUser(null)
  }

  // 辅助方法
  private getCounter(key: keyof typeof this.STORAGE_KEYS): number {
    const counter = localStorage.getItem(this.STORAGE_KEYS[key])
    return counter ? parseInt(counter) : 1
  }

  private incrementCounter(key: keyof typeof this.STORAGE_KEYS): void {
    const current = this.getCounter(key)
    localStorage.setItem(this.STORAGE_KEYS[key], String(current + 1))
  }

  private incrementUserPosts(userId: number): void {
    const user = this.getUserById(userId)
    if (user) {
      this.updateUser(userId, { posts: user.posts + 1 })
    }
  }

  private decrementUserPosts(userId: number): void {
    const user = this.getUserById(userId)
    if (user) {
      this.updateUser(userId, { posts: Math.max(0, user.posts - 1) })
    }
  }

  // 初始化默认数据
  initializeDefaultData(): void {
    const users = this.getUsers()
    const posts = this.getPosts()
    
    if (users.length === 0) {
      // ⚠️ 安全警告：以下为默认测试账户，仅用于开发环境
      // 生产环境部署前必须：
      // 1. 修改所有默认密码
      // 2. 删除或禁用测试账户
      // 3. 启用首次登录强制修改密码功能
      // 创建默认用户
      const defaultUsers = [
        {
          username: 'admin',
          nickname: '管理员',
          email: 'admin@campus.edu',
          password: 'admin123', // ⚠️ 默认密码，生产环境必须修改！
          avatar: PlaceholderImages.avatar('管', 80),
          badges: ['管理员', '创始人'],
          role: 'admin' as const,
          status: 'active' as const
        },
        {
          username: 'student001',
          nickname: '校园探索者',
          email: 'student001@campus.edu',
          password: '123456', // ⚠️ 默认密码，生产环境必须修改！
          avatar: PlaceholderImages.avatar('探', 80),
          role: 'user' as const,
          status: 'active' as const
        }
      ]

      defaultUsers.forEach(userData => {
        const user = this.createUser(userData)
        // 设置角色和状态
        this.updateUser(user.id, {
          role: userData.role,
          status: userData.status,
          badges: userData.badges
        })
      })
    }
    
    if (posts.length === 0) {
      // 创建一些默认帖子
      const defaultPosts = [
        {
          title: '欢迎来到校园绳网！',
          content: '这是我们全新的校园论坛，大家可以在这里分享学习经验、校园生活、美食推荐等各种内容。让我们一起打造一个温馨的校园社区！',
          authorId: 1,
          topic: '校园生活',
          tags: ['公告', '欢迎'],
          isTop: true
        },
        {
          title: '期末复习攻略分享',
          content: '马上就要期末考试了，我来分享一下我的复习经验。首先制定详细的复习计划，然后按照计划执行，最后进行模拟考试。这样复习效果会更好！',
          authorId: 2,
          topic: '学习经验',
          tags: ['学习', '考试', '攻略'],
          isHot: true
        },
        {
          title: '校园美食推荐',
          content: '今天发现了一家超好吃的餐厅，就在学校东门附近。他们家的招牌菜是红烧肉，味道真的很棒！推荐大家去试试。',
          authorId: 3,
          topic: '美食推荐',
          tags: ['美食', '推荐', '餐厅']
        },
        {
          title: '校园摄影作品分享',
          content: '今天在校园里拍了一些照片，夕阳西下的校园真的很美。分享给大家看看，希望大家喜欢！',
          authorId: 4,
          topic: '摄影分享',
          tags: ['摄影', '校园', '夕阳']
        },
        {
          title: '社团活动招募',
          content: '我们摄影社团正在招募新成员！无论你是摄影新手还是老手，都欢迎加入我们。我们会定期组织外拍活动，一起记录校园的美好时光。',
          authorId: 1,
          topic: '社团活动',
          tags: ['社团', '招募', '摄影']
        }
      ]
      
      defaultPosts.forEach(postData => this.createPost(postData))
    }
  }

  // 清空所有数据
  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }

  // ==================== 消息相关方法 ====================
  
  // 发送消息
  sendMessage(senderId: number, receiverId: number, content: string, type: 'text' | 'image' | 'file' = 'text', attachments?: Array<{url: string, name: string, size: number, type: string}>): Message {
    const messageId = this.getCounter('MESSAGE_COUNTER')
    const now = new Date().toISOString()
    
    const message: Message = {
      id: messageId,
      senderId,
      receiverId,
      content,
      type,
      isRead: false,
      createdAt: now,
      updatedAt: now,
      attachments: attachments?.map((att, index) => ({
        id: messageId * 100 + index,
        ...att
      }))
    }
    
    const messages = this.getMessages()
    messages.push(message)
    localStorage.setItem(this.STORAGE_KEYS.MESSAGES, JSON.stringify(messages))
    localStorage.setItem(this.STORAGE_KEYS.MESSAGE_COUNTER, (messageId + 1).toString())
    
    // 更新对话
    this.updateConversation(senderId, receiverId, message)
    
    return message
  }
  
  // 获取消息列表
  getMessages(): Message[] {
    const messages = localStorage.getItem(this.STORAGE_KEYS.MESSAGES)
    return messages ? JSON.parse(messages) : []
  }
  
  // 获取两个用户之间的消息
  getMessagesBetweenUsers(userId1: number, userId2: number): Message[] {
    const messages = this.getMessages()
    return messages.filter(msg => 
      (msg.senderId === userId1 && msg.receiverId === userId2) ||
      (msg.senderId === userId2 && msg.receiverId === userId1)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }
  
  // 标记消息为已读
  markMessageAsRead(messageId: number): void {
    const messages = this.getMessages()
    const message = messages.find(msg => msg.id === messageId)
    if (message) {
      message.isRead = true
      message.updatedAt = new Date().toISOString()
      localStorage.setItem(this.STORAGE_KEYS.MESSAGES, JSON.stringify(messages))
    }
  }
  
  // 标记用户的所有消息为已读
  markUserMessagesAsRead(userId: number, otherUserId: number): void {
    const messages = this.getMessages()
    messages.forEach(msg => {
      if (msg.senderId === otherUserId && msg.receiverId === userId && !msg.isRead) {
        msg.isRead = true
        msg.updatedAt = new Date().toISOString()
      }
    })
    localStorage.setItem(this.STORAGE_KEYS.MESSAGES, JSON.stringify(messages))
  }

  deleteMessage(messageId: number): boolean {
    const messages = this.getMessages()
    const index = messages.findIndex(m => m.id === messageId)
    if (index === -1) return false
    messages.splice(index, 1)
    localStorage.setItem(this.STORAGE_KEYS.MESSAGES, JSON.stringify(messages))
    return true
  }

  // ==================== 对话相关方法 ====================
  
  // 获取对话列表
  getConversations(userId: number): Conversation[] {
    const conversations = localStorage.getItem(this.STORAGE_KEYS.CONVERSATIONS)
    const allConversations: Conversation[] = conversations ? JSON.parse(conversations) : []
    
    return allConversations.filter(conv => conv.participants.includes(userId))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }
  
  // 更新或创建对话
  private updateConversation(senderId: number, receiverId: number, message: Message): void {
    const conversations = localStorage.getItem(this.STORAGE_KEYS.CONVERSATIONS)
    const allConversations: Conversation[] = conversations ? JSON.parse(conversations) : []
    
    // 查找现有对话
    let conversation = allConversations.find(conv => 
      conv.participants.includes(senderId) && conv.participants.includes(receiverId)
    )
    
    if (conversation) {
      // 更新现有对话
      conversation.lastMessage = message
      conversation.updatedAt = new Date().toISOString()
      if (message.receiverId === receiverId) {
        conversation.unreadCount++
      }
    } else {
      // 创建新对话
      const conversationId = this.getCounter('CONVERSATION_COUNTER')
      conversation = {
        id: conversationId,
        participants: [senderId, receiverId],
        lastMessage: message,
        unreadCount: message.receiverId === receiverId ? 1 : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      allConversations.push(conversation)
      localStorage.setItem(this.STORAGE_KEYS.CONVERSATION_COUNTER, (conversationId + 1).toString())
    }
    
    localStorage.setItem(this.STORAGE_KEYS.CONVERSATIONS, JSON.stringify(allConversations))
  }
  
  // 获取对话的未读消息数量
  getUnreadCount(userId: number): number {
    const conversations = this.getConversations(userId)
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0)
  }
  
  // 清空对话的未读数量
  clearConversationUnread(conversationId: number): void {
    const conversations = localStorage.getItem(this.STORAGE_KEYS.CONVERSATIONS)
    const allConversations: Conversation[] = conversations ? JSON.parse(conversations) : []
    
    const conversation = allConversations.find(conv => conv.id === conversationId)
    if (conversation) {
      conversation.unreadCount = 0
      localStorage.setItem(this.STORAGE_KEYS.CONVERSATIONS, JSON.stringify(allConversations))
    }
  }

  // ==================== 关注功能 ====================
  
  // 关注用户
  followUser(followerId: number, followingId: number): boolean {
    const users = this.getUsers()
    const follower = users.find(u => u.id === followerId)
    const following = users.find(u => u.id === followingId)
    
    if (!follower || !following) return false
    
    // 检查是否已经关注
    if (follower.followingList?.includes(followingId)) return false
    
    // 添加关注关系
    if (!follower.followingList) follower.followingList = []
    if (!following.followersList) following.followersList = []
    
    follower.followingList.push(followingId)
    following.followersList.push(followerId)
    
    // 更新关注数量
    follower.following++
    following.followers++
    
    this.saveUsers(users)
    
    // 创建关注通知
    this.createNotification({
      userId: followingId,
      type: 'follow',
      title: '新关注者',
      content: `${follower.nickname} 关注了您`,
      read: false,
      createdAt: new Date().toISOString()
    })
    
    return true
  }
  
  // 取消关注
  unfollowUser(followerId: number, followingId: number): boolean {
    const users = this.getUsers()
    const follower = users.find(u => u.id === followerId)
    const following = users.find(u => u.id === followingId)
    
    if (!follower || !following) return false
    
    // 检查是否已经关注
    if (!follower.followingList?.includes(followingId)) return false
    
    // 移除关注关系
    follower.followingList = follower.followingList.filter(id => id !== followingId)
    following.followersList = following.followersList.filter(id => id !== followerId)
    
    // 更新关注数量
    follower.following--
    following.followers--
    
    this.saveUsers(users)
    return true
  }
  
  // 检查是否已关注
  isFollowing(followerId: number, followingId: number): boolean {
    const user = this.getUserById(followerId)
    return user?.followingList?.includes(followingId) || false
  }
  
  // 获取关注列表
  getFollowingList(userId: number): User[] {
    const user = this.getUserById(userId)
    if (!user?.followingList) return []
    
    return user.followingList.map(id => this.getUserById(id)).filter(Boolean) as User[]
  }
  
  // 获取粉丝列表
  getFollowersList(userId: number): User[] {
    const user = this.getUserById(userId)
    if (!user?.followersList) return []
    
    return user.followersList.map(id => this.getUserById(id)).filter(Boolean) as User[]
  }
  
  // 获取互相关注的用户
  getMutualFollows(userId: number): User[] {
    const user = this.getUserById(userId)
    if (!user?.followingList) return []

    return user.followingList.filter(followingId => {
      const followingUser = this.getUserById(followingId)
      return followingUser?.followingList?.includes(userId)
    }).map(id => this.getUserById(id)).filter(Boolean) as User[]
  }

  // 切换点赞
  toggleLike(postId: number, userId: number): boolean {
    const post = this.getPostById(postId)
    if (!post) return false

    if (!post.likedBy) post.likedBy = []

    const index = post.likedBy.indexOf(userId)
    if (index > -1) {
      post.likedBy.splice(index, 1)
      post.likes--
    } else {
      post.likedBy.push(userId)
      post.likes++

      // 创建点赞通知
      this.createNotification({
        userId: post.authorId,
        type: 'like',
        fromUserId: userId,
        postId: postId,
        content: '赞了你的帖子',
        read: false,
        createdAt: new Date().toISOString()
      })
    }

    this.updatePost(postId, post)
    return true
  }

  // 切换收藏
  toggleCollect(postId: number, userId: number): boolean {
    const post = this.getPostById(postId)
    if (!post) return false

    if (!post.collectedBy) post.collectedBy = []

    const index = post.collectedBy.indexOf(userId)
    if (index > -1) {
      post.collectedBy.splice(index, 1)
    } else {
      post.collectedBy.push(userId)
    }

    this.updatePost(postId, post)
    return true
  }

  // 切换关注
  toggleFollow(followerId: number, followingId: number): boolean {
    if (this.isFollowing(followerId, followingId)) {
      return this.unfollowUser(followerId, followingId)
    } else {
      return this.followUser(followerId, followingId)
    }
  }

  // ==================== 草稿箱功能 ====================

  getDrafts(userId: number): Draft[] {
    const drafts = localStorage.getItem(this.STORAGE_KEYS.DRAFTS)
    const allDrafts: Draft[] = drafts ? JSON.parse(drafts) : []
    return allDrafts.filter(d => d.userId === userId)
  }

  saveDraft(draft: Omit<Draft, 'id' | 'createdAt' | 'updatedAt'>): Draft {
    const drafts = localStorage.getItem(this.STORAGE_KEYS.DRAFTS)
    const allDrafts: Draft[] = drafts ? JSON.parse(drafts) : []

    const newDraft: Draft = {
      ...draft,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    allDrafts.push(newDraft)
    localStorage.setItem(this.STORAGE_KEYS.DRAFTS, JSON.stringify(allDrafts))
    return newDraft
  }

  updateDraft(draftId: number, updates: Partial<Draft>): Draft | null {
    const drafts = localStorage.getItem(this.STORAGE_KEYS.DRAFTS)
    const allDrafts: Draft[] = drafts ? JSON.parse(drafts) : []

    const index = allDrafts.findIndex(d => d.id === draftId)
    if (index === -1) return null

    allDrafts[index] = {
      ...allDrafts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    localStorage.setItem(this.STORAGE_KEYS.DRAFTS, JSON.stringify(allDrafts))
    return allDrafts[index]
  }

  deleteDraft(draftId: number): boolean {
    const drafts = localStorage.getItem(this.STORAGE_KEYS.DRAFTS)
    const allDrafts: Draft[] = drafts ? JSON.parse(drafts) : []

    const filtered = allDrafts.filter(d => d.id !== draftId)
    localStorage.setItem(this.STORAGE_KEYS.DRAFTS, JSON.stringify(filtered))
    return true
  }

  // ==================== 举报功能 ====================

  reportPost(report: Omit<Report, 'id' | 'createdAt' | 'status'>): Report {
    const reports = localStorage.getItem(this.STORAGE_KEYS.REPORTS)
    const allReports: Report[] = reports ? JSON.parse(reports) : []

    const newReport: Report = {
      ...report,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    }

    allReports.push(newReport)
    localStorage.setItem(this.STORAGE_KEYS.REPORTS, JSON.stringify(allReports))

    // 更新帖子的举报记录
    const post = this.getPostById(report.postId)
    if (post) {
      if (!post.reports) post.reports = []
      post.reports.push(newReport)
      this.updatePost(report.postId, post)
    }

    return newReport
  }

  getReports(postId?: number): Report[] {
    const reports = localStorage.getItem(this.STORAGE_KEYS.REPORTS)
    const allReports: Report[] = reports ? JSON.parse(reports) : []

    if (postId) {
      return allReports.filter(r => r.postId === postId)
    }
    return allReports
  }

  // ==================== 打赏功能 ====================

  rewardPost(postId: number, userId: number, amount: number): boolean {
    const post = this.getPostById(postId)
    const user = this.getUserById(userId)

    if (!post || !user) return false
    if ((user.coins || 0) < amount) return false

    // 扣除用户金币
    this.updateUser(userId, { coins: (user.coins || 0) - amount })

    // 增加作者金币
    const author = this.getUserById(post.authorId)
    if (author) {
      this.updateUser(post.authorId, { coins: (author.coins || 0) + amount })
    }

    // 更新帖子打赏信息
    if (!post.rewards) post.rewards = 0
    if (!post.rewardedBy) post.rewardedBy = []

    post.rewards += amount
    if (!post.rewardedBy.includes(userId)) {
      post.rewardedBy.push(userId)
    }

    this.updatePost(postId, post)

    // 创建通知
    this.createNotification({
      userId: post.authorId,
      type: 'system',
      fromUserId: userId,
      postId: postId,
      content: `打赏了你 ${amount} 金币`,
      read: false,
      createdAt: new Date().toISOString()
    })

    return true
  }

  // ==================== 黑名单功能 ====================

  addToBlacklist(userId: number, targetUserId: number): boolean {
    const user = this.getUserById(userId)
    if (!user) return false

    if (!user.blacklist) user.blacklist = []
    if (!user.blacklist.includes(targetUserId)) {
      user.blacklist.push(targetUserId)
      this.updateUser(userId, { blacklist: user.blacklist })
    }

    return true
  }

  removeFromBlacklist(userId: number, targetUserId: number): boolean {
    const user = this.getUserById(userId)
    if (!user || !user.blacklist) return false

    user.blacklist = user.blacklist.filter(id => id !== targetUserId)
    this.updateUser(userId, { blacklist: user.blacklist })
    return true
  }

  isBlacklisted(userId: number, targetUserId: number): boolean {
    const user = this.getUserById(userId)
    return user?.blacklist?.includes(targetUserId) || false
  }

  // ==================== 浏览历史功能 ====================

  addToViewHistory(userId: number, postId: number): void {
    const user = this.getUserById(userId)
    if (!user) return

    if (!user.viewHistory) user.viewHistory = []

    // 移除旧记录（如果存在）
    user.viewHistory = user.viewHistory.filter(id => id !== postId)

    // 添加到开头
    user.viewHistory.unshift(postId)

    // 只保留最近100条
    if (user.viewHistory.length > 100) {
      user.viewHistory = user.viewHistory.slice(0, 100)
    }

    this.updateUser(userId, { viewHistory: user.viewHistory })
  }

  getViewHistory(userId: number, limit: number = 20): Post[] {
    const user = this.getUserById(userId)
    if (!user || !user.viewHistory) return []

    const posts: Post[] = []
    for (const postId of user.viewHistory.slice(0, limit)) {
      const post = this.getPostById(postId)
      if (post) posts.push(post)
    }

    return posts
  }

  // ==================== 热门搜索功能 ====================

  addSearchHistory(userId: number, keyword: string): void {
    const key = `${this.STORAGE_KEYS.SEARCH_HISTORY}_${userId}`
    const history = localStorage.getItem(key)
    const searches: string[] = history ? JSON.parse(history) : []

    // 移除旧记录
    const filtered = searches.filter(s => s !== keyword)

    // 添加到开头
    filtered.unshift(keyword)

    // 只保留最近20条
    if (filtered.length > 20) {
      filtered.splice(20)
    }

    localStorage.setItem(key, JSON.stringify(filtered))

    // 更新热门搜索
    this.updateHotSearches(keyword)
  }

  getSearchHistory(userId: number): string[] {
    const key = `${this.STORAGE_KEYS.SEARCH_HISTORY}_${userId}`
    const history = localStorage.getItem(key)
    return history ? JSON.parse(history) : []
  }

  clearSearchHistory(userId: number): void {
    const key = `${this.STORAGE_KEYS.SEARCH_HISTORY}_${userId}`
    localStorage.removeItem(key)
  }

  private updateHotSearches(keyword: string): void {
    const hot = localStorage.getItem(this.STORAGE_KEYS.HOT_SEARCHES)
    const hotSearches: Record<string, number> = hot ? JSON.parse(hot) : {}

    hotSearches[keyword] = (hotSearches[keyword] || 0) + 1

    localStorage.setItem(this.STORAGE_KEYS.HOT_SEARCHES, JSON.stringify(hotSearches))
  }

  getHotSearches(limit: number = 10): Array<{ keyword: string; count: number }> {
    const hot = localStorage.getItem(this.STORAGE_KEYS.HOT_SEARCHES)
    const hotSearches: Record<string, number> = hot ? JSON.parse(hot) : {}

    return Object.entries(hotSearches)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  // ==================== 投票功能 ====================

  vote(postId: number, userId: number, optionId: number): boolean {
    const post = this.getPostById(postId)
    if (!post || !post.poll) return false

    const option = post.poll.options.find(o => o.id === optionId)
    if (!option) return false

    // 检查是否已投票
    const hasVoted = post.poll.options.some(o => o.voters.includes(userId))

    if (hasVoted && !post.poll.allowMultiple) {
      // 如果不允许多选且已投票，先移除旧投票
      post.poll.options.forEach(o => {
        const index = o.voters.indexOf(userId)
        if (index > -1) {
          o.voters.splice(index, 1)
          o.votes--
        }
      })
    }

    // 添加新投票
    if (!option.voters.includes(userId)) {
      option.voters.push(userId)
      option.votes++
    }

    this.updatePost(postId, post)
    return true
  }
}

// 创建全局数据库实例
export const db = new LocalDatabase()

// 初始化默认数据
db.initializeDefaultData()
