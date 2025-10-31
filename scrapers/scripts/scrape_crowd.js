const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const parks = {
  epcot: '5',
  magic_kingdom: '6',
  hollywood_studios: '7',
  animal_kingdom: '8',
};

// Set the output path
const outputPath = path.join(__dirname, '..', 'output', 'disney_crowd_2025.json');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36'
  );

  const results = [];

  for (const [parkName, parkId] of Object.entries(parks)) {
    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, '0');
      const url = `https://queue-times.com/en-US/parks/${parkId}/calendar/2025/${monthStr}`;
      console.log(`Scraping ${parkName} ${monthStr}/2025...`);

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });
      await page.waitForSelector('a.tile', { timeout: 30000 });

      const monthData = await page.evaluate((parkName) => {
        const data = [];
        const tiles = document.querySelectorAll('a.tile.is-child.box');

        tiles.forEach(tile => {
          const dateText = tile.querySelector('.tags.is-pulled-left .tag')?.innerText?.trim();
          const crowdText = tile.querySelector('.tags.is-pulled-right .tag')?.innerText?.trim();

          if (dateText && crowdText) {
            // Extract YYYY-MM-DD from href
            const href = tile.getAttribute('href'); // e.g., /en-US/parks/5/calendar/2025/01/02
            const dateMatch = href.match(/\/(\d{4})\/(\d{2})\/(\d{2})$/);
            let dateStr = null;
            if (dateMatch) {
              dateStr = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
            }

            // Convert "97%" -> 9.7
            const crowdPercent = parseFloat(crowdText.replace('%', '')) / 10;

            if (dateStr && !isNaN(crowdPercent)) {
              data.push({
                park: parkName,
                date: dateStr,
                crowd: crowdPercent,
              });
            }
          }
        });

        return data;
      }, parkName);
      console.log(monthData);
      results.push(...monthData);
    }
  }

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Crowd data saved to ${outputPath}`);

  await browser.close();
})();
