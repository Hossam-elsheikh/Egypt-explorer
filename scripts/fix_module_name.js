const fs = require('fs');
const path = require('path');

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
    if (content.includes("hugeicons-react")) {
        // Just replace hugeicons-react with lucide-react directly
        content = content.replace(/['"]hugeicons-react['"]/g, '"lucide-react"');

        // Let's also make sure all imports inside {} that end with Icon are stripped of Icon
        // Only if they are imported from lucide-react
        const importRegex = /import\s+{([^}]+)}\s+from\s+["']lucide-react["'];?/g;
        let match;
        // Collect replacements
        let replacements = [];
        let newContent = content;

        while ((match = importRegex.exec(content)) !== null) {
            const importedIcons = match[1].split(',').map(s => s.trim()).filter(Boolean);
            let newImports = [];
            for (let icon of importedIcons) {
                let actual = icon;
                if (icon.includes(' as ')) {
                    actual = icon.split(' as ')[0].trim();
                }

                // If it ends with Icon and it's not InfoIcon, let's strip it!
                // Wait, lucide-react has some icons ending in Icon? No, not usually.
                // It's safer to just let the previous step do its job. We only need to fix the module name!
            }
        }

        fs.writeFileSync(file, content);
        console.log(`Updated module name in ${file}`);
    }
}
