const fs = require('fs');

const dtsFile = "node_modules/hugeicons-react/dist/hugeicons-react.d.ts";
if (!fs.existsSync(dtsFile)) {
    console.log("No dts file");
    process.exit(1);
}
const content = fs.readFileSync(dtsFile, 'utf8');
const exportMatches = [...content.matchAll(/declare const ([A-Za-z0-9]+)Icon:/g)].map(m => m[1]);

const query = [
    "heart", "favourite", "star", "map", "location", "pin", "dollar", "money",
    "eye", "view", "compass", "mail", "email", "phone", "call", "facebook",
    "instagram", "twitter", "youtube", "check", "tick", "chevron", "circle",
    "arrow", "search", "x", "cancel", "close", "multiply", "lightbulb", "idea",
    "upload", "send", "info", "lock", "user", "profile", "slider", "setting",
    "moon", "sun", "laptop"
];

for (const q of query) {
    const matches = exportMatches.filter(e => e.toLowerCase() === q || e.toLowerCase() === q + "01" || e.toLowerCase() === q + "02");
    if (matches.length > 0) {
        console.log(`Query ${q}: ${matches.join(", ")}`);
    }
}
