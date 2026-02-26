const fs = require('fs');

const lucideIcons = [
    "Heart", "Star", "MapPin", "DollarSign", "Eye", "EyeOff", "Compass",
    "Mail", "Phone", "Facebook", "Instagram", "Twitter", "Youtube", "Check",
    "ChevronRight", "Circle", "ArrowUpRight", "Search", "X", "Lightbulb",
    "Upload", "Send", "InfoIcon", "Lock", "User", "SlidersHorizontal",
    "ChevronDown", "Moon", "Sun", "Laptop"
].map(i => i.toLowerCase().replace(/icon$/, ''));

function findMatches() {
    const dtsFile = "node_modules/hugeicons-react/dist/hugeicons-react.d.ts";
    if (!fs.existsSync(dtsFile)) {
        console.log("No dts file");
        return;
    }
    const content = fs.readFileSync(dtsFile, 'utf8');
    const exportMatches = [...content.matchAll(/declare const ([A-Za-z0-9]+)Icon:/g)].map(m => m[1]);

    const map = {};
    for (const icon of lucideIcons) {
        const candidates = exportMatches.filter(e => e.toLowerCase().includes(icon));
        map[icon] = candidates.slice(0, 5).map(c => c + 'Icon');
    }
    console.log(JSON.stringify(map, null, 2));
}
findMatches();
