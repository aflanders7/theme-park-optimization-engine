const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "..", "output", "hotel_room_prices_2026_flat.json");
const outputPath = inputPath; // overwrite same file

const rawData = fs.readFileSync(inputPath, "utf-8");
const hotels = JSON.parse(rawData);

// Month → number mapping
const monthMap = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

const fixedHotels = {};

for (const hotelId in hotels) {
  fixedHotels[hotelId] = {};

  for (const oldDateKey in hotels[hotelId]) {
    // Format is currently: "2025-Jan-1"

    const parts = oldDateKey.split("-");
    const oldYear = parts[0];          // "2025"
    const monthName = parts[1];        // "Jan"
    const dayRaw = parts[2];           // "1"

    // Fix year → 2026 ALWAYS
    const year = "2026";

    // Convert month
    const monthNum = monthMap[monthName];

    // Remove leading zeros (if scraper ever had "01" etc.)
    const day = String(parseInt(dayRaw));

    // Build new key in Python-compatible format
    //
    //    "2026-01-Jan 1"
    //
    const newKey = `${year}-${monthNum}-${monthName} ${day}`;

    // Store data under the new corrected key
    fixedHotels[hotelId][newKey] = hotels[hotelId][oldDateKey];
  }
}

fs.writeFileSync(outputPath, JSON.stringify(fixedHotels, null, 2));
console.log("✅ Date keys rewritten successfully to Python-compatible format.");
