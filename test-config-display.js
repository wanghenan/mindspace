import { chromium } from 'playwright';

(async () => {
  console.log('🧪 Testing Current Configuration Display...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. 访问设置页面
    console.log('\n1. 访问设置页面...');
    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✅ 页面加载成功');

    // 2. 检查配置状态显示
    console.log('\n2. 检查配置状态显示...');
    
    // 检查"当前配置"标题
    const statusSection = await page.$('text=当前配置');
    if (statusSection) {
      console.log('✅ "当前配置" 区域存在');
      
      // 检查提供商标签
      const providerLabel = await page.$('text=选择提供商');
      if (providerLabel) {
        console.log('✅ 提供商选择区域存在');
      }
      
      // 3. 选择一个提供商测试状态更新
      console.log('\n3. 测试选择提供商...');
      const providerCards = await page.$$('[class*="provider"]');
      console.log(`📊 发现 ${providerCards.length} 个提供商卡片`);
      
      if (providerCards.length > 0) {
        await providerCards[0].click();
        await page.waitForTimeout(1000);
        console.log✅ 点击了第一个提供商');
        
        // 检查是否显示提供商名称
        const pageContent = await page.content();
        if (pageContent.includes('OpenAI') || pageContent.includes('智谱')) {
          console.log('✅ 提供商名称显示正常');
        }
      }
    } else {
      console.log('❌ 未找到"当前配置"区域');
    }

    // 4. 检查状态指示器
    console.log('\n4. 检查状态指示器...');
    const statusIndicators = await page.$$('[class*="rounded-full"]');
    console.log(`📊 发现 ${statusIndicators.length} 个状态指示器`);

    console.log('\n🎉 配置状态显示测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
  }
})();
