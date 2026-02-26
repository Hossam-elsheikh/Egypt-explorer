const fs = require('fs');

const dtsFile = "node_modules/hugeicons-react/dist/hugeicons-react.d.ts";
const content = fs.readFileSync(dtsFile, 'utf8');
const exportMatches = [...content.matchAll(/declare const ([A-Za-z0-9]+)Icon:/g)].map(m => m[1]);

const query = [
    "eyeoff", "viewoff", "arrowright", "arrowdown", "send", "sent", "information",
    "info", "setting", "slider", "arrowupright"
];

for (const q of query) {
    const matches = exportMatches.filter(e => e.toLowerCase() === q || e.toLowerCase() === q + "01" || e.toLowerCase() === q + "02");
    const partialMatches = exportMatches.filter(e => e.toLowerCase().includes(q)).slice(0, 3);
    console.log(`Query ${q}: exact: ${matches.join(", ")}, partial: ${partialMatches.join(", ")}`);
}
