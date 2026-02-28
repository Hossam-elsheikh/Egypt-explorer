const fs = require('fs');
const path = require('path');

const iconMap = {
    "Heart": "FavouriteIcon",
    "Star": "StarIcon",
    "MapPin": "Location01Icon",
    "DollarSign": "Dollar01Icon",
    "Eye": "ViewIcon",
    "EyeOff": "ViewOffIcon",
    "Compass": "CompassIcon",
    "Mail": "Mail01Icon",
    "Phone": "CallIcon",
    "Facebook": "Facebook01Icon",
    "Instagram": "InstagramIcon",
    "Twitter": "TwitterIcon",
    "Youtube": "YoutubeIcon",
    "Check": "Tick01Icon",
    "ChevronRight": "ArrowRight01Icon",
    "Circle": "CircleIcon",
    "ArrowUpRight": "ArrowUpRight01Icon",
    "Search": "Search01Icon",
    "X": "Cancel01Icon",
    "Lightbulb": "Idea01Icon",
    "Upload": "Upload01Icon",
    "Send": "SentIcon",
    "InfoIcon": "InformationCircleIcon",
    "Lock": "LockIcon",
    "User": "UserIcon",
    "SlidersHorizontal": "SlidersHorizontalIcon",
    "ChevronDown": "ArrowDown01Icon",
    "Moon": "Moon01Icon",
    "Sun": "Sun01Icon",
    "Laptop": "LaptopIcon"
};

const reverseMap = {};
for (const [key, value] of Object.entries(iconMap)) {
    reverseMap[value] = key;
}

function getAllFiles(dirPath, arrayOfFiles) {
    let files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
            }
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });
    return arrayOfFiles;
}

const files = getAllFiles('/home/hos/projects/tour-guide');

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;

    // Try to find hugeicons-react import
    const importRegex = /import\s+{([^}]+)}\s+from\s+["']hugeicons-react["'];?/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const importedIcons = match[1].split(',').map(s => s.trim()).filter(Boolean);
        const newImports = [];

        let localContent = content;

        for (const icon of importedIcons) {
            let actualIcon = icon;
            let localName = icon;
            if (icon.includes(' as ')) {
                const parts = icon.split(' as ');
                actualIcon = parts[0].trim();
                localName = parts[1].trim();
            }

            let reverseIcon = reverseMap[actualIcon];
            if (!reverseIcon) {
                // Remove "Icon" suffix since it was added
                if (actualIcon.endsWith('Icon')) {
                    reverseIcon = actualIcon.substring(0, actualIcon.length - 4);
                } else {
                    reverseIcon = actualIcon;
                }
            }

            newImports.push(reverseIcon);

            // Safer replacements for usage: <IconName /> or <IconName>
            localContent = localContent.replace(new RegExp(`<${localName}(\\s|>)`, 'g'), `<${reverseIcon}$1`);
            localContent = localContent.replace(new RegExp(`</${localName}>`, 'g'), `</${reverseIcon}>`);

            // Also replace in arrays, objects, etc: {IconName} or [IconName] or icon={IconName}
            localContent = localContent.replace(new RegExp(`\\b${localName}\\b`, 'g'), (m, offset, str) => {
                if (offset > 0 && str[offset - 1] === '<') return m;
                if (offset > 1 && str[offset - 2] === '<' && str[offset - 1] === '/') return m;
                const before = str.substring(Math.max(0, offset - 20), offset);
                if (before.includes('import {') && !before.includes('}')) return m;

                return reverseIcon;
            });
        }

        const newImportLine = `import { ${newImports.join(', ')} } from "lucide-react";`;
        localContent = localContent.replace(match[0], newImportLine);

        content = localContent;
        hasChanges = true;
    }

    if (hasChanges) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
}
