import { chromium } from 'playwright';

(async () => {
  console.log('🧪 Testing with fresh localStorage...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 清除 localStorage
    await page.goto('http://localhost:3000/settings');
    await page.evaluate(() => {
      localStorage.removeItem('mindspace-ai-config');
      localStorage.removeItem('mindspace-selected-provider');
    });

    // 重新加载页面
    await page.reload({ waitUntil: 'networkidle' });

    // 检查状态
    const status = await page.evaluate(() => {
      const spans = document.querySelectorAll('span');
      for (const span of spans) {
        if (span.innerText.includes('已配置') || 
            span.innerText.includes('请配置') || 
            span.innerText.includes('请选择')) {
          return span.innerText;
        }
      }
      return 'not found';
    });

    console.log('Status after clearing cache:', status);

    // 检查提供商选择
    const providerCards = await page.$$('[class*="provider"]');
    console.log('Provider cards found:', providerCards.length);

    // 获取第一个提供商的选中状态
    const firstCardSelected = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="provider"]');
      if (cards.length > 0) {
        return cards[0].getAttribute('aria-pressed') || 'false';
      }
      return 'no cards';
    });

    console.log('First provider selected:', firstCardSelected);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
