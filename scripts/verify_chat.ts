import { chromium } from '@playwright/test';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to /chat...');

  try {
    const response = await page.goto('http://localhost:3000/chat', { timeout: 60000 });
    console.log(`Initial navigation status: ${response?.status()}`);
    console.log(`Final URL: ${page.url()}`);

    if (page.url().includes('login')) {
      console.log('Redirected to login. Attempting guest access if available or verifying redirect loop.');
    }

    try {
      await page.waitForSelector('textarea', { timeout: 30000 });
      console.log('Found textarea. Chat interface seems loaded.');
    } catch (e) {
      console.log(`Could not find textarea: ${e}`);
      const content = await page.content();
      console.log('Page content snippet:', content.substring(0, 500));
    }

    const header = await page.$('header');
    if (header) {
      console.log('Found header.');
    }

    await page.screenshot({ path: 'chat_page.png' });
    console.log('Screenshot saved to chat_page.png');

  } catch (e) {
    console.error(`Error: ${e}`);
  }

  await browser.close();
}

run();
