<template>
  <div class="admin-comments">
    <h2>评论管理</h2>
    <n-data-table
      :columns="columns"
      :data="comments"
      :pagination="pagination"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { NButton, useMessage } from 'naive-ui'
import { db } from '@/utils/database'

const message = useMessage()
const comments = ref<any[]>([])
const pagination = { pageSize: 10 }

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '内容', key: 'content', ellipsis: { tooltip: true } },
  { title: '作者', key: 'authorName', width: 120 },
  { title: '帖子', key: 'postTitle', width: 200, ellipsis: { tooltip: true } },
  { title: '点赞', key: 'likes', width: 80 },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row: any) => h(NButton, { size: 'small', type: 'error', onClick: () => deleteComment(row.id) }, { default: () => '删除' })
  }
]

const deleteComment = (commentId: number) => {
  if (!confirm('确定删除此评论？')) return
  db.deleteComment(commentId)
  message.success('评论已删除')
  loadComments()
}

const loadComments = () => {
  comments.value = db.getComments().map(c => ({
    ...c,
    authorName: db.getUserById(c.authorId)?.nickname || '未知',
    postTitle: db.getPostById(c.postId)?.title || '已删除'
  }))
}

onMounted(loadComments)
</script>

<style scoped>
.admin-comments {
  max-width: 1400px;
}

.admin-comments h2 {
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

