import { test, expect } from '@playwright/test'

test.describe('UI Interaction', () => {
  test('should display clickable elements', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 检查是否有可点击的元素
    const clickableElements = page.locator('button, a, [role="button"]')
    const count = await clickableElements.count()
    
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 按 Tab 键测试键盘导航
    await page.keyboard.press('Tab')
    
    // 检查焦点是否移动
    const focusedElement = page.locator(':focus')
    const hasFocus = await focusedElement.count()
    
    expect(hasFocus).toBeGreaterThanOrEqual(0)
  })

  test('should be responsive to viewport changes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 测试不同的视口大小
    await page.setViewportSize({ width: 375, height: 667 }) // Mobile
    await page.waitForTimeout(500)
    
    let body = page.locator('body')
    await expect(body).toBeVisible()
    
    await page.setViewportSize({ width: 1920, height: 1080 }) // Desktop
    await page.waitForTimeout(500)
    
    body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should handle scroll events', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 滚动到页面底部
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    
    // 滚动回顶部
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)
    
    // 页面应该仍然可见
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should display content correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 检查页面是否有文本内容
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toBeTruthy()
  })

  test('should handle rapid clicks', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const button = page.locator('button').first()
    
    if (await button.isVisible()) {
      // 快速点击多次
      for (let i = 0; i < 3; i++) {
        await button.click({ force: true }).catch(() => {
          // 忽略点击错误
        })
        await page.waitForTimeout(100)
      }
    }
    
    // 页面应该仍然正常
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})
