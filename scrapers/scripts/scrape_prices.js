const puppeteer = require('puppeteer');
const fs = require('fs'); // ← import fs
const path = require('path');
const outputPath = path.join(__dirname, '..', 'output', 'hotel_rewrite.json');

const hotelUrls2 = [
  { name: "bay-lake-tower", url: "https://www.mousesavers.com/2026-bay-lake-tower-room-rates-season-dates/", type: "resort" },
  { name: "animal-kingdom-lodge", url: "https://www.mousesavers.com/2026-animal-kingdom-lodge-room-rates-season-dates/", type: "resort" },
  { name: "wilderness-lodge", url: "https://www.mousesavers.com/2026-wilderness-lodge-room-rates-season-dates/", type: "resort" },
  { name: "boulder-ridge-villas", url: "https://www.mousesavers.com/2026-boulder-ridge-villas-at-wilderness-lodge-room-rates-season-dates/", type: "villas" },
  { name: "cabins-fort-wilderness-dvc", url: "https://www.mousesavers.com/2026-fort-wilderness-cabins-rates-season-dates/", type: "cabins" },
  { name: "campsites-fort-wilderness", url: "https://www.mousesavers.com/2026-fort-wilderness-campsites-rates-season-dates/", type: "campsites" },
  { name: "copper-creek-villas", url: "https://www.mousesavers.com/2026-copper-creek-villas-cabins-wilderness-lodge-room-rates-season-dates/", type: "villas" },
  { name: "all-star-movies", url: "https://www.mousesavers.com/2026-all-star-movies-room-rates-season-dates/", type: "resort" },
  { name: "all-star-music", url: "https://www.mousesavers.com/2026-all-star-music-room-rates-season-dates/", type: "resort" },
  { name: "all-star-sports", url: "https://www.mousesavers.com/2026-all-star-sports-room-rates-season-dates/", type: "resort" },
  { name: "animal-kingdom-villas-jambo", url: "https://www.mousesavers.com/2026-animal-kingdom-villas-jambo-house-room-rates-season-dates/", type: "villas" },
  { name: "animal-kingdom-villas-kidani", url: "https://www.mousesavers.com/2026-animal-kingdom-villas-kidani-village-room-rates-season-dates/", type: "villas" },
  { name: "art-of-animation", url: "https://www.mousesavers.com/2026-art-of-animation-room-rates-season-dates/", type: "resort" },
  { name: "beach-club", url: "https://www.mousesavers.com/2026-beach-club-room-rates-season-dates/", type: "resort" },
  { name: "beach-club-villas", url: "https://www.mousesavers.com/2026-beach-club-villas-room-rates-season-dates/", type: "villas" },
  { name: "boardwalk-inn", url: "https://www.mousesavers.com/2026-boardwalk-inn-room-rates-season-dates/", type: "resort" },
  { name: "boardwalk-villas", url: "https://www.mousesavers.com/2026-boardwalk-villas-room-rates-season-dates/", type: "villas" },
  { name: "caribbean-beach", url: "https://www.mousesavers.com/2026-caribbean-beach-room-rates-season-dates/", type: "resort" },
  { name: "contemporary-resort", url: "https://www.mousesavers.com/2026-contemporary-room-rates-season-dates/", type: "resort" },
  { name: "coronado-springs", url: "https://www.mousesavers.com/2026-coronado-springs-room-rates-season-dates/", type: "resort" },
  { name: "grand-floridian", url: "https://www.mousesavers.com/2026-grand-floridian-room-rates-season-dates/", type: "resort" },
  { name: "villas-grand-floridian", url: "https://www.mousesavers.com/2026-villas-at-grand-floridian-room-rates-season-dates/", type: "villas" },
  { name: "old-key-west", url: "https://www.mousesavers.com/2026-old-key-west-room-rates-season-dates/", type: "resort" },
  { name: "polynesian-village", url: "https://www.mousesavers.com/2026-polynesian-village-room-rates-season-dates/", type: "resort" },
  { name: "polynesian-villas", url: "https://www.mousesavers.com/2026-polynesian-villas-bungalows-room-rates-season-dates/", type: "villas" },
  { name: "pop-century", url: "https://www.mousesavers.com/2026-pop-century-room-rates-season-dates/", type: "resort" },
  { name: "port-orleans-french-quarter", url: "https://www.mousesavers.com/2026-port-orleans-french-quarter-room-rates-season-dates/", type: "resort" },
  { name: "port-orleans-riverside", url: "https://www.mousesavers.com/2026-port-orleans-riverside-room-rates-season-dates/", type: "resort" },
  { name: "riviera-resort", url: "https://www.mousesavers.com/2026-riviera-resort-room-rates-season-dates/", type: "resort" },
  { name: "saratoga-springs", url: "https://www.mousesavers.com/2026-saratoga-springs-room-rates-season-dates/", type: "resort" },
  //{ name: "treehouse-villas", url: "https://www.mousesavers.com/2026-treehouse-villas-room-rates-season-dates/", type: "villas" },
  { name: "yacht-club", url: "https://www.mousesavers.com/2026-yacht-club-room-rates-season-dates/", type: "resort" }
];

