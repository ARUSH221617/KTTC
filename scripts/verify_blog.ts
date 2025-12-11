import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. Visit Blog List Page
    await page.goto('http://localhost:3000/blog', { waitUntil: 'networkidle' });
    console.log('Visited /blog');

    // Take screenshot of list page
    await page.screenshot({ path: 'verification/blog_list.png', fullPage: true });

    // 2. Click on a post
    // Assuming there is at least one post from seeding
    const postLink = page.locator('article h3 a').first();
    if (await postLink.count() > 0) {
        const title = await postLink.innerText();
        console.log(`Clicking post: ${title}`);
        await Promise.all([
            page.waitForURL(/\/blog\/.+/),
            postLink.click()
        ]);

        // 3. Verify Detail Page
        await page.waitForSelector('h1');
        // Check for Key Takeaways
        const keyTakeaways = page.locator('text=Key Takeaways');
        if (await keyTakeaways.isVisible()) {
            console.log('Key Takeaways section found');
        } else {
            console.log('Key Takeaways section NOT found');
        }

        // Take screenshot of detail page
        await page.screenshot({ path: 'verification/blog_detail.png', fullPage: true });

        // 4. Verify Breadcrumbs
        const breadcrumb = page.locator('nav[aria-label="breadcrumb"]');
        if (await breadcrumb.isVisible()) {
             console.log('Breadcrumbs found');
        }
    } else {
        console.log('No posts found to click');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

main();
