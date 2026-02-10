import { chromium } from 'playwright';

(async () => {
  console.log('🔍 Debugging provider configuration...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle', timeout: 10000 });

    // 直接在页面中检查 React 状态
    const debugInfo = await page.evaluate(() => {
      // 尝试访问 Zustand store
      // 由于无法直接访问 store，我们检查 DOM 中的文本
      const statusSpan = document.querySelector('span');
      
      return {
        statusSpanText: statusSpan ? statusSpan.innerText : 'not found',
        allText: document.body.innerText.substring(0, 500)
      };
    });

    console.log('Status span text:', debugInfo.statusSpanText);
    console.log('\nPage content preview:');
    console.log(debugInfo.allText.substring(0, 300));

    // 查找所有提供商卡片
    console.log('\nProvider cards found:');
    const cards = await page.$$('[class*="provider"]');
    console.log(`Total: ${cards.length}`);

    // 点击第一个提供商
    if (cards.length > 0) {
      console.log('\nClicking first provider...');
      await cards[0].click();
      await page.waitForTimeout(2000);

      // 再次检查状态
      const updatedInfo = await page.evaluate(() => {
        const spans = document.querySelectorAll('span');
        // 找到包含状态文本的 span
        for (const span of spans) {
          if (span.innerText.includes('已配置') || 
              span.innerText.includes('请配置') || 
              span.innerText.includes('请选择')) {
            return span.innerText;
          }
        }
        return 'not found';
      });

      console.log('Status after click:', updatedInfo);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
