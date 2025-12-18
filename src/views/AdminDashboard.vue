<template>
  <div class="admin-dashboard">
    <n-grid
      :cols="24"
      :x-gap="24"
    >
      <!-- 主要内容区 -->
      <n-gi :span="18">
        <n-page-header class="page-header">
          <template #title>
            <n-space align="center">
              <n-icon
                size="28"
                color="#FF6B35"
              >
                <DashboardIcon />
              </n-icon>
              <span>管理员控制台</span>
            </n-space>
          </template>
          <template #extra>
            <n-space>
              <n-tag
                type="success"
                size="large"
              >
                <template #icon>
                  <n-icon><ShieldIcon /></n-icon>
                </template>
                管理员模式
              </n-tag>
              <n-button @click="$router.push('/')">
                <template #icon>
                  <n-icon><HomeIcon /></n-icon>
                </template>
                返回首页
              </n-button>
            </n-space>
          </template>
        </n-page-header>

        <n-tabs
          v-model:value="activeTab"
          type="line"
          animated
          class="admin-tabs"
        >
          <!-- 数据统计 -->
          <n-tab-pane
            name="statistics"
            tab="数据统计"
          >
            <AdminQuickStats @stat-click="handleStatClick" />
          </n-tab-pane>

          <!-- 用户管理 -->
          <n-tab-pane
            name="users"
            tab="用户管理"
          >
            <n-card>
              <n-space
                vertical
                :size="16"
              >
                <n-space justify="space-between">
                  <n-input
                    v-model:value="userSearchQuery"
                    placeholder="搜索用户..."
                    clearable
                    style="width: 300px"
                  >
                    <template #prefix>
                      <n-icon><SearchIcon /></n-icon>
                    </template>
                  </n-input>
                  <n-space>
                    <n-select
                      v-model:value="userStatusFilter"
                      :options="userStatusOptions"
                      placeholder="状态筛选"
                      style="width: 150px"
                      clearable
                    />
                    <n-select
                      v-model:value="userRoleFilter"
                      :options="userRoleOptions"
                      placeholder="角色筛选"
                      style="width: 150px"
                      clearable
                    />
                  </n-space>
                </n-space>

                <n-data-table
                  :columns="userColumns"
                  :data="filteredUsers"
                  :pagination="userPagination"
                  :bordered="false"
                  striped
                />
              </n-space>
            </n-card>
          </n-tab-pane>

          <!-- 帖子管理 -->
          <n-tab-pane
            name="posts"
            tab="帖子管理"
          >
            <n-card>
              <n-space
                vertical
                :size="16"
              >
                <n-space justify="space-between">
                  <n-space>
                    <n-input
                      v-model:value="postSearchQuery"
                      placeholder="搜索帖子..."
                      clearable
                      style="width: 300px"
                    >
                      <template #prefix>
                        <n-icon><SearchIcon /></n-icon>
                      </template>
                    </n-input>
                    <n-select
                      v-model:value="postStatusFilter"
                      :options="postStatusOptions"
                      placeholder="状态筛选"
                      style="width: 150px"
                      clearable
                    />
                    <n-select
                      v-model:value="postTopicFilter"
                      :options="topicOptions"
                      placeholder="话题筛选"
                      style="width: 150px"
                      clearable
                    />
                  </n-space>
                  <n-button
                    type="primary"
                    @click="showEditPostModal = true; editingPost = null"
                  >
                    <template #icon>
                      <n-icon><AddIcon /></n-icon>
                    </template>
                    添加帖子
                  </n-button>
                </n-space>

                <n-data-table
                  :columns="postColumns"
                  :data="filteredPosts"
                  :pagination="postPagination"
                  :bordered="false"
                  striped
                />
              </n-space>
            </n-card>
          </n-tab-pane>

          <!-- 内容审核 -->
          <n-tab-pane
            name="review"
            tab="内容审核"
          >
            <n-card>
              <n-space
                vertical
                :size="16"
              >
                <n-alert
                  type="warning"
                  title="待审核内容"
                >
                  当前有 {{ pendingReviewPosts.length }} 条帖子等待审核
                </n-alert>

                <div
                  v-for="post in pendingReviewPosts"
                  :key="post.id"
                  class="review-item"
                >
                  <n-card>
                    <n-space vertical>
                      <n-space
                        justify="space-between"
                        align="center"
                      >
                        <n-space>
                          <n-avatar
                            :src="getPostAuthor(post.authorId)?.avatar"
                            size="small"
                          />
                          <span>{{ getPostAuthor(post.authorId)?.nickname }}</span>
                          <n-tag size="small">
                            {{ post.topic }}
                          </n-tag>
                        </n-space>
                        <n-text depth="3">
                          {{ formatDate(post.createdAt) }}
                        </n-text>
                      </n-space>

                      <n-h3>{{ post.title }}</n-h3>
                      <n-text>{{ post.content }}</n-text>

                      <n-space v-if="post.images && post.images.length > 0">
                        <n-image
                          v-for="img in post.images"
                          :key="img.id"
                          :src="img.url"
                          width="100"
                          height="100"
                          object-fit="cover"
                        />
                      </n-space>

                      <n-space justify="end">
                        <n-button
                          type="success"
                          @click="approvePost(post.id)"
                        >
                          <template #icon>
                            <n-icon><CheckmarkIcon /></n-icon>
                          </template>
                          通过
                        </n-button>
                        <n-button
                          type="error"
                          @click="showRejectModal(post.id)"
                        >
                          <template #icon>
                            <n-icon><CloseIcon /></n-icon>
                          </template>
                          拒绝
                        </n-button>
                      </n-space>
                    </n-space>
                  </n-card>
                </div>

                <n-empty
                  v-if="pendingReviewPosts.length === 0"
                  description="暂无待审核内容"
                />
              </n-space>
            </n-card>
          </n-tab-pane>

          <!-- 系统设置 -->
          <n-tab-pane
            name="settings"
            tab="系统设置"
          >
            <n-card title="系统配置">
              <n-form
                :model="systemSettings"
                label-placement="left"
                label-width="120"
              >
                <n-form-item label="站点名称">
                  <n-input v-model:value="systemSettings.siteName" />
                </n-form-item>
                <n-form-item label="允许注册">
                  <n-switch v-model:value="systemSettings.allowRegister" />
                </n-form-item>
                <n-form-item label="帖子需审核">
                  <n-switch v-model:value="systemSettings.postNeedReview" />
                </n-form-item>
                <n-form-item label="每日发帖限制">
                  <n-input-number
                    v-model:value="systemSettings.dailyPostLimit"
                    :min="1"
                    :max="100"
                  />
                </n-form-item>
                <n-form-item>
                  <n-space>
                    <n-button
                      type="primary"
                      @click="saveSettings"
                    >
                      保存设置
                    </n-button>
                    <n-button @click="resetSettings">
                      重置
                    </n-button>
                  </n-space>
                </n-form-item>
              </n-form>
            </n-card>

            <!-- 数据管理 -->
            <n-card
              title="数据管理"
              style="margin-top: 16px"
            >
              <n-space
                vertical
                :size="12"
              >
                <n-space>
                  <n-button
                    type="primary"
                    @click="exportAllData"
                  >
                    <template #icon>
                      <n-icon><DownloadIcon /></n-icon>
                    </template>
                    导出所有数据
                  </n-button>
                  <n-button @click="exportUsers">
                    导出用户
                  </n-button>
                  <n-button @click="exportPosts">
                    导出帖子
                  </n-button>
                  <n-button @click="exportStatistics">
                    导出统计
                  </n-button>
                </n-space>

                <n-divider />

                <n-space>
                  <n-button
                    type="warning"
                    @click="backupData"
                  >
                    备份数据
                  </n-button>
                  <n-upload
                    :show-file-list="false"
                    accept=".json"
                    @change="handleRestore"
                  >
                    <n-button type="info">
                      恢复数据
                    </n-button>
                  </n-upload>
                </n-space>

                <n-alert
                  type="warning"
                  title="注意"
                >
                  数据导入导出功能会影响系统数据，请谨慎操作。
                </n-alert>
              </n-space>
            </n-card>
          </n-tab-pane>
        </n-tabs>
      </n-gi>

      <!-- 右侧工具栏 -->
      <n-gi :span="6">
        <AdminToolsPanel />
      </n-gi>
    </n-grid>

    <!-- 拒绝帖子模态框 -->
    <n-modal
      v-model:show="showRejectModalVisible"
      preset="dialog"
      title="拒绝帖子"
    >
      <n-space vertical>
        <n-text>请输入拒绝原因：</n-text>
        <n-input
          v-model:value="rejectReason"
          type="textarea"
          placeholder="请输入拒绝原因..."
          :rows="4"
        />
      </n-space>
      <template #action>
        <n-space>
          <n-button @click="showRejectModalVisible = false">
            取消
          </n-button>
          <n-button
            type="error"
            @click="confirmRejectPost"
          >
            确认拒绝
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 编辑/添加帖子模态框 -->
    <n-modal
      v-model:show="showEditPostModal"
      preset="card"
      :title="editingPost ? '编辑帖子' : '添加帖子'"
      style="width: 600px"
    >
      <n-form
        :model="postForm"
        label-placement="left"
        label-width="80"
      >
        <n-form-item label="标题">
          <n-input
            v-model:value="postForm.title"
            placeholder="请输入帖子标题"
          />
        </n-form-item>
        <n-form-item label="内容">
          <n-input
            v-model:value="postForm.content"
            type="textarea"
            placeholder="请输入帖子内容"
            :rows="6"
          />
        </n-form-item>
        <n-form-item label="话题">
          <n-select
            v-model:value="postForm.topic"
            :options="topicOptions"
            placeholder="选择话题"
          />
        </n-form-item>
        <n-form-item label="标签">
          <n-dynamic-tags v-model:value="postForm.tags" />
        </n-form-item>
        <n-form-item label="状态">
          <n-select
            v-model:value="postForm.status"
            :options="[
              { label: '待审核', value: 'pending' },
              { label: '已通过', value: 'approved' },
              { label: '已拒绝', value: 'rejected' }
            ]"
          />
        </n-form-item>
        <n-form-item label="置顶">
          <n-switch v-model:value="postForm.isTop" />
        </n-form-item>
        <n-form-item label="热门">
          <n-switch v-model:value="postForm.isHot" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showEditPostModal = false">
            取消
          </n-button>
          <n-button
            type="primary"
            @click="handleSavePost"
          >
            保存
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, type DataTableColumns, NButton, NSpace, NTag, NAvatar, NPopconfirm } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { db, type User, type Post } from '@/utils/database'
import { PlaceholderImages } from '@/utils/imageGenerator'
import { DataExporter } from '@/utils/dataExport'
import AdminQuickStats from '@/components/AdminQuickStats.vue'
import AdminToolsPanel from '@/components/AdminToolsPanel.vue'
import {
  Grid as DashboardIcon,
  Shield as ShieldIcon,
  People as PeopleIcon,
  Document as DocumentIcon,
  TrendingUp as TrendingUpIcon,
  Alert as AlertIcon,
  Search as SearchIcon,
  Checkmark as CheckmarkIcon,
  Close as CloseIcon,
  BarChart as ChartIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Download as DownloadIcon
} from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

