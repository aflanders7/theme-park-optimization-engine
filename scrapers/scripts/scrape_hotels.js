const puppeteer = require('puppeteer');
const fs = require('fs'); // ← import fs
const path = require('path');
const outputPath = path.join(__dirname, '..', 'output', 'hotel_rooms.json');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36'
  );

  await page.goto(
    'https://disneyworld.disney.go.com/resorts/dvc-cabins-at-fort-wilderness-resort/rates-rooms/',
    { waitUntil: 'networkidle0', timeout: 0 }
  );

  await page.waitForSelector('.room-details', { timeout: 60000 });

  const rooms = await page.evaluate(() => {
    function parseBeds(bedStr) {
      if (!bedStr || bedStr === 'Unknown') return [];
      return bedStr.split(' and ').map(part => {
        const match = part.match(/(\d+)\s(.+)/);
        if (match) {
          return { count: parseInt(match[1]), type: match[2].trim() };
        }
        return { count: 1, type: part.trim() };
      });
    }

    function parseOccupancy(occStr) {
      if (!occStr || occStr === 'Unknown') return { adults: 0, children: 0, total: 0 };
      const adultsMatch = occStr.match(/(\d+)\sAdults/);
      const childrenMatch = occStr.match(/(\d+)\sChildren/);
      const adults = adultsMatch ? parseInt(adultsMatch[1]) : 0;
      const children = childrenMatch ? parseInt(childrenMatch[1]) : 0;
      return { adults, children, total: adults + children };
    }

    const data = [];

    document.querySelectorAll('.room-details').forEach(room => {
      const name = room.querySelector('.room-details-title')?.innerText?.trim() || 'Unknown';
      const resort = room.querySelector('.resort-name p')?.innerText?.replace('at ', '').trim() || 'Unknown';
      const description = room.querySelector('#cardDescription')?.innerText?.trim() || 'Unknown';
      const bedsRaw = room.querySelector('#cardBedTypes')?.innerText?.trim() || 'Unknown';
      const occupancyRaw = room.querySelector('#cardOccupancyIcon')?.innerText?.replace('Sleeps up to', '').trim() || 'Unknown';
      const features = Array.from(room.querySelectorAll('.features-checkmark li')).map(li => li.innerText.trim());

      data.push({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        resort,
        description,
        beds: parseBeds(bedsRaw),
        occupancy: parseOccupancy(occupancyRaw),
        features,
      });
    });

    return data;
  });

  // Write the rooms data to a JSON file
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(rooms, null, 2), 'utf-8');
  console.log(`Rooms data saved to ${outputPath}`);

  await browser.close();
})();

