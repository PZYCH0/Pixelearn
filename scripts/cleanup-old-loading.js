const fs = require('fs');
const path = require('path');

// List of directories to process
const directories = [
    'c:\\Users\\Pc\\Desktop\\Pixelearn',
    'c:\\Users\\Pc\\Desktop\\Pixelearn\\games',
    'c:\\Users\\Pc\\Desktop\\Pixelearn\\Articles',
    'c:\\Users\\Pc\\Desktop\\Pixelearn\\Lessons',
];

// Patterns to remove
const patternsToRemove = [
    // Remove old loading screen HTML
    /<!--\s*Pixel Loading Animation\s*-->[\s\S]*?<div class=["']pixel-loader["']>[\s\S]*?<\/div>/gi,
    // Remove old loading screen styles
    /\/\*\s*Loading animation\s*\*\/[\s\S]*?\.pixel-loader\s*\{[\s\S]*?\}/gi,
    /\/\*\s*Loading animation\s*\*\/[\s\S]*?\.loading-text\s*\{[\s\S]*?\}/gi,
    // Remove old loading screen JavaScript
    /const\s+pixelLoader\s*=\s*document\.querySelector\(['"]\.pixel-loader['"]\)[\s\S]*?\}\s*\}\)\s*;/gi,
];

// Function to process a single file
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // Apply all patterns
        patternsToRemove.forEach(pattern => {
            content = content.replace(pattern, '');
        });
        
        // Only write if content changed
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Cleaned up: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Process all files in the given directories
function processDirectories() {
    let cleanedFiles = 0;
    
    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            console.log(`Directory not found: ${dir}`);
            return;
        }
        
        console.log(`\nProcessing directory: ${dir}`);
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        files.forEach(file => {
            const filePath = path.join(dir, file.name);
            
            if (file.isFile() && (file.name.endsWith('.html') || file.name.endsWith('.js') || file.name.endsWith('.css'))) {
                if (processFile(filePath)) {
                    cleanedFiles++;
                }
            } else if (file.isDirectory()) {
                // Process subdirectories
                const subFiles = fs.readdirSync(filePath, { withFileTypes: true });
                
                subFiles.forEach(subFile => {
                    const subFilePath = path.join(filePath, subFile.name);
                    if (subFile.isFile() && (subFile.name.endsWith('.html') || subFile.name.endsWith('.js') || subFile.name.endsWith('.css'))) {
                        if (processFile(subFilePath)) {
                            cleanedFiles++;
                        }
                    }
                });
            }
        });
    });
    
    console.log(`\nCleaned up ${cleanedFiles} files with old loading screen code.`);
}

// Run the cleanup
processDirectories();
