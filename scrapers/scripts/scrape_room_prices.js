const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const TARGET_YEAR = 2027;
const TARGET_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const outputPath = path.join(
    __dirname,
    "..",
    "output",
    `hotel_room_prices_${TARGET_YEAR}.json`
);


/*
|--------------------------------------------------------------------------
| HOTEL LIST
|--------------------------------------------------------------------------
*/

const hotelUrls = [
    {
        name: "bay-lake-tower",
        url: "https://c.touringplans.com/walt-disney-world/hotels/bay-lake-tower-at-disneys-contemporary-resort/rates/YEAR",
        type: "resort"
    },
    {
        name: "animal-kingdom-lodge",
        url: "https://c.touringplans.com/walt-disney-world/hotels/disneys-animal-kingdom-lodge/rates/YEAR",
        type: "resort"
    },
    {
        name: "boulder-ridge-villas",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-wilderness-lodge-villas/rates/YEAR",
        type: "villas"
    },
    {
        name: "cabins-fort-wilderness-dvc",
        url: "https://touringplans.com/walt-disney-world/hotels/fort-wilderness-resort-cabins/rates/YEAR",
        type: "cabins"
    },
    {
        name: "campsites-fort-wilderness",
        url: "https://touringplans.com/walt-disney-world/hotels/fort-wilderness-campsites/rates/YEAR",
        type: "campsites"
    },
    {
        name: "copper-creek-villas",
        url: "https://touringplans.com/walt-disney-world/hotels/copper-creek-villas/rates/YEAR",
        type: "villas"
    },
    {
        name: "all-star-movies",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-all-star-movies-resort/rates/YEAR",
        type: "resort"
    },
    {
        name: "all-star-music",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-all-star-music-resort/rates/YEAR",
        type: "resort"
    },
    {
        name: "all-star-sports",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-all-star-sports-resort/rates/YEAR",
        type: "resort"
    },
    {
        name: "animal-kingdom-villas-jambo",
        url: "https://touringplans.com/walt-disney-world/hotels/animal-kingdom-villas-jambo/rates/YEAR",
        type: "villas"
    },
    {
        name: "animal-kingdom-villas-kidani",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-animal-kingdom-villas/rates/YEAR",
        type: "villas"
    },
    {
        name: "art-of-animation",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-art-of-animation-resort/rates/YEAR",
        type: "resort"
    },
    {
        name: "beach-club",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-beach-club-resort/rates/YEAR",
        type: "resort"
    },
    {
        name: "beach-club-villas",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-beach-club-villas/rates/YEAR",
        type: "villas"
    },
    {
        name: "boardwalk-inn",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-boardwalk-inn/rates/YEAR",
        type: "resort"
    },
    {
        name: "boardwalk-villas",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-boardwalk-villas/rates/YEAR",
        type: "villas"
    },
    {
        name: "caribbean-beach",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-caribbean-beach-resort/rates/YEAR",
        type: "resort"
    },
    {
        name: "contemporary-resort",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-contemporary-resort/rates/YEAR",
        type: "resort"
    },
    {
        name: "coronado-springs",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-coronado-springs-resort/rates/YEAR",
        type: "resort"
    },
    {
        name: "grand-floridian",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-grand-floridian-resort/rates/YEAR",
        type: "resort"
    },
    {
        name: "old-key-west",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-old-key-west-resort/rates/YEAR",
        type: "resort"
    },
    {
        name: "polynesian-village",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-polynesian-resort/rates/YEAR",
        type: "resort"
    },
    {
        name: "polynesian-villas",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-polynesian-villas-bungalows/rates/YEAR",
        type: "villas"
    },
    {
        name: "pop-century",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-pop-century-resort/rates/YEAR",
        type: "resort"
    },
    {
        name: "port-orleans-french-quarter",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-port-orleans-resort-french-quarter/rates/YEAR",
        type: "resort"
    },
    {
        name: "port-orleans-riverside",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-port-orleans-resort-riverside/rates/YEAR",
        type: "resort"
    },
    {
        name: "riviera-resort",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-riviera-resort/rates/YEAR",
        type: "resort"
    },
    {
        name: "saratoga-springs",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-saratoga-springs-resort-spa/rates/YEAR",
        type: "resort"
    },
    {
        name: "wilderness-lodge",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-wilderness-lodge/rates/YEAR",
        type: "resort"
    },
    {
        name: "yacht-club",
        url: "https://touringplans.com/walt-disney-world/hotels/disneys-yacht-club-resort/rates/YEAR",
        type: "resort"
    },
    {
        name: "villas-grand-floridian",
        url: "https://touringplans.com/walt-disney-world/hotels/the-villas-at-disneys-grand-floridian-resort-and-spa/rates/YEAR",
        type: "villas"
    }
];


