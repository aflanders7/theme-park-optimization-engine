const fs = require("fs");
const path = require("path");

// Input files
const fileA = path.join(__dirname, "..", "output", "predicted_crowds_2026.json");
const fileB = path.join(__dirname, "..", "output", "predicted_crowds_2026_2.json");

// Output (overwrite fileA)
const outputFile = fileA;

console.log("Loading files...");
const dataA = JSON.parse(fs.readFileSync(fileA, "utf8"));
const dataB = JSON.parse(fs.readFileSync(fileB, "utf8"));

console.log("Building lookup tables...");

// Convert to fast lookup: key = `${park}_${date}`
function toDict(arr) {
    const dict = {};
    for (const item of arr) {
        const key = `${item.park}_${item.date}`;
        dict[key] = item;
    }
    return dict;
}

const dictA = toDict(dataA);
const dictB = toDict(dataB);

const finalResults = [];

console.log("Comparing values...");

for (const key of Object.keys(dictA)) {
    const a = dictA[key];
    const b = dictB[key];

    // If matching date+park doesn't exist in B, just use A
    if (!b) {
        finalResults.push(a);
        continue;
    }

    // Take whichever crowd number is larger
    const chosen =
        a.crowd >= b.crowd
            ? { ...a, crowd: a.crowd }
            : { ...a, crowd: b.crowd }; // park/date same as A

    finalResults.push(chosen);
}

// If fileB has extra entries not in A, add them too
for (const key of Object.keys(dictB)) {
    if (!dictA[key]) {
        finalResults.push(dictB[key]);
    }
}

console.log("Writing merged results...");
fs.writeFileSync(outputFile, JSON.stringify(finalResults, null, 2));

console.log("Done! Merged file written to predicted_crowds_2026.json");