// 检查管理员权限
onMounted(() => {
  if (!userStore.currentUser || userStore.currentUser.role !== 'admin') {
    message.error('无权访问管理员页面')
    router.push('/')
  }
})

const activeTab = ref('statistics')
const showEditPostModal = ref(false)
const editingPost = ref<Post | null>(null)
const postTopicFilter = ref<string | null>(null)

// 帖子表单
const postForm = ref({
  title: '',
  content: '',
  topic: '校园生活',
  tags: [] as string[],
  status: 'approved' as 'pending' | 'approved' | 'rejected',
  isTop: false,
  isHot: false
})

// 话题选项
const topicOptions = [
  { label: '校园生活', value: '校园生活' },
  { label: '学习交流', value: '学习交流' },
  { label: '美食分享', value: '美食分享' },
  { label: '运动健身', value: '运动健身' },
  { label: '游戏娱乐', value: '游戏娱乐' },
  { label: '其他', value: '其他' }
]

// 处理统计卡片点击
const handleStatClick = (key: string) => {
  switch (key) {
    case 'users':
      activeTab.value = 'users'
      break
    case 'posts':
      activeTab.value = 'posts'
      break
    case 'pending':
      activeTab.value = 'review'
      break
  }
}

// 用户管理
const userSearchQuery = ref('')
const userStatusFilter = ref<string | null>(null)
const userRoleFilter = ref<string | null>(null)
const userPagination = { pageSize: 10 }

