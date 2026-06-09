import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'home-top.png', fullPage: false });

// scroll to mid-page
await page.evaluate(() => window.scrollTo(0, 1200));
await page.waitForTimeout(300);
await page.screenshot({ path: 'home-mid.png', fullPage: false });

await browser.close();
console.log('done');
