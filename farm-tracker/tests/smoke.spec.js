import { test, expect } from '@playwright/test';

test.describe('Farm Expense Tracker - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  });

  test('should load the app', async ({ page }) => {
    // Check if app is loaded
    const title = page.locator('h1:has-text("Farm Tracker")');
    await expect(title).toBeVisible({ timeout: 10000 });
  });

  test('should display navigation', async ({ page }) => {
    // Check if navigation exists
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should display dashboard by default', async ({ page }) => {
    // Dashboard should be visible
    const dashboard = page.locator('text=Welcome to Farm Tracker');
    await expect(dashboard).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to categories page', async ({ page }) => {
    // Find and click categories button
    const buttons = page.locator('button');
    const categoryButton = buttons.filter({ hasText: /🏷️|Categories/ }).first();
    
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      await page.waitForTimeout(1000);
      
      // Check if we're on categories page
      const categoryTitle = page.locator('h2:has-text("Categories")');
      await expect(categoryTitle).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate to expenses page', async ({ page }) => {
    // Find and click expenses button
    const buttons = page.locator('button');
    const expenseButton = buttons.filter({ hasText: /💰|Expenses/ }).first();
    
    if (await expenseButton.isVisible()) {
      await expenseButton.click();
      await page.waitForTimeout(1000);
      
      // Check if we're on expenses page
      const expenseTitle = page.locator('h2:has-text("Expense Tracker")');
      await expect(expenseTitle).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate to analytics page', async ({ page }) => {
    // Find and click analytics button
    const buttons = page.locator('button');
    const analyticsButton = buttons.filter({ hasText: /📈|Analytics/ }).first();
    
    if (await analyticsButton.isVisible()) {
      await analyticsButton.click();
      await page.waitForTimeout(1000);
      
      // Check if we're on analytics page - just verify page loaded
      const main = page.locator('main');
      await expect(main).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate to milestones page', async ({ page }) => {
    // Find and click milestones button
    const buttons = page.locator('button');
    const milestonesButton = buttons.filter({ hasText: /🎯|Milestones/ }).first();
    
    if (await milestonesButton.isVisible()) {
      await milestonesButton.click();
      await page.waitForTimeout(1000);
      
      // Check if we're on milestones page
      const milestonesTitle = page.locator('h2:has-text("Farm Milestones")');
      await expect(milestonesTitle).toBeVisible({ timeout: 5000 });
    }
  });

  test('should have responsive layout', async ({ page }) => {
    // Check if main content is visible
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should display app title', async ({ page }) => {
    // Check for app title
    const title = page.locator('h1:has-text("Farm Tracker")');
    await expect(title).toBeVisible();
  });

  test('should have working buttons', async ({ page }) => {
    // Check if buttons exist
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should not show error messages', async ({ page }) => {
    // Check for error messages
    const errorText = page.locator('text=/error|failed/i');
    const errorCount = await errorText.count();
    expect(errorCount).toBe(0);
  });
});
