const fs = require('fs');
const path = require('path');

// Function to process all HTML files in a directory
function processDirectory(directory) {
    const files = fs.readdirSync(directory, { withFileTypes: true });
    
    files.forEach(file => {
        const fullPath = path.join(directory, file.name);
        
        if (file.isDirectory()) {
            // Skip node_modules and other non-essential directories
            if (['node_modules', '.git', '_site', '.github'].includes(file.name)) {
                return;
            }
            processDirectory(fullPath);
        } else if (file.name.endsWith('.html')) {
            processHtmlFile(fullPath);
        }
    });
}

// Function to process a single HTML file
function processHtmlFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Fix image src paths (remove leading slashes)
        const imgSrcPattern = /(<img[^>]*src=["'])\/([^"']+["'][^>]*>)/g;
        content = content.replace(imgSrcPattern, (match, p1, p2) => {
            modified = true;
            return `${p1}${p2}`;
        });

        // Fix link href paths (remove leading slashes)
        const linkHrefPattern = /(<link[^>]*href=["'])\/([^"']+["'][^>]*>)/g;
        content = content.replace(linkHrefPattern, (match, p1, p2) => {
            modified = true;
            return `${p1}${p2}`;
        });

        // Fix script src paths (remove leading slashes)
        const scriptSrcPattern = /(<script[^>]*src=["'])\/([^"']+["'][^>]*>)/g;
        content = content.replace(scriptSrcPattern, (match, p1, p2) => {
            modified = true;
            return `${p1}${p2}`;
        });

        // Fix a href paths (remove leading slashes, but keep external URLs)
        const aHrefPattern = /(<a[^>]*href=["'])\/(?!\/)([^"']+["'][^>]*>)/g;
        content = content.replace(aHrefPattern, (match, p1, p2) => {
            modified = true;
            return `${p1}${p2}`;
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated paths in: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// Start processing from the project root
const rootDir = path.join(__dirname, '..');
console.log('Fixing asset paths in HTML files...');
processDirectory(rootDir);
console.log('Path fixing complete!');