/*
|--------------------------------------------------------------------------
| MISSING ROOM TYPES
|--------------------------------------------------------------------------
|
| These room types aren't available in the TouringPlans data, so we
| retrieve them from MouseSavers.
|
*/

const missingRooms = {
    "pop-century": [
        "Preferred Room"
    ],

    "all-star-movies": [
        "Preferred Room"
    ],

    "all-star-music": [
        "Preferred Room"
    ],

    "all-star-sports": [
        "Preferred Room"
    ],

    "caribbean-beach": [
        "Standard Location",
        "Preferred Location"
    ],

    "contemporary-resort": [
        "Garden Wing – 1 Bedroom Suite Access",
        "Garden Wing -1 Bedroom Hospitality Ste Access"
    ]
};


/*
|--------------------------------------------------------------------------
| MOUSESAVERS URLS
|--------------------------------------------------------------------------
*/

const mouseSaversUrls = [
    {
        name: "port-orleans-french-quarter",
        url: "https://www.mousesavers.com/YEAR-port-orleans-french-quarter-room-rates-season-dates/"
    },
    {
        name: "coronado-springs",
        url: "https://www.mousesavers.com/YEAR-coronado-springs-room-rates-season-dates/"
    },
    {
        name: "pop-century",
        url: "https://www.mousesavers.com/YEAR-pop-century-room-rates-season-dates/"
    },
    {
        name: "port-orleans-riverside",
        url: "https://www.mousesavers.com/YEAR-port-orleans-riverside-room-rates-season-dates/"
    },
    {
        name: "all-star-movies",
        url: "https://www.mousesavers.com/YEAR-all-star-movies-room-rates-season-dates/"
    },
    {
        name: "all-star-music",
        url: "https://www.mousesavers.com/YEAR-all-star-music-room-rates-season-dates/"
    },
    {
        name: "yacht-club",
        url: "https://www.mousesavers.com/YEAR-yacht-club-room-rates-season-dates/"
    },
    {
        name: "contemporary-resort",
        url: "https://www.mousesavers.com/YEAR-contemporary-room-rates-season-dates/"
    },
    {
        name: "campsites-fort-wilderness",
        url: "https://www.mousesavers.com/YEAR-fort-wilderness-campsites-rates-season-dates/"
    },
    {
        name: "caribbean-beach",
        url: "https://www.mousesavers.com/YEAR-caribbean-beach-room-rates-season-dates/"
    },
    {
        name: "all-star-sports",
        url: "https://www.mousesavers.com/YEAR-all-star-sports-room-rates-season-dates/"
    }
];


/*
|--------------------------------------------------------------------------
| DATE HELPERS
|--------------------------------------------------------------------------
*/

const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
];

const MONTH_MAP = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11
};


/**
 * Determines whether a Date is one of the configured target months/year.
 */
function isTargetDate(date) {
    return (
        date.getFullYear() === TARGET_YEAR &&
        TARGET_MONTHS.includes(date.getMonth() + 1)
    );
}


/**
 * Converts:
 *
 *   2026-12-1
 *
 * into:
 *
 *   2026-12-Dec 1
 */
function formatDateKey(date) {
    const year = date.getFullYear();
    const monthNumber = String(date.getMonth() + 1).padStart(2, "0");
    const monthName = MONTH_NAMES[date.getMonth()];
    const day = date.getDate();

    return `${year}-${monthNumber}-${monthName} ${day}`;
}


/**
 * Expand MouseSavers ranges such as:
 *
 *   "Dec 1"
 *   "Dec 2-Dec 5"
 *
 * into individual Date objects.
 */
function expandDateRange(range) {
    const [startText, endText] = range.includes("-")
        ? range.split("-")
        : [range, range];

    function parseDate(text) {
        const [monthName, dayText] = text.trim().split(/\s+/);

        return {
            month: MONTH_MAP[monthName],
            day: parseInt(dayText, 10)
        };
    }

    const start = parseDate(startText);
    const end = parseDate(endText);

    let startYear = TARGET_YEAR;
    let endYear = TARGET_YEAR;

    // Handle ranges that cross New Year's.
    if (end.month < start.month) {
        endYear++;
    }

    const current = new Date(
        startYear,
        start.month,
        start.day
    );

    const endDate = new Date(
        endYear,
        end.month,
        end.day
    );

    const dates = [];

    while (current <= endDate) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}


/*
|--------------------------------------------------------------------------
| TOURINGPLANS PRICE INDEX
|--------------------------------------------------------------------------
|
| TouringPlans provides three prices:
|
| Monday-Wednesday
| Sunday/Thursday
| Friday/Saturday
|
*/

