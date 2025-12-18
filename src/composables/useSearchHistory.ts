/**
 * 搜索历史 Composable
 * 使用 database.ts 统一管理搜索历史
 */
import { ref, computed } from 'vue'
import { db } from '@/utils/database'
import { useUserStore } from '@/stores/user'
import { Logger } from '@/utils/logger'

export function useSearchHistory() {
  const userStore = useUserStore()
  const history = ref<string[]>([])

  /**
   * 加载搜索历史
   */
  const loadHistory = () => {
    if (!userStore.currentUser) {
      history.value = []
      return
    }

    try {
      history.value = db.getSearchHistory(userStore.currentUser.id)
    } catch (error) {
      Logger.error('加载搜索历史失败', { 
        error: error instanceof Error ? error.message : String(error),
        userId: userStore.currentUser.id 
      })
    }
  }

  /**
   * 添加搜索记录
   */
  const addHistory = (keyword: string) => {
    if (!userStore.currentUser || !keyword.trim()) return

    try {
      db.addSearchHistory(userStore.currentUser.id, keyword.trim())
      loadHistory() // 重新加载
    } catch (error) {
      Logger.error('添加搜索历史失败', { 
        error: error instanceof Error ? error.message : String(error),
        keyword 
      }, userStore.currentUser.id)
    }
  }

  /**
   * 清空搜索历史
   */
  const clearHistory = () => {
    if (!userStore.currentUser) return

    try {
      db.clearSearchHistory(userStore.currentUser.id)
      history.value = []
      Logger.info('清空搜索历史', {}, userStore.currentUser.id)
    } catch (error) {
      Logger.error('清空搜索历史失败', { 
        error: error instanceof Error ? error.message : String(error)
      }, userStore.currentUser.id)
    }
  }

  /**
   * 获取热门搜索
   */
  const getHotSearches = (limit: number = 10) => {
    try {
      return db.getHotSearches(limit)
    } catch (error) {
      Logger.error('获取热门搜索失败', { 
        error: error instanceof Error ? error.message : String(error)
      })
      return []
    }
  }

  /**
   * 历史记录数量
   */
  const historyCount = computed(() => history.value.length)

  return {
    history,
    historyCount,
    loadHistory,
    addHistory,
    clearHistory,
    getHotSearches
  }
}