const hotelUrls = [
    { name: "all-star-movies", url: "https://www.mousesavers.com/2026-all-star-movies-room-rates-season-dates/", type: "resort" },
  { name: "all-star-music", url: "https://www.mousesavers.com/2026-all-star-music-room-rates-season-dates/", type: "resort" },
  { name: "all-star-sports", url: "https://www.mousesavers.com/2026-all-star-sports-room-rates-season-dates/", type: "resort" },
    { name: "pop-century", url: "https://www.mousesavers.com/2026-pop-century-room-rates-season-dates/", type: "resort" },
      { name: "caribbean-beach", url: "https://www.mousesavers.com/2026-caribbean-beach-room-rates-season-dates/", type: "resort" },
  { name: "contemporary-resort", url: "https://www.mousesavers.com/2026-contemporary-room-rates-season-dates/", type: "resort" },
];


function expandDateRange(range) {
  const months = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };

  const [start, end] = range.includes('-') ? range.split('-') : [range, range];
  const parseDate = d => {
    const [month, day] = d.trim().split(' ');
    return { month: months[month], day: parseInt(day) };
  };

  const s = parseDate(start);
  const e = parseDate(end);

  const dates = [];
  const year = new Date().getFullYear(); // adjust if needed
  let current = new Date(year, s.month, s.day);
  const endDate = new Date(year, e.month, e.day);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// Map weekdays to price index in the three-price array
function getPriceIndex(date) {
  const weekday = date.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  if ([1, 2, 3].includes(weekday)) return 0; // Mon-Wed
  if ([0, 4].includes(weekday)) return 1; // Sun & Thu
  if ([5, 6].includes(weekday)) return 2; // Fri & Sat
  return 0; // fallback
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36'
  );

  const hotelData = {};

  for (let hotel of hotelUrls) {
    console.log(`Scraping ${hotel.name}...`);
    await page.goto(hotel.url, { waitUntil: 'networkidle0', timeout: 0 });

    const tablesData = await page.evaluate(() => {
      const tables = Array.from(document.querySelectorAll('table'));
      const allData = [];

      tables.forEach(table => {
        const headers = Array.from(table.querySelectorAll('tr:first-child th, tr:first-child td'))
          .slice(2) // skip date and season columns
          .map(h => h.innerText.trim());

        const rows = Array.from(table.querySelectorAll('tr')).slice(1);
        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          const dateRange = cells[0].innerText.trim();
          const prices = cells.slice(2).map(td =>
            td.innerText.trim().split('·').map(p => parseInt(p.replace(/\$|,/g, '').trim()))
          );
          allData.push({ dateRange, prices, headers });
        });
      });

      return allData;
    });

    // Merge all tables into single dailyData per hotel
    const dailyData = {};
    for (let row of tablesData) {
      const dates = expandDateRange(row.dateRange);
      dates.forEach(dateObj => {
        const dateStr = `${dateObj.getFullYear()}-${dateObj.toLocaleString('en-US', { month: 'short' })}-${dateObj.getDate()}`;
        if (!dailyData[dateStr]) dailyData[dateStr] = {};

        row.headers.forEach((header, idx) => {
          const priceArray = row.prices[idx];
          const priceIdx = getPriceIndex(dateObj);
          dailyData[dateStr][header] = priceArray[Math.min(priceIdx, priceArray.length - 1)];
        });
      });
    }

    hotelData[hotel.name] = dailyData;
  }

  await browser.close();
  fs.writeFileSync(outputPath, JSON.stringify(hotelData, null, 2));
  console.log(`Scraping complete! Data saved to ${outputPath}`);
})();