function getPriceIndex(date) {
    const weekday = date.getDay();

    if ([1, 2, 3].includes(weekday)) {
        return 0;
    }

    if ([0, 4].includes(weekday)) {
        return 1;
    }

    if ([5, 6].includes(weekday)) {
        return 2;
    }

    return 0;
}


/*
|--------------------------------------------------------------------------
| SCRAPE TOURINGPLANS
|--------------------------------------------------------------------------
*/

async function scrapeTouringPlans(page) {
    const hotelData = {};

    for (const hotel of hotelUrls) {
        console.log(`\n[TouringPlans] Scraping ${hotel.name}...`);

        const url = hotel.url.replace("YEAR", TARGET_YEAR);

        await page.goto(url, {
            waitUntil: "networkidle0",
            timeout: 0
        });

        const data = await page.evaluate(() => {
            const rows = Array.from(
                document.querySelectorAll("table tbody tr")
            );

            let currentMonthYear = "";
            let roomTypes = [];

            const dailyData = {};

            rows.forEach(row => {

                /*
                 * Month header rows have IDs such as:
                 * 202701
                 */
                if (row.id && /^\d{6}$/.test(row.id)) {
                    currentMonthYear =
                        row.id.slice(0, 4) +
                        "-" +
                        row.id.slice(4, 6);

                    roomTypes = Array.from(
                        row.querySelectorAll("td")
                    )
                        .slice(2)
                        .map(td => td.innerText.trim());

                    return;
                }

                /*
                 * Regular daily price row.
                 *
                 * Example:
                 * <td>Jan 1</td>
                 * <td>Fri</td>
                 * <td>$938</td>
                 * <td>$1,040</td>
                 */
                if (!currentMonthYear) {
                    return;
                }

                const tds = Array.from(row.querySelectorAll("td"));

                if (tds.length < 3) {
                    return;
                }

                const dayText = tds[0]?.innerText.trim();

                /*
                 * Extract the day from "Jan 1", "Jan 2", etc.
                 */
                const dayMatch = dayText.match(/^[A-Za-z]{3}\s+(\d{1,2})$/);

                if (!dayMatch) {
                    return;
                }

                const day = dayMatch[1].padStart(2, "0");

                const date = `${currentMonthYear}-${day}`;

                dailyData[date] = {};

                /*
                 * First two cells are:
                 * 0 = date
                 * 1 = weekday
                 *
                 * Everything after that is a room price.
                 */
                tds.slice(2).forEach((td, index) => {
                    const priceText = td.innerText
                        .replace(/\$|,/g, "")
                        .trim();

                    const price = priceText
                        ? parseInt(priceText, 10)
                        : null;

                    const roomType = roomTypes[index];

                    if (roomType) {
                        dailyData[date][roomType] = price;
                    }
                });
            });

            return dailyData;
        });


        /*
         * Filter the scraped TouringPlans data to only the
         * configured year/months and convert the date keys.
         */
        const filteredData = {};

        for (const [dateString, rooms] of Object.entries(data)) {
            const [year, month, day] = dateString
                .split("-")
                .map(Number);

            const date = new Date(year, month - 1, day);

            if (!isTargetDate(date)) {
                continue;
            }

            filteredData[formatDateKey(date)] = rooms;
        }

        hotelData[hotel.name] = filteredData;

        console.log(
            `[TouringPlans] ${hotel.name}: ` +
            `${Object.keys(filteredData).length} days`
        );
    }

    return hotelData;
}


/*
|--------------------------------------------------------------------------
| SCRAPE MOUSESAVERS
|--------------------------------------------------------------------------
*/

