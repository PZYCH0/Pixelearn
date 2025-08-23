const fs = require('fs');
const path = require('path');

// List of files that need cleaning
const filesToClean = [
    'ActivityManagerMain.html',
    'ClassroomChampion.html',
    'embed.html',
    'PunkdoroMain.html',
    'TicTacTense.html',
    'To_Do.html'
];

// The pattern to remove
const loadingTextPattern = /\s*<p class=["']loading-text["']>LOADING\.\.\.<\/p>\s*/g;

// Process each file
filesToClean.forEach(fileName => {
    const filePath = path.join(__dirname, '..', fileName);
    
    try {
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;
            
            // Remove the loading text
            content = content.replace(loadingTextPattern, '');
            
            // Only write if content changed
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Cleaned up: ${fileName}`);
            } else {
                console.log(`No changes needed: ${fileName}`);
            }
        } else {
            console.log(`File not found: ${fileName}`);
        }
    } catch (error) {
        console.error(`Error processing ${fileName}:`, error.message);
    }
});

console.log('\nCleanup complete!');
