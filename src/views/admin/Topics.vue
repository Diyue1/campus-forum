<template>
  <div class="admin-topics">
    <h2>热门话题管理</h2>
    
    <n-space
      vertical
      size="large"
    >
      <!-- 添加话题 -->
      <n-card title="添加新话题">
        <n-form inline>
          <n-form-item label="话题名称">
            <n-input
              v-model:value="newTopic.name"
              placeholder="请输入话题名称"
              style="width: 200px"
            />
          </n-form-item>
          <n-form-item label="话题图标">
            <n-input
              v-model:value="newTopic.icon"
              placeholder="emoji图标"
              style="width: 100px"
            />
          </n-form-item>
          <n-form-item label="话题描述">
            <n-input
              v-model:value="newTopic.description"
              placeholder="简短描述"
              style="width: 300px"
            />
          </n-form-item>
          <n-form-item>
            <n-button
              type="primary"
              @click="addTopic"
            >
              <template #icon>
                <n-icon><AddIcon /></n-icon>
              </template>
              添加话题
            </n-button>
          </n-form-item>
        </n-form>
      </n-card>
      
      <!-- 话题列表 -->
      <n-card title="话题列表">
        <n-data-table
          :columns="columns"
          :data="topics"
          :pagination="{ pageSize: 10 }"
        />
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { NButton, NTag, NSwitch, useMessage } from 'naive-ui'
import { Add as AddIcon, Trash as TrashIcon } from '@vicons/ionicons5'

const message = useMessage()
const topics = ref<any[]>([])
const newTopic = ref({
  name: '',
  icon: '',
  description: ''
})

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { 
    title: '图标', 
    key: 'icon', 
    width: 80,
    render: (row: any) => h('span', { style: { fontSize: '24px' } }, row.icon)
  },
  { title: '话题名称', key: 'name', width: 150 },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  { title: '帖子数', key: 'postCount', width: 100 },
  {
    title: '状态',
    key: 'active',
    width: 100,
    render: (row: any) => h(NSwitch, {
      value: row.active,
      onUpdateValue: (val: boolean) => toggleTopicStatus(row.id, val)
    })
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row: any) => h(NButton, {
      size: 'small',
      type: 'error',
      onClick: () => deleteTopic(row.id)
    }, {
      default: () => '删除',
      icon: () => h(TrashIcon)
    })
  }
]

const loadTopics = () => {
  const saved = localStorage.getItem('hot_topics')
  if (saved) {
    topics.value = JSON.parse(saved)
  } else {
    // 默认话题
    topics.value = [
      { id: 1, name: '校园生活', icon: '🏫', description: '分享校园日常', postCount: 0, active: true },
      { id: 2, name: '学习经验', icon: '📚', description: '学习方法和经验', postCount: 0, active: true },
      { id: 3, name: '美食推荐', icon: '🍜', description: '校园周边美食', postCount: 0, active: true },
      { id: 4, name: '社团活动', icon: '🎭', description: '社团招新和活动', postCount: 0, active: true },
      { id: 5, name: '考试攻略', icon: '📝', description: '考试复习技巧', postCount: 0, active: true },
      { id: 6, name: '实习求职', icon: '💼', description: '实习和求职经验', postCount: 0, active: true },
      { id: 7, name: '恋爱日常', icon: '💕', description: '校园恋爱故事', postCount: 0, active: true },
      { id: 8, name: '旅行分享', icon: '✈️', description: '旅行见闻', postCount: 0, active: true },
      { id: 9, name: '科技数码', icon: '💻', description: '数码产品讨论', postCount: 0, active: true },
      { id: 10, name: '运动健身', icon: '🏃', description: '运动健身打卡', postCount: 0, active: true }
    ]
    saveTopics()
  }
  
  // 更新帖子数量
  const posts = JSON.parse(localStorage.getItem('campus_forum_posts') || '[]')
  topics.value.forEach(topic => {
    topic.postCount = posts.filter((p: any) => p.topic === topic.name && (p.status === 'approved' || !p.status)).length
  })
}

const saveTopics = () => {
  localStorage.setItem('hot_topics', JSON.stringify(topics.value))
}

const addTopic = () => {
  if (!newTopic.value.name.trim()) {
    message.error('请输入话题名称')
    return
  }
  
  if (!newTopic.value.icon.trim()) {
    message.error('请输入话题图标')
    return
  }
  
  const maxId = topics.value.length > 0 ? Math.max(...topics.value.map(t => t.id)) : 0
  
  topics.value.push({
    id: maxId + 1,
    name: newTopic.value.name,
    icon: newTopic.value.icon,
    description: newTopic.value.description || '',
    postCount: 0,
    active: true
  })
  
  saveTopics()
  message.success('话题添加成功')
  
  newTopic.value = { name: '', icon: '', description: '' }
}

const toggleTopicStatus = (id: number, active: boolean) => {
  const topic = topics.value.find(t => t.id === id)
  if (topic) {
    topic.active = active
    saveTopics()
    message.success(active ? '话题已启用' : '话题已禁用')
  }
}

const deleteTopic = (id: number) => {
  if (!confirm('确定删除此话题？')) return
  
  const index = topics.value.findIndex(t => t.id === id)
  if (index > -1) {
    topics.value.splice(index, 1)
    saveTopics()
    message.success('话题已删除')
  }
}

onMounted(loadTopics)
</script>

<style scoped>
.admin-topics {
  max-width: 1400px;
}

.admin-topics h2 {
  color: white;
  margin-bottom: 24px;
  font-size: 24px;
}

:deep(.n-card) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.n-card-header) {
  color: white;
  font-weight: 600;
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
</style>

