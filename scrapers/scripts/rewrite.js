const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'output', 'hotels.json');
const outputPath = path.join(__dirname, '..', 'output', 'rooms.json');

const rawData = fs.readFileSync(inputPath);
const hotels = JSON.parse(rawData);

const allRooms = [];

hotels.forEach(hotel => {
  hotel.rooms.forEach(room => {
    allRooms.push({
      hotel_id: hotel.id,
      hotel_name: hotel.name,
      category: hotel.category,
      location: hotel.location,
      transportation: hotel.transportation,
      room_id: room.id,
      room_name: room.name,
      description: room.description || "",
      beds: room.beds || [],
      occupancy: room.occupancy || 0,
      features: room.features || []
    });
  });
});

fs.writeFileSync(outputPath, JSON.stringify(allRooms, null, 2));
console.log(`Flattened ${allRooms.length} rooms into rooms.json`);
