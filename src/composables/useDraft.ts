/**
 * 草稿管理 Composable
 * 使用 database.ts 统一管理草稿
 */
import { ref, computed } from 'vue'
import { db, type Draft } from '@/utils/database'
import { useUserStore } from '@/stores/user'
import { messageService } from '@/utils/message'
import { Logger } from '@/utils/logger'

export function useDraft() {
  const userStore = useUserStore()
  const drafts = ref<Draft[]>([])

  /**
   * 加载用户的草稿列表
   */
  const loadDrafts = () => {
    if (!userStore.currentUser) {
      drafts.value = []
      return
    }

    try {
      drafts.value = db.getDrafts(userStore.currentUser.id)
    } catch (error) {
      Logger.error('加载草稿失败', { 
        error: error instanceof Error ? error.message : String(error),
        userId: userStore.currentUser.id 
      })
      messageService.error('加载草稿失败')
    }
  }

  /**
   * 保存草稿
   */
  const saveDraft = (draftData: Omit<Draft, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Draft | null => {
    if (!userStore.currentUser) {
      messageService.warning('请先登录')
      return null
    }

    try {
      const draft = db.saveDraft({
        ...draftData,
        userId: userStore.currentUser.id
      })
      
      // 刷新草稿列表
      loadDrafts()
      
      Logger.info('保存草稿', { draftId: draft.id }, userStore.currentUser.id)
      return draft
    } catch (error) {
      Logger.error('保存草稿失败', { 
        error: error instanceof Error ? error.message : String(error)
      }, userStore.currentUser.id)
      messageService.error('保存草稿失败')
      return null
    }
  }

  /**
   * 更新草稿
   */
  const updateDraft = (draftId: number, updates: Partial<Draft>): Draft | null => {
    if (!userStore.currentUser) {
      messageService.warning('请先登录')
      return null
    }

    try {
      const draft = db.updateDraft(draftId, updates)
      if (draft) {
        // 刷新草稿列表
        loadDrafts()
        Logger.info('更新草稿', { draftId }, userStore.currentUser.id)
      }
      return draft
    } catch (error) {
      Logger.error('更新草稿失败', { 
        error: error instanceof Error ? error.message : String(error),
        draftId 
      }, userStore.currentUser.id)
      messageService.error('更新草稿失败')
      return null
    }
  }

  /**
   * 删除草稿
   */
  const deleteDraft = (draftId: number): boolean => {
    if (!userStore.currentUser) {
      messageService.warning('请先登录')
      return false
    }

    try {
      const success = db.deleteDraft(draftId)
      if (success) {
        // 刷新草稿列表
        loadDrafts()
        Logger.info('删除草稿', { draftId }, userStore.currentUser.id)
        messageService.success('草稿已删除')
      }
      return success
    } catch (error) {
      Logger.error('删除草稿失败', { 
        error: error instanceof Error ? error.message : String(error),
        draftId 
      }, userStore.currentUser.id)
      messageService.error('删除草稿失败')
      return false
    }
  }

  /**
   * 获取草稿
   */
  const getDraft = (draftId: number): Draft | null => {
    if (!userStore.currentUser) return null
    
    const draft = drafts.value.find(d => d.id === draftId)
    return draft || null
  }

  /**
   * 草稿数量
   */
  const draftCount = computed(() => drafts.value.length)

  return {
    drafts,
    draftCount,
    loadDrafts,
    saveDraft,
    updateDraft,
    deleteDraft,
    getDraft
  }
}

