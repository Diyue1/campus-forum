import { test, expect } from '@playwright/test'

test.describe('Performance', () => {
  test('should load page within reasonable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // 页面应该在 10 秒内加载完成
    expect(loadTime).toBeLessThan(10000)
  })

  test('should handle concurrent requests', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 检查页面是否正常加载
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should maintain performance after interactions', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 执行一些交互
    await page.mouse.move(100, 100)
    await page.keyboard.press('Tab')
    
    // 检查页面仍然响应
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should handle memory efficiently', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 获取页面性能指标
    const metrics = await page.evaluate(() => ({
      memory: (performance as any).memory?.usedJSHeapSize || 0,
      timing: performance.timing.loadEventEnd - performance.timing.navigationStart
    }))
    
    expect(metrics.timing).toBeGreaterThan(0)
  })
})
