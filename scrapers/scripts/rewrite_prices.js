// replace_rooms.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'output', 'hotel_room_prices_2026_flat.json');
const rawData = fs.readFileSync(filePath, 'utf-8');
const hotelData = JSON.parse(rawData);

// Rooms to remove per hotel
const removeRooms = {
  "animal-kingdom-villas-jambo": ["Studio - Value"],
  "beach-club": ["Resort View - King Bed"],
  "caribbean-beach": ["Standard Location", "Preferred Location"],
  "contemporary-resort": [
    "Garden Wing - 1 Bedroom Suite Access",
    "Garden Wing -1 Bedroom Hospitality Ste Access"
  ],
  "villas-grand-floridian": [
    "Resort Studio - Resort View",
    "Resort Studio - Theme Park View"
  ],
  "all": ["Studio - Value", "Standard View", "Preferred Room"] // remove globally
};

// Rooms to replace per hotel
const replaceRooms = {
  "bay-lake-tower": {
    "3-Bedroom Grand Villa - Theme Park View": "3-Bedroom Grand Villa – Theme Park View",
    "2-Bedroom Villa - Theme Park View": "2-Bedroom Villa – Theme Park View"
  }
};

for (const hotelId in hotelData) {
  const hotelDates = hotelData[hotelId];

  for (const date in hotelDates) {
    const rooms = hotelDates[date];

    // Remove unwanted rooms
    const hotelRemovals = removeRooms[hotelId] || [];
    const globalRemovals = removeRooms["all"] || [];
    [...hotelRemovals, ...globalRemovals].forEach(roomToRemove => {
      if (rooms[roomToRemove] !== undefined) {
        delete rooms[roomToRemove];
      }
    });

    // Replace room names
    if (replaceRooms[hotelId]) {
      for (const oldName in replaceRooms[hotelId]) {
        const newName = replaceRooms[hotelId][oldName];
        if (rooms[oldName] !== undefined) {
          rooms[newName] = rooms[oldName];
          delete rooms[oldName];
        }
      }
    }
  }
}

// Write back to file
fs.writeFileSync(filePath, JSON.stringify(hotelData, null, 2));
console.log("✅ Rooms replaced/removed successfully!");