async function scrapeMouseSavers(page) {
    const hotelData = {};

    for (const hotel of mouseSaversUrls) {

        /*
         * Only scrape hotels for which we actually need missing
         * room types.
         */
        if (!missingRooms[hotel.name]) {
            continue;
        }

        console.log(`\n[MouseSavers] Scraping ${hotel.name}...`);

        const url = hotel.url.replace("YEAR", TARGET_YEAR);

        await page.goto(url, {
            waitUntil: "networkidle0",
            timeout: 0
        });

        const requestedRooms = missingRooms[hotel.name];

        const tablesData = await page.evaluate(
            (hotelMissingRooms) => {

                const tables = Array.from(
                    document.querySelectorAll("table")
                );

                const allData = [];

                tables.forEach(table => {

                    const headers = Array.from(
                        table.querySelectorAll(
                            "tr:first-child th, tr:first-child td"
                        )
                    )
                        .slice(2)
                        .map(h => h.innerText.trim())
                        .filter(header =>
                            hotelMissingRooms.includes(header)
                        );

                    if (headers.length === 0) {
                        return;
                    }

                    const rows = Array.from(
                        table.querySelectorAll("tr")
                    ).slice(1);

                    rows.forEach(row => {

                        const cells = Array.from(
                            row.querySelectorAll("td")
                        );

                        if (cells.length < 3) {
                            return;
                        }

                        const dateRange =
                            cells[0].innerText.trim();

                        const prices = cells
                            .slice(2)
                            .map(td =>
                                td.innerText
                                    .trim()
                                    .split("·")
                                    .map(price =>
                                        parseInt(
                                            price.replace(
                                                /\$|,/g,
                                                ""
                                            ),
                                            10
                                        )
                                    )
                            );

                        allData.push({
                            dateRange,
                            prices,
                            headers
                        });
                    });
                });

                return allData;

            },
            requestedRooms
        );


        const dailyData = {};

        for (const row of tablesData) {

            const dates = expandDateRange(row.dateRange);

            dates.forEach(dateObj => {

                if (!isTargetDate(dateObj)) {
                    return;
                }

                const dateKey = formatDateKey(dateObj);

                if (!dailyData[dateKey]) {
                    dailyData[dateKey] = {};
                }

                row.headers.forEach((header, index) => {

                    const priceArray = row.prices[index];

                    if (!priceArray || priceArray.length === 0) {
                        return;
                    }

                    const priceIndex = getPriceIndex(dateObj);

                    const price =
                        priceArray[
                        Math.min(
                            priceIndex,
                            priceArray.length - 1
                        )
                        ];

                    dailyData[dateKey][header] = price;
                });
            });
        }

        hotelData[hotel.name] = dailyData;

        console.log(
            `[MouseSavers] ${hotel.name}: ` +
            `${Object.keys(dailyData).length} days`
        );
    }

    return hotelData;
}


/*
|--------------------------------------------------------------------------
| MERGE DATA
|--------------------------------------------------------------------------
*/

function mergeData(touringPlansData, mouseSaversData) {

    /*
     * Start with all TouringPlans data.
     */
    const finalData = {};

    for (const [hotel, dates] of Object.entries(touringPlansData)) {
        finalData[hotel] = {};

        for (const [date, rooms] of Object.entries(dates)) {
            finalData[hotel][date] = {
                ...rooms
            };
        }
    }


    /*
     * Add the MouseSavers room types.
     *
     * IMPORTANT:
     * We only add a room if TouringPlans does not already
     * contain that room type.
     */
    for (const [hotel, dates] of Object.entries(mouseSaversData)) {

        if (!finalData[hotel]) {
            finalData[hotel] = {};
        }

        for (const [date, rooms] of Object.entries(dates)) {

            if (!finalData[hotel][date]) {
                finalData[hotel][date] = {};
            }

            for (const [roomName, price] of Object.entries(rooms)) {

                if (
                    finalData[hotel][date][roomName] === undefined
                ) {
                    finalData[hotel][date][roomName] = price;
                }
            }
        }
    }

    return finalData;
}


/*
|--------------------------------------------------------------------------
| MAIN
|--------------------------------------------------------------------------
*/

(async () => {

    console.log("========================================");
    console.log("Disney Hotel Room Price Scraper");
    console.log("========================================");
    console.log(`Year: ${TARGET_YEAR}`);
    console.log(
        `Months: ${TARGET_MONTHS
            .map(month => MONTH_NAMES[month - 1])
            .join(", ")}`
    );
    console.log(`Output: ${outputPath}`);
    console.log("========================================");


    const browser = await puppeteer.launch({
        headless: true
    });

    const page = await browser.newPage();

    await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/118.0 Safari/537.36"
    );


    try {

        /*
         * 1. Scrape all TouringPlans hotels.
         */
        const touringPlansData =
            await scrapeTouringPlans(page);


        /*
         * 2. Scrape only the missing room types from MouseSavers.
         */
        const mouseSaversData =
            await scrapeMouseSavers(page);


        /*
         * 3. Combine the two sources.
         */
        const finalData =
            mergeData(
                touringPlansData,
                mouseSaversData
            );


        /*
         * 4. Write final JSON.
         */
        fs.writeFileSync(
            outputPath,
            JSON.stringify(finalData, null, 2)
        );


        /*
         * 5. Summary.
         */
        let hotelCount = 0;
        let dateCount = 0;
        let roomCount = 0;

        for (const dates of Object.values(finalData)) {

            hotelCount++;

            for (const rooms of Object.values(dates)) {

                dateCount++;
                roomCount += Object.keys(rooms).length;
            }
        }

        console.log("\n========================================");
        console.log("SCRAPING COMPLETE");
        console.log("========================================");
        console.log(`Hotels: ${hotelCount}`);
        console.log(`Dates: ${dateCount}`);
        console.log(`Room prices: ${roomCount}`);
        console.log(`Output: ${outputPath}`);
        console.log("========================================");

    } catch (error) {

        console.error("\n❌ Scraping failed:");
        console.error(error);

    } finally {

        await browser.close();
    }

})();