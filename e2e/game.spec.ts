import { test, expect } from '@playwright/test';

test.describe('Void Runner Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the game', async ({ page }) => {
    // Check if the boot screen appears
    await expect(page.locator('text=VOID_RUNNER')).toBeVisible({ timeout: 10000 });
  });

  test('should show terminal after boot', async ({ page }) => {
    // Wait for boot sequence to complete
    await page.waitForTimeout(5000);
    // Check if terminal is visible
    await expect(page.locator('.terminal')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    // Wait for boot sequence
    await page.waitForTimeout(5000);
    // Click on missions tab
    await page.click('text=Missions');
    await expect(page.locator('.missions')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    // Check if game loads properly
    await expect(page.locator('text=VOID_RUNNER')).toBeVisible({ timeout: 10000 });
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Monitor console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(5000);
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('analytics') &&
      !e.includes('third-party')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(5000);
    
    // Check for skip link
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible();
    
    // Check for main landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('text=VOID_RUNNER', { timeout: 10000 });
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });
});