const userStatusOptions = [
  { label: '正常', value: 'active' },
  { label: '封禁', value: 'banned' },
  { label: '暂停', value: 'suspended' }
]

const userRoleOptions = [
  { label: '用户', value: 'user' },
  { label: '管理员', value: 'admin' }
]

const allUsers = computed(() => db.getUsers())

const filteredUsers = computed(() => {
  let users = allUsers.value

  if (userSearchQuery.value) {
    const query = userSearchQuery.value.toLowerCase()
    users = users.filter(u =>
      u.username.toLowerCase().includes(query) ||
      u.nickname.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    )
  }

  if (userStatusFilter.value) {
    users = users.filter(u => u.status === userStatusFilter.value)
  }

  if (userRoleFilter.value) {
    users = users.filter(u => u.role === userRoleFilter.value)
  }

  return users
})

const userColumns: DataTableColumns<User> = [
  {
    title: 'ID',
    key: 'id',
    width: 60
  },
  {
    title: '用户',
    key: 'user',
    render: (row) => {
      return h(NSpace, { align: 'center' }, {
        default: () => [
          h(NAvatar, {
            src: row.avatar,
            size: 'small'
          }),
          h('span', row.nickname)
        ]
      })
    }
  },
  {
    title: '用户名',
    key: 'username'
  },
  {
    title: '邮箱',
    key: 'email'
  },
  {
    title: '角色',
    key: 'role',
    render: (row) => {
      return h(NTag, {
        type: row.role === 'admin' ? 'error' : 'default',
        size: 'small'
      }, {
        default: () => row.role === 'admin' ? '管理员' : '用户'
      })
    }
  },
  {
    title: '状态',
    key: 'status',
    render: (row) => {
      const statusMap = {
        active: { type: 'success' as const, text: '正常' },
        banned: { type: 'error' as const, text: '封禁' },
        suspended: { type: 'warning' as const, text: '暂停' }
      }
      const status = statusMap[row.status || 'active']
      return h(NTag, { type: status.type, size: 'small' }, { default: () => status.text })
    }
  },
  {
    title: '注册时间',
    key: 'joinDate',
    render: (row) => formatDate(row.joinDate)
  },
  {
    title: '操作',
    key: 'actions',
    render: (row) => {
      return h(NSpace, {}, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: row.status === 'banned' ? 'success' : 'warning',
            onClick: () => toggleUserStatus(row.id, row.status || 'active')
          }, {
            default: () => row.status === 'banned' ? '解封' : '封禁'
          }),
          h(NPopconfirm, {
            onPositiveClick: () => deleteUser(row.id)
          }, {
            trigger: () => h(NButton, {
              size: 'small',
              type: 'error'
            }, { default: () => '删除' }),
            default: () => '确定删除该用户吗？'
          })
        ]
      })
    }
  }
]

