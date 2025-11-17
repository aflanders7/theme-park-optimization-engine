const fs = require("fs");
const path = require("path");

const flatPath = path.join(__dirname, "..", "output", "events.json");

// Load file
const events = JSON.parse(fs.readFileSync(flatPath, "utf8"));

console.log("Counting event names...");

let dict = {};

for (const event of events) {
    const name = event.event_name;

    if (!dict[name]) {
        dict[name] = 1;
    } else {
        dict[name] += 1;
    }
}

console.log(dict);
