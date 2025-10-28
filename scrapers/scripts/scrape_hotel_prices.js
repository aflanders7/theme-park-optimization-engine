const puppeteer = require('puppeteer');
const fs = require('fs'); // ← import fs
const path = require('path');
const outputPath = path.join(__dirname, '..', 'output', 'hotel_room_prices.json');

const hotelUrls = [
  { name: "bay-lake-tower", url: "https://c.touringplans.com/walt-disney-world/hotels/bay-lake-tower-at-disneys-contemporary-resort/rates/2025", type: "resort" },
  { name: "animal-kingdom-lodge", url: "https://c.touringplans.com/walt-disney-world/hotels/disneys-animal-kingdom-lodge/rates/2025", type: "resort" },
  { name: "Wilderness Lodge", url: "https://touringplans.com/walt-disney-world/hotels/disneys-wilderness-lodge/rates/2025", type: "resort" },
  { name: "boulder-ridge-villas", url: "https://touringplans.com/walt-disney-world/hotels/disneys-wilderness-lodge-villas/rates/2025", type: "villas" },
  { name: "cabins-fort-wilderness-dvc", url: "https://touringplans.com/walt-disney-world/hotels/fort-wilderness-resort-cabins/rates/2025", type: "cabins" },
  { name: "campsites-fort-wilderness", url: "https://touringplans.com/walt-disney-world/hotels/fort-wilderness-campsites/rates/2025", type: "campsites" },
  { name: "copper-creek-villas", url: "https://touringplans.com/walt-disney-world/hotels/copper-creek-villas/rates/2025", type: "villas" },
  { name: "all-star-movies", url: "https://touringplans.com/walt-disney-world/hotels/disneys-all-star-movies-resort/rates/2025", type: "resort" },
  { name: "all-star-music", url: "https://touringplans.com/walt-disney-world/hotels/disneys-all-star-music-resort/rates/2025", type: "resort" },
  { name: "all-star-sports", url: "https://touringplans.com/walt-disney-world/hotels/disneys-all-star-sports-resort/rates/2025", type: "resort" },
  { name: "animal-kingdom-villas-jambo", url: "https://touringplans.com/walt-disney-world/hotels/animal-kingdom-villas-jambo/rates/2025", type: "villas" },
  { name: "animal-kingdom-villas-kidani", url: "https://touringplans.com/walt-disney-world/hotels/disneys-animal-kingdom-villas/rates/2025", type: "villas" },
  { name: "art-of-animation", url: "https://touringplans.com/walt-disney-world/hotels/disneys-art-of-animation-resort/rates/2025", type: "resort" },
  { name: "beach-club", url: "https://touringplans.com/walt-disney-world/hotels/disneys-beach-club-resort/rates/2025", type: "resort" },
  { name: "beach-club-villas", url: "https://touringplans.com/walt-disney-world/hotels/disneys-beach-club-villas/rates/2025", type: "villas" },
  { name: "boardwalk-inn", url: "https://touringplans.com/walt-disney-world/hotels/disneys-boardwalk-inn/rates/2025", type: "resort" },
  { name: "boardwalk-villas", url: "https://touringplans.com/walt-disney-world/hotels/disneys-boardwalk-villas/rates/2025", type: "villas" },
  { name: "caribbean-beach", url: "https://touringplans.com/walt-disney-world/hotels/disneys-caribbean-beach-resort/rates/2025", type: "resort" },
  { name: "contemporary-resort", url: "https://touringplans.com/walt-disney-world/hotels/disneys-contemporary-resort/rates/2025", type: "resort" },
  { name: "coronado-springs", url: "https://touringplans.com/walt-disney-world/hotels/disneys-coronado-springs-resort/rates/2025", type: "resort" },
  { name: "grand-floridian", url: "https://touringplans.com/walt-disney-world/hotels/disneys-grand-floridian-resort/rates/2025", type: "resort" },
  { name: "old-key-west", url: "https://touringplans.com/walt-disney-world/hotels/disneys-old-key-west-resort/rates/2025", type: "resort" },
  { name: "polynesian-village", url: "https://touringplans.com/walt-disney-world/hotels/disneys-polynesian-resort/rates/2025", type: "resort" },
  { name: "polynesian-villas", url: "https://touringplans.com/walt-disney-world/hotels/disneys-polynesian-villas-bungalows/rates/2025", type: "villas" },
  { name: "pop-century", url: "https://touringplans.com/walt-disney-world/hotels/disneys-pop-century-resort/rates/2025", type: "resort" },
  { name: "port-orleans-french-quarter", url: "https://touringplans.com/walt-disney-world/hotels/disneys-port-orleans-resort-french-quarter/rates/2025", type: "resort" },
  { name: "port-orleans-riverside", url: "https://touringplans.com/walt-disney-world/hotels/disneys-port-orleans-resort-riverside/rates/2025", type: "resort" },
  { name: "riviera-resort", url: "https://touringplans.com/walt-disney-world/hotels/disneys-riviera-resort/rates/2025", type: "resort" },
  { name: "saratoga-springs", url: "https://touringplans.com/walt-disney-world/hotels/disneys-saratoga-springs-resort-spa/rates/2025", type: "resort" },
  { name: "wilderness-lodge", url: "https://touringplans.com/walt-disney-world/hotels/disneys-wilderness-lodge/rates/2025", type: "resort" },
  { name: "yacht-club", url: "https://touringplans.com/walt-disney-world/hotels/disneys-yacht-club-resort/rates/2025", type: "resort" },
  { name: "Treehouse Villas", url: "https://touringplans.com/walt-disney-world/hotels/treehouse-villas-at-disneys-saratoga-springs-resort/rates/2025", type: "villas" },
  { name: "villas-grand-floridian", url: "https://touringplans.com/walt-disney-world/hotels/the-villas-at-disneys-grand-floridian-resort-and-spa/rates/2025", type: "villas" }
];


