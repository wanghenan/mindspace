import { chromium } from 'playwright';

(async () => {
  console.log('🧪 Testing Settings Page...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 监听控制台消息
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });

  try {
    // 1. 访问设置页面
    console.log('\n1. 访问设置页面...');
    await page.goto('http://localhost:3001/settings', { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✅ 页面加载成功');

    // 2. 检查页面标题
    const title = await page.title();
    console.log(`📄 页面标题: ${title}`);

    // 3. 检查提供商卡片
    console.log('\n2. 检查提供商卡片...');
    const cards = await page.$$('.provider-card, [class*="provider"]');
    console.log(`找到 ${cards.length} 个提供商卡片`);

    if (cards.length > 0) {
      console.log('✅ 提供商卡片已渲染');

      // 4. 点击第一个卡片
      console.log('\n3. 测试提供商选择...');
      await cards[0].click();
      await page.waitForTimeout(500);

      const isSelected = await cards[0].evaluate(el => el.classList.contains('selected'));
      console.log(isSelected ? '✅ 提供商选择功能正常' : '⚠️ 选择状态未更新');
    }

    // 5. 检查 API 密钥输入框
    console.log('\n4. 检查 API 密钥输入框...');
    const apiKeyInput = await page.$('input[type="password"], input[name*="key"]');
    if (apiKeyInput) {
      console.log('✅ API 密钥输入框存在');
    } else {
      console.log('⚠️ 未找到 API 密钥输入框');
    }

    // 6. 检查模型选择器
    console.log('\n5. 检查模型选择器...');
    const modelSelector = await page.$('[class*="model"], .model-selector');
    if (modelSelector) {
      console.log('✅ 模型选择器存在');
    }

    console.log('\n🎉 测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
  }
})();
