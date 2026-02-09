import { chromium } from 'playwright';

(async () => {
  console.log('🔍 Checking localStorage configuration...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 访问设置页面
    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle', timeout: 10000 });

    // 检查 localStorage
    console.log('Checking localStorage...');
    const localStorage = await page.evaluate(() => {
      const data = localStorage.getItem('mindspace-ai-config');
      return data ? JSON.parse(data) : null;
    });

    console.log('\n📦 localStorage data:');
    console.log(JSON.stringify(localStorage, null, 2));

    // 检查选择的提供商
    const selectedProvider = await page.evaluate(() => {
      // 尝试从 store 获取
      return window.localStorage.getItem('mindspace-selected-provider');
    });

    console.log('\n👤 Selected provider:', selectedProvider);

    // 检查各个提供商的密钥
    console.log('\n🔑 API Keys in localStorage:');
    if (localStorage && localStorage.customApiKeys) {
      Object.entries(localStorage.customApiKeys).forEach(([provider, key]) => {
        const maskedKey = key ? key.substring(0, 4) + '...' : '(empty)';
        console.log(`  ${provider}: ${maskedKey}`);
      });
    }

    // 检查页面显示
    console.log('\n📄 Page status indicators:');
    const pageContent = await page.content();
    const hasConfigured = pageContent.includes('已配置 API 密钥');
    const hasPending = pageContent.includes('请配置 API 密钥');
    const hasSelectProvider = pageContent.includes('请选择提供商');

    console.log(`  已配置 API 密钥: ${hasConfigured}`);
    console.log(`  请配置 API 密钥: ${hasPending}`);
    console.log(`  请选择提供商: ${hasSelectProvider}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
