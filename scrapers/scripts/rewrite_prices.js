const fs = require("fs");
const path = require("path");

const flatPath = path.join(__dirname, "..", "output", "hotel_room_prices_2026_flat.json");
const missingPath = path.join(__dirname, "..", "output", "hotel_rooms_missing.json");

// Load files
const flat = JSON.parse(fs.readFileSync(flatPath, "utf8"));
const missing = JSON.parse(fs.readFileSync(missingPath, "utf8"));

console.log("Merging missing rooms into flat price file...");

for (const [hotel, missingDates] of Object.entries(missing)) {
  if (!flat[hotel]) {
    flat[hotel] = {}; // hotel does not exist yet
  }

  for (const [date, missingRooms] of Object.entries(missingDates)) {
    if (!flat[hotel][date]) {
      flat[hotel][date] = {}; // date does not exist yet
    }

    for (const [roomName, price] of Object.entries(missingRooms)) {
      if (flat[hotel][date][roomName] === undefined) {
        flat[hotel][date][roomName] = price;  // Add missing room
      }
    }
  }
}

// Save merged file
fs.writeFileSync(flatPath, JSON.stringify(flat, null, 2));
console.log("✅ Merge complete — flat file updated!");
