const fs = require('fs');
const path = require('path');

const reverseMap = {
    "FavouriteIcon": "Heart",
    "StarIcon": "Star",
    "Location01Icon": "MapPin",
    "Dollar01Icon": "DollarSign",
    "ViewIcon": "Eye",
    "ViewOffIcon": "EyeOff",
    "CompassIcon": "Compass",
    "Mail01Icon": "Mail",
    "CallIcon": "Phone",
    "Facebook01Icon": "Facebook",
    "InstagramIcon": "Instagram",
    "TwitterIcon": "Twitter",
    "YoutubeIcon": "Youtube",
    "Tick01Icon": "Check",
    "ArrowRight01Icon": "ChevronRight",
    "CircleIcon": "Circle",
    "ArrowUpRight01Icon": "ArrowUpRight",
    "Search01Icon": "Search",
    "Cancel01Icon": "X",
    "Idea01Icon": "Lightbulb",
    "Upload01Icon": "Upload",
    "SentIcon": "Send",
    "InformationCircleIcon": "InfoIcon",
    "LockIcon": "Lock",
    "UserIcon": "User",
    "SlidersHorizontalIcon": "SlidersHorizontal",
    "ArrowDown01Icon": "ChevronDown",
    "Moon01Icon": "Moon",
    "Sun01Icon": "Sun",
    "LaptopIcon": "Laptop",
    "Menu01Icon": "Menu",
    "Logout01Icon": "LogOut",
    "Setting06Icon": "Settings",
    "Camera01Icon": "Camera",
    "Mosque01Icon": "Tent", /* Guessing mosque equivalent or whatever they had */
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

    // First, let's fix the module names
    content = content.replace(/["']hugeicons-react["']/g, '"lucide-react"');

    // Then let's find any import from lucide-react and ensure the inner names are correct
    let importRegex = /import\s+{([^}]+)}\s+from\s+["']lucide-react["'];?/g;
    let newContent = content;
    let match;

    // We will do a full parse
    while ((match = importRegex.exec(content)) !== null) {
        let importedIcons = match[1].split(',').map(s => s.trim()).filter(Boolean);
        let correctedImports = [];

        for (let icon of importedIcons) {
            let actual = icon;
            if (icon.includes(' as ')) {
                actual = icon.split(' as ')[0].trim();
            }

            // Fix any weird states: e.g. CompassIcon -> Compass
            let correct = reverseMap[actual] || actual;
            if (correct.endsWith('Icon') && correct !== 'InfoIcon' && correct !== 'ImageIcon') {
                correct = correct.replace(/Icon$/, '');
            }

            // A couple typical Nextjs hugeicons specific mismatches might be present
            if (correct === 'InformationCircle') correct = 'Info';
            if (correct === 'CompassIcon') correct = 'Compass';
            if (correct === 'Menu01') correct = 'Menu';
            if (correct === 'Logout01') correct = 'LogOut';
            if (correct === 'Setting06') correct = 'Settings';
            if (correct === 'Search01') correct = 'Search';
            if (correct === 'Camera01') correct = 'Camera';
            if (correct === 'Mosque01') correct = 'Landmark';

            correctedImports.push(correct);

            // Make sure the tag names in the body are replaced!
            // Wait, the body tags might currently be <CompassIcon /> OR <Compass />
            // Let's replace both just in case, or rather map actual -> correct in body
            let bodyRegex1 = new RegExp(`<${icon}(\\s|>)`, 'g');
            newContent = newContent.replace(bodyRegex1, `<${correct}$1`);

            let bodyRegex2 = new RegExp(`</${icon}>`, 'g');
            newContent = newContent.replace(bodyRegex2, `</${correct}>`);

            // Replace <CompassIcon ...> if it's there
            let bodyRegex3 = new RegExp(`<${correct}Icon(\\s|>)`, 'g');
            newContent = newContent.replace(bodyRegex3, `<${correct}$1`);
        }

        // Then replace the import line
        let newImportLine = `import { ${[...new Set(correctedImports)].join(', ')} } from "lucide-react";`;
        newContent = newContent.replace(match[0], newImportLine);
    }

    if (newContent !== content) {
        fs.writeFileSync(file, newContent);
        console.log(`Fixed imports in ${file}`);
    } else {
        // Just save module name changes
        fs.writeFileSync(file, newContent);
    }
}
