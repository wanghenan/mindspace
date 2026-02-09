import { chromium } from 'playwright';

(async () => {
  console.log('Testing configuration display...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle', timeout: 10000 });
    console.log('Page loaded');

    // Check for configuration status
    const content = await page.content();
    
    if (content.includes('当前配置')) {
      console.log('Configuration status section found');
    } else {
      console.log('Configuration status NOT found');
    }
    
    // Check for provider cards
    const cards = await page.$$('[class*="provider"]');
    console.log(`Provider cards: ${cards.length}`);
    
    console.log('Test complete');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
