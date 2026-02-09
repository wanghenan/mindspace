import { chromium } from 'playwright';

(async () => {
  console.log('🧪 Testing AI Settings Navigation...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. 访问首页
    console.log('\n1. 访问首页...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✅ 首页加载成功');

    // 2. 检查侧边栏
    console.log('\n2. 查找侧边栏...');
    const sidebar = await page.$('aside');
    if (sidebar) {
      console.log('✅ 侧边栏存在');
    }

    // 3. 查找设置链接
    console.log('\n3. 查找 AI设置 链接...');
    const settingsLink = await page.$('a[href="/settings"]');
    
    if (settingsLink) {
      console.log('✅ AI设置 链接存在');
      
      // 4. 点击跳转
      console.log('\n4. 点击 AI设置...');
      await settingsLink.click();
      await page.waitForTimeout(2000);
      
      const currentURL = page.url();
      console.log(`📍 跳转后 URL: ${currentURL}`);
      
      if (currentURL.includes('/settings')) {
        console.log('✅ 成功跳转到设置页面');
        
        // 5. 验证设置页面内容
        console.log('\n5. 验证设置页面...');
        const pageContent = await page.content();
        
        if (pageContent.includes('提供商') || pageContent.includes('Provider')) {
          console.log('✅ 设置页面内容正确');
        }
        
        console.log('\n🎉 测试完全成功！');
      } else {
        console.log(`⚠️ 跳转失败，URL: ${currentURL}`);
      }
    } else {
      console.log('❌ 未找到 AI设置 链接');
      // 打印侧边栏中的所有链接
      const allLinks = await page.$$('aside a');
      console.log(`侧边栏共有 ${allLinks.length} 个链接`);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
  }
})();
