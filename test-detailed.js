import { chromium } from 'playwright';

(async () => {
  console.log('🔍 Detailed debugging...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 访问设置页面
    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle' });

    // 强制清除所有 localStorage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      console.log('Cleared all storage');
    });

    // 重新加载
    await page.reload({ waitUntil: 'networkidle' });

    // 直接在页面中检查 DOM
    const info = await page.evaluate(() => {
      // 获取 "当前配置" 区域的文本
      const allText = document.body.innerText;
      
      // 查找提供商卡片
      const providerSection = document.querySelector('text=选择提供商');
      
      // 查找所有提供商名称
      const providers = [];
      const cards = document.querySelectorAll('[class*="provider"]');
      cards.forEach((card, i) => {
        providers.push({
          index: i,
          text: card.innerText.substring(0, 30),
          selected: card.getAttribute('aria-pressed') || card.classList.contains('bg-primary') || 'unknown'
        });
      });

      return {
        allText: allText.substring(0, 500),
        providerCount: providers.length,
        providers: providers
      };
    });

    console.log('Page info:');
    console.log(JSON.stringify(info, null, 2));

    // 检查第一个提供商是否被选中
    if (info.providers.length > 0) {
      console.log('\nFirst provider:', info.providers[0]);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
