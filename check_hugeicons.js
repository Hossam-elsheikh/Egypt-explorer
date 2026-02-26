const fs = require('fs');

const dtsFile = "node_modules/hugeicons-react/dist/hugeicons-react.d.ts";
if (!fs.existsSync(dtsFile)) {
    console.log("No dts file");
    process.exit(1);
}
const content = fs.readFileSync(dtsFile, 'utf8');
const exportsList = [...content.matchAll(/export const ([A-Za-z0-9]+)/g)].map(m => m[1]);
console.log("Total exports:", exportsList.length);
console.log("Sample exports:", exportsList.slice(0, 50).join(", "));
