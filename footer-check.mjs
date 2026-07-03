import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.locator('footer').scrollIntoViewIfNeeded();
await page.locator('footer').screenshot({ path: 'C:/Users/Emman/AppData/Local/Temp/claude/z--Documents-nextjs-oss-next/a1cf0f97-5300-4c8d-a70d-73dc0fe85840/scratchpad/footer-logo.png' });
await browser.close();
