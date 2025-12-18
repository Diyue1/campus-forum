import { ref, computed, Ref } from 'vue'

/**
 * 分页选项
 */
export interface PaginationOptions {
  pageSize?: number          // 每页数量
  initialPage?: number       // 初始页码
  prefetchPages?: number     // 预加载页数
}

/**
 * 分页结果
 */
export interface PaginationResult<T> {
  items: Ref<T[]>                          // 当前显示的项目
  currentPage: Ref<number>                 // 当前页码
  totalPages: Ref<number>                  // 总页数
  hasMore: Ref<boolean>                    // 是否有更多
  loading: Ref<boolean>                    // 加载状态
  loadMore: () => void                     // 加载更多
  loadPage: (page: number) => void         // 加载指定页
  reset: () => void                        // 重置
  setData: (data: T[]) => void             // 设置数据
  refresh: () => void                      // 刷新当前页
}

/**
 * 创建分页加载
 * @param allData 所有数据的 Ref
 * @param options 分页选项
 * @returns 分页结果
 */
export function usePagination<T>(
  allData: Ref<T[]>,
  options: PaginationOptions = {}
): PaginationResult<T> {
  const {
    pageSize = 20,
    initialPage = 1,
    prefetchPages = 0
  } = options

  const currentPage = ref(initialPage)
  const loading = ref(false)

  // 总页数
  const totalPages = computed(() => {
    return Math.ceil(allData.value.length / pageSize)
  })

  // 当前显示的项目
  const items = computed(() => {
    const start = 0
    const end = currentPage.value * pageSize
    return allData.value.slice(start, end)
  })

  // 是否有更多
  const hasMore = computed(() => {
    return currentPage.value < totalPages.value
  })

  // 加载更多
  const loadMore = () => {
    if (loading.value || !hasMore.value) return

    loading.value = true
    
    // 模拟异步加载
    setTimeout(() => {
      currentPage.value++
      loading.value = false
    }, 300)
  }

  // 加载指定页
  const loadPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return
    
    loading.value = true
    
    setTimeout(() => {
      currentPage.value = page
      loading.value = false
      
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 300)
  }

  // 重置
  const reset = () => {
    currentPage.value = initialPage
    loading.value = false
  }

  // 设置数据
  const setData = (data: T[]) => {
    allData.value = data
    reset()
  }

  // 刷新当前页
  const refresh = () => {
    loading.value = true
    setTimeout(() => {
      loading.value = false
    }, 300)
  }

  return {
    items,
    currentPage,
    totalPages,
    hasMore,
    loading,
    loadMore,
    loadPage,
    reset,
    setData,
    refresh
  }
}

/**
 * 无限滚动选项
 */
export interface InfiniteScrollOptions {
  distance?: number          // 触发距离（像素）
  throttle?: number          // 节流时间（毫秒）
  disabled?: Ref<boolean>    // 是否禁用
}

/**
 * 创建无限滚动
 * @param loadMore 加载更多的回调
 * @param options 选项
 * @returns 清理函数
 */
export function useInfiniteScroll(
  loadMore: () => void,
  options: InfiniteScrollOptions = {}
): () => void {
  const {
    distance = 300,
    throttle = 200,
    disabled = ref(false)
  } = options

  let lastScrollTime = 0
  let ticking = false

  const handleScroll = () => {
    if (disabled.value || ticking) return

    const now = Date.now()
    if (now - lastScrollTime < throttle) return

    lastScrollTime = now
    ticking = true

    requestAnimationFrame(() => {
      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const clientHeight = document.documentElement.clientHeight

      if (scrollHeight - scrollTop - clientHeight < distance) {
        loadMore()
      }

      ticking = false
    })
  }

  window.addEventListener('scroll', handleScroll, { passive: true })

  // 返回清理函数
  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
}

/**
 * 虚拟滚动选项
 */
export interface VirtualScrollOptions {
  itemHeight: number         // 每项高度
  bufferSize?: number        // 缓冲区大小
  containerHeight?: number   // 容器高度
}

/**
 * 虚拟滚动结果
 */
export interface VirtualScrollResult<T> {
  visibleItems: Ref<T[]>                   // 可见项目
  startIndex: Ref<number>                  // 开始索引
  endIndex: Ref<number>                    // 结束索引
  totalHeight: Ref<number>                 // 总高度
  offsetY: Ref<number>                     // Y 偏移
  handleScroll: (scrollTop: number) => void // 滚动处理
}

/**
 * 创建虚拟滚动
 * @param allData 所有数据
 * @param options 选项
 * @returns 虚拟滚动结果
 */
export function useVirtualScroll<T>(
  allData: Ref<T[]>,
  options: VirtualScrollOptions
): VirtualScrollResult<T> {
  const {
    itemHeight,
    bufferSize = 5,
    containerHeight = 600
  } = options

  const startIndex = ref(0)
  const endIndex = ref(0)
  const offsetY = ref(0)

  // 总高度
  const totalHeight = computed(() => {
    return allData.value.length * itemHeight
  })

  // 可见项目数量
  const visibleCount = Math.ceil(containerHeight / itemHeight)

  // 可见项目
  const visibleItems = computed(() => {
    const start = Math.max(0, startIndex.value - bufferSize)
    const end = Math.min(allData.value.length, endIndex.value + bufferSize)
    return allData.value.slice(start, end)
  })

  // 处理滚动
  const handleScroll = (scrollTop: number) => {
    const newStartIndex = Math.floor(scrollTop / itemHeight)
    const newEndIndex = newStartIndex + visibleCount

    startIndex.value = newStartIndex
    endIndex.value = newEndIndex
    offsetY.value = newStartIndex * itemHeight
  }

  // 初始化
  handleScroll(0)

  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    handleScroll
  }
}

/**
 * 分页导航组件数据
 */
export interface PaginationNavData {
  currentPage: number
  totalPages: number
  pageNumbers: number[]
  hasPrev: boolean
  hasNext: boolean
  goToPage: (page: number) => void
  goToPrev: () => void
  goToNext: () => void
}

/**
 * 创建分页导航
 * @param currentPage 当前页码
 * @param totalPages 总页数
 * @param onPageChange 页码变化回调
 * @param maxButtons 最大按钮数
 * @returns 分页导航数据
 */
export function usePaginationNav(
  currentPage: Ref<number>,
  totalPages: Ref<number>,
  onPageChange: (page: number) => void,
  maxButtons: number = 7
): PaginationNavData {
  // 计算显示的页码
  const pageNumbers = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    const max = maxButtons

    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }

    const half = Math.floor(max / 2)
    let start = current - half
    let end = current + half

    if (start < 1) {
      start = 1
      end = max
    }

    if (end > total) {
      end = total
      start = total - max + 1
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })

  const hasPrev = computed(() => currentPage.value > 1)
  const hasNext = computed(() => currentPage.value < totalPages.value)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      onPageChange(page)
    }
  }

  const goToPrev = () => {
    if (hasPrev.value) {
      goToPage(currentPage.value - 1)
    }
  }

  const goToNext = () => {
    if (hasNext.value) {
      goToPage(currentPage.value + 1)
    }
  }

  return {
    currentPage: currentPage.value,
    totalPages: totalPages.value,
    pageNumbers: pageNumbers.value,
    hasPrev: hasPrev.value,
    hasNext: hasNext.value,
    goToPage,
    goToPrev,
    goToNext
  }
}

