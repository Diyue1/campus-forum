<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    title="草稿箱"
    style="width: 800px"
  >
    <n-space
      vertical
      :size="16"
    >
      <n-empty
        v-if="drafts.length === 0"
        description="暂无草稿"
      >
        <template #icon>
          <n-icon size="48">
            <DocumentIcon />
          </n-icon>
        </template>
      </n-empty>

      <n-card
        v-for="draft in drafts"
        :key="draft.id"
        class="draft-card"
        hoverable
      >
        <template #header>
          <n-space
            justify="space-between"
            align="center"
          >
            <n-text strong>
              {{ draft.title || '无标题' }}
            </n-text>
            <n-text
              depth="3"
              style="font-size: 12px"
            >
              {{ formatRelativeTime(draft.updatedAt) }}
            </n-text>
          </n-space>
        </template>

        <n-ellipsis
          :line-clamp="2"
          style="margin-bottom: 12px"
        >
          {{ stripHtml(draft.content) }}
        </n-ellipsis>

        <template #footer>
          <n-space justify="end">
            <n-button
              size="small"
              @click="editDraft(draft)"
            >
              <template #icon>
                <n-icon><EditIcon /></n-icon>
              </template>
              编辑
            </n-button>
            <n-popconfirm @positive-click="handleDeleteDraft(draft.id)">
              <template #trigger>
                <n-button
                  size="small"
                  type="error"
                >
                  <template #icon>
                    <n-icon><TrashIcon /></n-icon>
                  </template>
                  删除
                </n-button>
              </template>
              确定删除这个草稿吗？
            </n-popconfirm>
          </n-space>
        </template>
      </n-card>
    </n-space>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { type Draft } from '@/utils/database'
import { useDraft } from '@/composables/useDraft'
import { useTimeFormat } from '@/composables/useTimeFormat'
import { useHtmlUtils } from '@/composables/useHtmlUtils'
import {
  Document as DocumentIcon,
  Create as EditIcon,
  Trash as TrashIcon
} from '@vicons/ionicons5'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'edit': [draft: Draft]
}>()

const router = useRouter()

const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

// 使用 composables
const { drafts, loadDrafts, deleteDraft: removeDraft, saveDraft } = useDraft()
const { formatRelativeTime } = useTimeFormat()
const { stripHtml } = useHtmlUtils()

// 编辑草稿
const editDraft = (draft: Draft) => {
  emit('edit', draft)
  showModal.value = false
}

// 删除草稿（包装以使用 composable）
const handleDeleteDraft = (id: number) => {
  removeDraft(id)
}

// 监听 modal 显示状态，加载草稿
watch(() => props.show, (visible) => {
  if (visible) {
    loadDrafts()
  }
})

onMounted(() => {
  if (props.show) {
    loadDrafts()
  }
})

defineExpose({
  saveDraft,
  loadDrafts
})
</script>

<style scoped>
.draft-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 107, 53, 0.2);
  transition: all 0.3s ease;
}

.draft-card:hover {
  border-color: rgba(255, 107, 53, 0.5);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2);
}
</style>

