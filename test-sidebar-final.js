import { chromium } from 'playwright';

(async () => {
  console.log('🧪 Testing Sidebar Navigation...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. 访问首页
    console.log('\n1. 访问首页...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✅ 首页加载成功');

    // 2. 检查侧边栏
    console.log('\n2. 检查侧边栏...');
    const sidebar = await page.$('aside');
    if (sidebar) {
      console.log('✅ 侧边栏存在');
    }

    // 3. 查找设置按钮
    console.log('\n3. 查找设置按钮...');
    const settingsBtn = await page.$('button[aria-label="AI设置"]');
    if (settingsBtn) {
      console.log('✅ 设置按钮存在 (⚙️)');
      
      // 4. 点击跳转到设置页面
      console.log('\n4. 点击设置按钮...');
      await settingsBtn.click();
      await page.waitForTimeout(1000);
      
      const currentURL = page.url();
      console.log(`📍 当前页面: ${currentURL}`);
      
      if (currentURL.includes('/settings')) {
        console.log('✅ 成功跳转到设置页面');
        
        // 5. 验证设置页面内容
        console.log('\n5. 验证设置页面...');
        const providerCards = await page.$$('[class*="provider"]');
        console.log(`📊 提供商卡片: ${providerCards.length} 个`);
        
        console.log('\n🎉 导航测试完全成功！');
      } else {
        console.log('⚠️ 跳转未成功');
      }
    } else {
      console.log('❌ 未找到设置按钮');
      // 打印所有按钮
      const allBtns = await page.$$('button');
      console.log(`页面共有 ${allBtns.length} 个按钮`);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
  }
})();
