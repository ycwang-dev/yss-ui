const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded' });
  // wait 2 seconds for styles
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'hero_glass.png' });
  await browser.close();
})();
