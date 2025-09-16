const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36'
  );

  await page.goto(
    'https://disneyworld.disney.go.com/dining/disney-springs/jaleo/menus/lunch/',
    { waitUntil: 'networkidle0', timeout: 0 }
  );

  await page.waitForSelector('wdpr-accordion', { timeout: 30000 });

  const menuData = await page.evaluate(() => {
    const sections = [];

    const accordions = document.querySelectorAll('wdpr-accordion');
    accordions.forEach(acc => {
      if (acc.shadowRoot) {
        const accRoot = acc.shadowRoot;
        const category = accRoot.querySelector('#touch-area .label')?.innerText || 'No Category';

        // Grab the items **inside this accordion** (still in light DOM)
        const itemsContainer = acc.querySelector('div.menu-items');
        const items = Array.from(itemsContainer?.querySelectorAll('app-menu-item .menu-item') || []).map(item => ({
          name: item.querySelector('.name')?.innerText || '',
          description: item.querySelector('.description')?.innerText || '',
          price: item.querySelector('.price-value')?.innerText || ''
        }));

        if (items.length) {
          sections.push({ category, items });
        }
      }
    });

    return sections;
  });

  console.log(JSON.stringify(menuData, null, 2));
  await browser.close();
})();
