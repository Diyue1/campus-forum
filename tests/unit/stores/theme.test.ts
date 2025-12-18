import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '../../../src/stores/theme'

describe('Theme Store', () => {
  let themeStore: ReturnType<typeof useThemeStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    themeStore = useThemeStore()
  })

  it('should initialize with dark theme', () => {
    expect(themeStore.isDark).toBe(true)
  })

  it('should toggle theme from dark to light', () => {
    expect(themeStore.isDark).toBe(true)
    
    themeStore.toggleTheme()
    expect(themeStore.isDark).toBe(false)
  })

  it('should toggle theme from light to dark', () => {
    themeStore.isDark = false
    expect(themeStore.isDark).toBe(false)
    
    themeStore.toggleTheme()
    expect(themeStore.isDark).toBe(true)
  })

  it('should persist theme state across store instances', () => {
    const store1 = useThemeStore()
    store1.isDark = false
    
    const store2 = useThemeStore()
    expect(store2.isDark).toBe(false)
  })
})
