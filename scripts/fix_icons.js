const fs = require('fs');
const path = require('path');

const iconMap = {
    "Heart": "FavouriteIcon", "Star": "StarIcon", "MapPin": "Location01Icon",
    "DollarSign": "Dollar01Icon", "Eye": "ViewIcon", "EyeOff": "ViewOffIcon",
    "Compass": "CompassIcon", "Mail": "Mail01Icon", "Phone": "CallIcon",
    "Facebook": "Facebook01Icon", "Instagram": "InstagramIcon", "Twitter": "TwitterIcon",
    "Youtube": "YoutubeIcon", "Check": "Tick01Icon", "ChevronRight": "ArrowRight01Icon",
    "Circle": "CircleIcon", "ArrowUpRight": "ArrowUpRight01Icon", "Search": "Search01Icon",
    "X": "Cancel01Icon", "Lightbulb": "Idea01Icon", "Upload": "Upload01Icon",
    "Send": "SentIcon", "InfoIcon": "InformationCircleIcon", "Lock": "LockIcon",
    "User": "UserIcon", "SlidersHorizontal": "SlidersHorizontalIcon",
    "ChevronDown": "ArrowDown01Icon", "Moon": "Moon01Icon", "Sun": "Sun01Icon",
    "Laptop": "LaptopIcon", "Menu": "Menu01Icon", "MenuIcon": "Menu01Icon"
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

    // Replace remaining lucide-react instances
    if (content.includes('lucide-react')) {
        content = content.replace(/["']lucide-react["']/g, '"hugeicons-react"');
        hasChanges = true;
    }

    // Some Menu usages might exist
    if (content.includes('<Menu ') || content.includes('<MenuIcon ')) {
        content = content.replace(/<Menu(\s|>)/g, '<Menu01Icon$1');
        content = content.replace(/<\/Menu>/g, '</Menu01Icon>');
        content = content.replace(/<MenuIcon(\s|>)/g, '<Menu01Icon$1');
        content = content.replace(/<\/MenuIcon>/g, '</Menu01Icon>');
        hasChanges = true;
    }

    // Clean up hugeicons-react imports to ensure all mapped names are fixed
    const importRegex = /import\s+{([^}]+)}\s+from\s+["']hugeicons-react["'];?/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const parts = match[1].split(',').map(s => s.trim()).filter(Boolean);
        let newParts = [];
        for (const p of parts) {
            let name = p;
            if (p.includes(' as ')) {
                name = p.split(' as ')[0].trim();
            }
            if (iconMap[name]) {
                newParts.push(iconMap[name]);
            } else if (iconMap[name.replace(/Icon$/, '')]) {
                newParts.push(iconMap[name.replace(/Icon$/, '')]);
            } else {
                // try to change to mapped naming
                let fixed = name;
                if (!fixed.endsWith('Icon')) fixed += 'Icon';
                newParts.push(fixed);
            }
        }

        const newImport = `import { ${[...new Set(newParts)].join(', ')} } from "hugeicons-react";`;
        content = content.replace(match[0], newImport);
        hasChanges = true;
    }

    if (hasChanges) {
        fs.writeFileSync(file, content);
        console.log(`Fixed ${file}`);
    }
}
