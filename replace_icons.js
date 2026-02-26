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

    // Try to find lucide-react import
    // Using a regex that can handle newlines in imports
    const importRegex = /import\s+{([^}]+)}\s+from\s+["']lucide-react["'];?/g;
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

            const mappedIcon = iconMap[actualIcon] || actualIcon + "Icon";
            newImports.push(mappedIcon);

            // Safer replacements:
            // 1. As a JSX tag: <IconName /> or <IconName>
            localContent = localContent.replace(new RegExp(`<${localName}(\\s|>)`, 'g'), `<${mappedIcon}$1`);
            localContent = localContent.replace(new RegExp(`</${localName}>`, 'g'), `</${mappedIcon}>`);

            // 2. As a prop or array element: {IconName} or [IconName] or icon={IconName}
            // Exclude letters before and after
            localContent = localContent.replace(new RegExp(`\\b${localName}\\b`, 'g'), (m, offset, str) => {
                // we already replaced the tag, so if there's a `<` before, don't double replace
                if (offset > 0 && str[offset - 1] === '<') return m;
                if (offset > 1 && str[offset - 2] === '<' && str[offset - 1] === '/') return m;

                // let's check if it's imported from lucide-react, if so don't replace in the import statement
                // we will replace the whole import statement later
                const before = str.substring(Math.max(0, offset - 20), offset);
                if (before.includes('import {') && !before.includes('}')) return m;

                return mappedIcon;
            });
        }

        // Now replace the whole import line
        const newImportLine = `import { ${newImports.join(', ')} } from "hugeicons-react";`;
        localContent = localContent.replace(match[0], newImportLine);

        content = localContent;
        hasChanges = true;
    }

    if (hasChanges) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
}
