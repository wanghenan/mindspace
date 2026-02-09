import { chromium } from 'playwright';

(async () => {
  console.log('🧪 Testing Sidebar Navigation to Settings...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. 访问首页
    console.log('\n1. 访问首页...');
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✅ 首页加载成功');

    // 2. 检查侧边栏
    console.log('\n2. 检查侧边栏导航...');
    const sidebar = await page.$('aside');
    if (sidebar) {
      console.log('✅ 侧边栏存在');
    }

    // 3. 查找设置按钮
    console.log('\n3. 查找设置按钮...');
    const settingsBtn = await page.$('button[aria-label="AI设置"]');
    if (settingsBtn) {
      console.log('✅ 设置按钮存在 (⚙️)');
      
      // 4. 点击设置按钮
      console.log('\n4. 点击设置按钮...');
      await settingsBtn.click();
      await page.waitForURL('**/settings', { timeout: 5000 });
      console.log('✅ 成功跳转到设置页面');
    } else {
      console.log('❌ 未找到设置按钮');
    }

    // 5. 验证设置页面
    console.log('\n5. 验证设置页面...');
    const pageTitle = await page.title();
    console.log(`📄 页面标题: ${pageTitle}`);
    
    const cards = await page.$$('[class*="provider"]');
    console.log(`📊 提供商卡片数量: ${cards.length}`);

    console.log('\n🎉 侧边栏导航测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
  }
})();