// 帖子管理
const postSearchQuery = ref('')
const postStatusFilter = ref<string | null>(null)
const postPagination = { pageSize: 10 }

const postStatusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' }
]

const allPosts = computed(() => db.getPosts())

const filteredPosts = computed(() => {
  let posts = allPosts.value

  if (postSearchQuery.value) {
    const query = postSearchQuery.value.toLowerCase()
    posts = posts.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query)
    )
  }

  if (postStatusFilter.value) {
    posts = posts.filter(p => p.status === postStatusFilter.value)
  }

  if (postTopicFilter.value) {
    posts = posts.filter(p => p.topic === postTopicFilter.value)
  }

  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const postColumns: DataTableColumns<Post> = [
  {
    title: 'ID',
    key: 'id',
    width: 60
  },
  {
    title: '标题',
    key: 'title',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '作者',
    key: 'author',
    render: (row) => {
      const author = db.getUserById(row.authorId)
      return author?.nickname || '未知用户'
    }
  },
  {
    title: '话题',
    key: 'topic',
    render: (row) => h(NTag, { size: 'small' }, { default: () => row.topic })
  },
  {
    title: '状态',
    key: 'status',
    render: (row) => {
      const statusMap = {
        pending: { type: 'warning' as const, text: '待审核' },
        approved: { type: 'success' as const, text: '已通过' },
        rejected: { type: 'error' as const, text: '已拒绝' }
      }
      const status = statusMap[row.status || 'approved']
      return h(NTag, { type: status.type, size: 'small' }, { default: () => status.text })
    }
  },
  {
    title: '数据',
    key: 'stats',
    render: (row) => {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h('span', `👍 ${row.likes}`),
          h('span', `💬 ${row.comments}`),
          h('span', `👁 ${row.views}`)
        ]
      })
    }
  },
  {
    title: '发布时间',
    key: 'createdAt',
    render: (row) => formatDate(row.createdAt)
  },
  {
    title: '操作',
    key: 'actions',
    render: (row) => {
      return h(NSpace, {}, {
        default: () => [
          h(NButton, {
            size: 'small',
            onClick: () => handleEditPost(row)
          }, {
            default: () => '编辑'
          }),
          h(NButton, {
            size: 'small',
            type: row.isTop ? 'default' : 'primary',
            onClick: () => togglePostTop(row.id, !row.isTop)
          }, {
            default: () => row.isTop ? '取消置顶' : '置顶'
          }),
          h(NPopconfirm, {
            onPositiveClick: () => deletePost(row.id)
          }, {
            trigger: () => h(NButton, {
              size: 'small',
              type: 'error'
            }, { default: () => '删除' }),
            default: () => '确定删除该帖子吗？'
          })
        ]
      })
    }
  }
]