const hotelUrls2 = [
  { name: "bay-lake-tower", url: "https://c.touringplans.com/walt-disney-world/hotels/bay-lake-tower-at-disneys-contemporary-resort/rates/2025", type: "resort" },
  { name: "animal-kingdom-lodge", url: "https://c.touringplans.com/walt-disney-world/hotels/disneys-animal-kingdom-lodge/rates/2025", type: "resort" },
];

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36'
  );

  const hotelData = {};

  for (let hotel of hotelUrls) {
    console.log(`Scraping ${hotel.name}...`);
    await page.goto(hotel.url, { waitUntil: 'networkidle0', timeout: 0 });

    // Evaluate the page to extract the table data
    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      const monthHeaders = {};

      let currentMonthYear = '';
      let roomTypes = [];

      const dailyData = {};

      rows.forEach(row => {
        // If this is a month header row
        if (row.id.match(/^\d{6}$/)) {
          currentMonthYear = row.id.slice(0, 4) + '-' + row.id.slice(4, 6); // "YYYY-MM"
          roomTypes = Array.from(row.querySelectorAll('td.center.small')).map(td => td.innerText.trim());
        } 
        // If this is a regular date row
        else if (row.querySelectorAll('td.center').length > 0) {
          const tds = row.querySelectorAll('td');
          const day = tds[0].innerText.trim();
          const monthDay = day.padStart(2, '0'); // Ensure two digits
          const date = `${currentMonthYear}-${monthDay}`; // YYYY-MM-DD

          dailyData[date] = {};
          tds.forEach((td, index) => {
            if (index >= 2) { // Skip the first two columns (date, weekday)
              const priceText = td.innerText.replace(/\$|,/g, '').trim();
              const price = priceText ? parseInt(priceText) : null;
              dailyData[date][roomTypes[index - 2]] = price;
            }
          });
        }
      });

      return dailyData;
    });

    hotelData[hotel.name] = data;
  }

  await browser.close();

  fs.writeFileSync(outputPath, JSON.stringify(hotelData, null, 2));
  console.log(`Scraping complete! Data saved to ${outputPath}`);
})();