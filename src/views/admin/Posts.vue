<template>
  <div class="admin-posts">
    <h2>帖子管理</h2>
    <n-data-table
      :columns="columns"
      :data="posts"
      :pagination="pagination"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { NButton, NTag, useMessage } from 'naive-ui'
import { db } from '@/utils/database'

const message = useMessage()
const posts = ref<any[]>([])
const pagination = { pageSize: 10 }

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  { title: '作者', key: 'authorName', width: 120 },
  { title: '话题', key: 'topic', width: 100 },
  { title: '浏览', key: 'views', width: 80 },
  { title: '点赞', key: 'likes', width: 80 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: any) => h(NTag, {
      type: row.status === 'approved' ? 'success' : row.status === 'pending' ? 'warning' : 'error'
    }, {
      default: () => row.status === 'approved' ? '已审核' : row.status === 'pending' ? '待审核' : '已拒绝'
    })
  },
  {
    title: '置顶',
    key: 'isTop',
    width: 80,
    render: (row: any) => h(NTag, { type: row.isTop ? 'success' : 'default' }, { default: () => row.isTop ? '是' : '否' })
  },
  {
    title: '操作',
    key: 'actions',
    width: 280,
    render: (row: any) => h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } }, [
      row.status === 'pending' ? h(NButton, { size: 'small', type: 'success', onClick: () => approvePost(row.id) }, { default: () => '通过' }) : null,
      row.status === 'pending' ? h(NButton, { size: 'small', type: 'error', onClick: () => rejectPost(row.id) }, { default: () => '拒绝' }) : null,
      h(NButton, { size: 'small', onClick: () => toggleTop(row) }, { default: () => row.isTop ? '取消置顶' : '置顶' }),
      h(NButton, { size: 'small', type: 'error', onClick: () => deletePost(row.id) }, { default: () => '删除' })
    ].filter(Boolean))
  }
]

const approvePost = (postId: number) => {
  db.updatePost(postId, { status: 'approved' })
  message.success('帖子已审核通过')
  loadPosts()
}

const rejectPost = (postId: number) => {
  if (!confirm('确定拒绝此帖子？')) return
  db.updatePost(postId, { status: 'rejected' })
  message.success('帖子已拒绝')
  loadPosts()
}

const toggleTop = (post: any) => {
  db.updatePost(post.id, { isTop: !post.isTop })
  message.success(post.isTop ? '已取消置顶' : '已置顶')
  loadPosts()
}

const deletePost = (postId: number) => {
  if (!confirm('确定删除此帖子？')) return
  db.getComments().filter(c => c.postId === postId).forEach(c => db.deleteComment(c.id))
  db.deletePost(postId)
  message.success('帖子已删除')
  loadPosts()
}

const loadPosts = () => {
  posts.value = db.getPosts().map(p => ({
    ...p,
    authorName: db.getUserById(p.authorId)?.nickname || '未知'
  }))
}

onMounted(loadPosts)
</script>

<style scoped>
.admin-posts {
  max-width: 1400px;
}

.admin-posts h2 {
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

