import { test, expect } from '@playwright/test';

test.describe('Settings Page - AI Provider Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('Scenario 1: Render all 8 provider cards with correct layout', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'AI 设置' })).toBeVisible();

    const providerNames = [
      'OpenAI',
      'Zhipu AI',
      'Grok',
      'Google Gemini',
      'DeepSeek',
      'MiniMax',
      'Alibaba DashScope',
      'Tencent Hunyuan'
    ];

    for (const provider of providerNames) {
      await expect(page.getByRole('radio', { name: provider })).toBeVisible();
    }

    const providerCards = page.locator('[data-provider]');
    await expect(providerCards).toHaveCount(8);
  });

  test('Scenario 2: Select provider and verify visual feedback', async ({ page }) => {
    const openaiCard = page.locator('[data-provider="openai"]');

    await expect(openaiCard).toBeVisible();

    await openaiCard.click();

    await expect(openaiCard).toHaveAttribute('aria-checked', 'true');

    await expect(openaiCard).toHaveCSS('border-color', /rgb\(.+\)/);

    const selectedCard = page.locator('[data-provider="openai"].selected');
    await expect(selectedCard).toHaveCount(1);
  });

  test('Scenario 3: Keyboard navigation works for all provider cards', async ({ page }) => {
    const firstCard = page.locator('[data-provider="openai"]');
    await firstCard.click();
    await expect(firstCard).toHaveAttribute('aria-checked', 'true');

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    const secondCard = page.locator('[data-provider="zhipu"]');
    await expect(secondCard).toHaveAttribute('aria-checked', 'true');

    await firstCard.click();
    await expect(firstCard).toHaveAttribute('aria-checked', 'true');

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    const thirdCard = page.locator('[data-provider="zhipu"]');
    await expect(thirdCard).toHaveAttribute('aria-checked', 'true');

    await page.keyboard.press('Home');
    await page.waitForTimeout(500);
    await expect(firstCard).toHaveAttribute('aria-checked', 'true');

    const lastCard = page.locator('[data-provider="hunyuan"]');
    await page.keyboard.press('End');
    await page.waitForTimeout(500);
    await expect(lastCard).toHaveAttribute('aria-checked', 'true');

    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);
    const secondToLastCard = page.locator('[data-provider="alibaba"]');
    await expect(secondToLastCard).toHaveAttribute('aria-checked', 'true');
  });
});