// 内容审核
const pendingReviewPosts = computed(() => {
  return allPosts.value.filter(p => p.status === 'pending')
})

const showRejectModalVisible = ref(false)
const rejectReason = ref('')
const rejectingPostId = ref<number | null>(null)

const showRejectModal = (postId: number) => {
  rejectingPostId.value = postId
  rejectReason.value = ''
  showRejectModalVisible.value = true
}

const approvePost = (postId: number) => {
  db.updatePost(postId, { status: 'approved' })
  message.success('帖子已通过审核')
}

const confirmRejectPost = () => {
  if (!rejectingPostId.value) return

  if (!rejectReason.value.trim()) {
    message.error('请输入拒绝原因')
    return
  }

  db.updatePost(rejectingPostId.value, {
    status: 'rejected',
    rejectionReason: rejectReason.value
  })

  message.success('帖子已拒绝')
  showRejectModalVisible.value = false
  rejectingPostId.value = null
  rejectReason.value = ''
}

// 系统设置
const systemSettings = ref({
  siteName: '校园绳网',
  allowRegister: true,
  postNeedReview: false,
  dailyPostLimit: 10
})

const saveSettings = () => {
  localStorage.setItem('system_settings', JSON.stringify(systemSettings.value))
  message.success('设置已保存')
}

const resetSettings = () => {
  systemSettings.value = {
    siteName: '校园绳网',
    allowRegister: true,
    postNeedReview: false,
    dailyPostLimit: 10
  }
}

// 工具函数
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPostAuthor = (authorId: number) => {
  return db.getUserById(authorId)
}

const toggleUserStatus = (userId: number, currentStatus: string) => {
  const newStatus = currentStatus === 'banned' ? 'active' : 'banned'
  db.updateUser(userId, { status: newStatus })
  message.success(newStatus === 'banned' ? '用户已封禁' : '用户已解封')
}

const deleteUser = (userId: number) => {
  if (!confirm('确定要删除这个用户吗？此操作不可恢复！')) return

  // 删除用户的所有帖子
  const userPosts = db.getPosts().filter(p => p.authorId === userId)
  userPosts.forEach(post => db.deletePost(post.id))

  // 删除用户的所有评论
  const userComments = db.getComments().filter(c => c.authorId === userId)
  userComments.forEach(comment => db.deleteComment(comment.id))

  // 删除用户
  db.deleteUser(userId)

  // 刷新用户列表
  loadUsers()

  message.success('用户及其所有内容已删除')
}

const togglePostTop = (postId: number, isTop: boolean) => {
  db.updatePost(postId, { isTop })
  loadPosts()
  message.success(isTop ? '帖子已置顶' : '已取消置顶')
}

