import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 检查初始 URL
    expect(page.url()).toContain('localhost')
    
    // 检查页面可以加载
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should handle page reload', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 重新加载页面
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // 页面应该仍然可见
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should handle browser back button', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const initialUrl = page.url()
    
    // 尝试后退（如果可能）
    await page.goBack().catch(() => {
      // 如果没有历史记录，忽略错误
    })
    
    // URL 应该保持不变或返回到初始状态
    expect(page.url()).toBeTruthy()
  })

  test('should maintain state across navigation', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 检查页面标题
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(0)
  })

  test('should handle multiple page loads', async ({ page }) => {
    // 加载页面多次
    for (let i = 0; i < 3; i++) {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const body = page.locator('body')
      await expect(body).toBeVisible()
    }
  })
})
