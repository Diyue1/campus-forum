<template>
  <div class="admin-users">
    <h2>用户管理</h2>
    <n-data-table 
      :columns="columns" 
      :data="users" 
      :pagination="pagination"
      :bordered="false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { NButton, NTag, useMessage } from 'naive-ui'
import { db } from '@/utils/database'

const message = useMessage()
const users = ref<any[]>([])
const pagination = { pageSize: 10 }

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '用户名', key: 'username', width: 120 },
  { title: '昵称', key: 'nickname', width: 120 },
  { title: '邮箱', key: 'email', ellipsis: { tooltip: true } },
  {
    title: '角色',
    key: 'role',
    width: 100,
    render: (row: any) => h(
      NTag, 
      { type: row.role === 'admin' ? 'error' : 'info' }, 
      { default: () => row.role === 'admin' ? '管理员' : '用户' }
    )
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: any) => h(
      NTag, 
      { type: row.status === 'banned' ? 'error' : 'success' }, 
      { default: () => row.status === 'banned' ? '已封禁' : '正常' }
    )
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row: any) => h('div', { style: { display: 'flex', gap: '8px' } }, [
      h(
        NButton, 
        {
          size: 'small',
          type: row.status === 'banned' ? 'success' : 'warning',
          onClick: () => toggleStatus(row)
        }, 
        { default: () => row.status === 'banned' ? '解封' : '封禁' }
      ),
      h(
        NButton, 
        {
          size: 'small',
          type: 'error',
          onClick: () => deleteUser(row.id)
        }, 
        { default: () => '删除' }
      )
    ])
  }
]

const toggleStatus = (user: any) => {
  const newStatus = user.status === 'banned' ? 'active' : 'banned'
  db.updateUser(user.id, { status: newStatus })
  message.success(newStatus === 'banned' ? '用户已封禁' : '用户已解封')
  loadUsers()
}

const deleteUser = (userId: number) => {
  if (!confirm('确定删除此用户？此操作将删除用户的所有内容且不可恢复！')) return
  
  // 删除用户的所有帖子
  const userPosts = db.getPosts().filter(p => p.authorId === userId)
  userPosts.forEach(post => db.deletePost(post.id))
  
  // 删除用户的所有评论
  const userComments = db.getComments().filter(c => c.authorId === userId)
  userComments.forEach(comment => db.deleteComment(comment.id))
  
  // 删除用户
  db.deleteUser(userId)
  
  message.success('用户已删除')
  loadUsers()
}

const loadUsers = () => {
  users.value = db.getUsers()
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-users {
  max-width: 1400px;
}

.admin-users h2 {
  color: white;
  margin-bottom: 24px;
  font-size: 24px;
}

:deep(.n-data-table) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

:deep(.n-data-table-th) {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  font-weight: 600;
}

:deep(.n-data-table-td) {
  color: rgba(255, 255, 255, 0.9);
}

:deep(.n-data-table-tr:hover) {
  background: rgba(255, 255, 255, 0.05);
}
</style>