const deletePost = (postId: number) => {
  if (!confirm('确定要删除这个帖子吗？')) return

  // 删除帖子的所有评论
  const postComments = db.getComments().filter(c => c.postId === postId)
  postComments.forEach(comment => db.deleteComment(comment.id))

  // 删除帖子
  db.deletePost(postId)

  // 刷新帖子列表
  loadPosts()

  message.success('帖子及其所有评论已删除')
}

const handleEditPost = (post: Post) => {
  editingPost.value = post
  postForm.value = {
    title: post.title,
    content: post.content,
    topic: post.topic,
    tags: post.tags || [],
    status: post.status || 'approved',
    isTop: post.isTop || false,
    isHot: post.isHot || false
  }
  showEditPostModal.value = true
}

const handleSavePost = () => {
  if (!postForm.value.title || !postForm.value.content) {
    message.error('请填写标题和内容')
    return
  }

  if (editingPost.value) {
    // 编辑现有帖子
    db.updatePost(editingPost.value.id, {
      title: postForm.value.title,
      content: postForm.value.content,
      topic: postForm.value.topic,
      tags: postForm.value.tags,
      status: postForm.value.status,
      isTop: postForm.value.isTop,
      isHot: postForm.value.isHot
    })
    message.success('帖子更新成功')
  } else {
    // 创建新帖子
    const currentUser = userStore.currentUser
    if (!currentUser) {
      message.error('请先登录')
      return
    }

    db.createPost({
      title: postForm.value.title,
      content: postForm.value.content,
      topic: postForm.value.topic,
      tags: postForm.value.tags,
      authorId: currentUser.id,
      status: postForm.value.status,
      isTop: postForm.value.isTop,
      isHot: postForm.value.isHot
    })
    message.success('帖子创建成功')
  }

  showEditPostModal.value = false
  editingPost.value = null
  postForm.value = {
    title: '',
    content: '',
    topic: '校园生活',
    tags: [],
    status: 'approved',
    isTop: false,
    isHot: false
  }
}

// 数据导出功能
const exportAllData = () => {
  DataExporter.exportAll()
  message.success('数据导出成功')
}

const exportUsers = () => {
  DataExporter.exportUsers()
  message.success('用户数据导出成功')
}

const exportPosts = () => {
  DataExporter.exportPosts()
  message.success('帖子数据导出成功')
}

const exportStatistics = () => {
  DataExporter.exportStatistics()
  message.success('统计报告导出成功')
}

const backupData = () => {
  DataExporter.backup()
  message.success('数据备份成功')
}

const handleRestore = async (options: any) => {
  const file = options.file.file
  if (!file) return

  try {
    await DataExporter.restore(file)
    message.success('数据恢复成功，页面将刷新')
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    message.error('数据恢复失败')
  }
}

// 加载系统设置
onMounted(() => {
  const savedSettings = localStorage.getItem('system_settings')
  if (savedSettings) {
    systemSettings.value = JSON.parse(savedSettings)
  }
})
</script>

<style scoped>
.admin-dashboard {
  padding: 32px;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}

.page-header {
  margin-bottom: 32px;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.15), rgba(255, 138, 101, 0.15));
  backdrop-filter: blur(10px);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(255, 107, 53, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.admin-tabs {
  margin-top: 24px;
}

.admin-tabs :deep(.n-tabs-nav) {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 8px;
}

.admin-tabs :deep(.n-tabs-tab) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.admin-tabs :deep(.n-tabs-tab:hover) {
  background: rgba(255, 107, 53, 0.1);
}

.stats-grid {
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.15) 0%, rgba(255, 107, 53, 0.08) 100%);
  border: 1px solid rgba(255, 107, 53, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(255, 107, 53, 0.3);
  border-color: rgba(255, 107, 53, 0.5);
}

.charts-grid {
  margin-top: 24px;
}

.chart-card {
  min-height: 300px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 107, 53, 0.2);
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  color: rgba(255, 255, 255, 0.5);
}

.review-item {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.review-item:last-child {
  margin-bottom: 0;
}

.review-item :deep(.n-card) {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 107, 53, 0.2);
  transition: all 0.3s ease;
}

.review-item :deep(.n-card:hover) {
  border-color: rgba(255, 107, 53, 0.4);
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.2);
}
</style>

