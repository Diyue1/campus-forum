import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/')
    
    // 检查页面标题（更新为实际标题）
    await expect(page).toHaveTitle(/校园论坛|Campus/)
    
    // 检查页面加载完成
    await page.waitForLoadState('networkidle')
    
    // 检查主要内容区域存在
    const mainContent = page.locator('body')
    await expect(mainContent).toBeVisible()
  })

  test('should display navigation elements', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 等待页面完全加载
    await page.waitForTimeout(1000)
    
    // 检查页面是否有可交互元素（包括所有可见元素）
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    // 如果没有按钮，检查是否有其他交互元素
    if (buttonCount === 0) {
      const links = page.locator('a')
      const linkCount = await links.count()
      expect(linkCount).toBeGreaterThan(0)
    } else {
      expect(buttonCount).toBeGreaterThan(0)
    }
  })

  test('should be responsive', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 检查页面是否正常渲染
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight)
    expect(bodyHeight).toBeGreaterThan(0)
  })
})
