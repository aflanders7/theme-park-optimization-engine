const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const outputPath = path.join(__dirname, '..', 'output', 'hotel_rooms_missing.json');

const hotelUrls = [
    { name: "port-orleans-french-quarter", url: "https://www.mousesavers.com/2026-port-orleans-french-quarter-room-rates-season-dates/", type: "resort" },
    { name: "coronado-springs", url: "https://www.mousesavers.com/2026-coronado-springs-room-rates-season-dates/", type: "resort" },
    { name: "pop-century", url: "https://www.mousesavers.com/2026-pop-century-room-rates-season-dates/", type: "resort" },
    { name: "port-orleans-riverside", url: "https://www.mousesavers.com/2026-port-orleans-riverside-room-rates-season-dates/", type: "resort" },
    { name: "all-star-movies", url: "https://www.mousesavers.com/2026-all-star-movies-room-rates-season-dates/", type: "resort" },
    { name: "all-star-music", url: "https://www.mousesavers.com/2026-all-star-music-room-rates-season-dates/", type: "resort" },
    { name: "yacht-club", url: "https://www.mousesavers.com/2026-yacht-club-room-rates-season-dates/", type: "resort" },
    { name: "contemporary-resort", url: "https://www.mousesavers.com/2026-contemporary-room-rates-season-dates/", type: "resort" },
    { name: "campsites-fort-wilderness", url: "https://www.mousesavers.com/2026-fort-wilderness-campsites-rates-season-dates/", type: "campsites" },
    { name: "caribbean-beach", url: "https://www.mousesavers.com/2026-caribbean-beach-room-rates-season-dates/", type: "resort" },
    { name: "all-star-sports", url: "https://www.mousesavers.com/2026-all-star-sports-room-rates-season-dates/", type: "resort" }
];

// Map hotel → missing rooms
const missingRooms = {
    "pop-century": ["Preferred Room"],
    "all-star-movies": ["Preferred Room"],
    "all-star-music": ["Preferred Room"],
    "all-star-sports": ["Preferred Room"],
    "caribbean-beach": ["Standard Location", "Preferred Location"], // replacing Standard View, Preferred Room
    "contemporary-resort": [
        "Garden Wing – 1 Bedroom Suite Access",
        "Garden Wing -1 Bedroom Hospitality Ste Access"
    ]
};

function expandDateRange(range) {
    const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const [start, end] = range.includes('-') ? range.split('-') : [range, range];
    const parseDate = d => { const [month, day] = d.trim().split(' '); return { month: months[month], day: parseInt(day) }; };
    const s = parseDate(start);
    const e = parseDate(end);
    const dates = [];
    const year = new Date().getFullYear();
    let current = new Date(year, s.month, s.day);
    const endDate = new Date(year, e.month, e.day);
    while (current <= endDate) { dates.push(new Date(current)); current.setDate(current.getDate() + 1); }
    return dates;
}

function getPriceIndex(date) {
    const weekday = date.getDay();
    if ([1, 2, 3].includes(weekday)) return 0;
    if ([0, 4].includes(weekday)) return 1;
    if ([5, 6].includes(weekday)) return 2;
    return 0;
}

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36');

    const hotelData = {};

    for (let hotel of hotelUrls) {
        console.log(`Scraping ${hotel.name}...`);
        await page.goto(hotel.url, { waitUntil: 'networkidle0', timeout: 0 });

        const tablesData = await page.evaluate((hotelMissingRooms) => {
            const tables = Array.from(document.querySelectorAll('table'));
            const allData = [];

            tables.forEach(table => {
                const headers = Array.from(table.querySelectorAll('tr:first-child th, tr:first-child td'))
                    .slice(2)
                    .map(h => h.innerText.trim())
                    .filter(h => Array.isArray(hotelMissingRooms) ? hotelMissingRooms.includes(h) : true);

                const rows = Array.from(table.querySelectorAll('tr')).slice(1);
                rows.forEach(row => {
                    const cells = Array.from(row.querySelectorAll('td'));
                    const dateRange = cells[0].innerText.trim();
                    const prices = cells.slice(2)
                        .map(td => td.innerText.trim().split('·').map(p => parseInt(p.replace(/\$|,/g, ''))));
                    allData.push({ dateRange, prices, headers });
                });
            });
            return allData;
        }, missingRooms[hotel.name] || []);

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
    console.log(`✅ Scraping complete! Missing rooms data saved to ${outputPath}`);
})();
