const fs = require('fs');
const path = require('path');

// List of directories to process
const directories = [
    'c:\\Users\\Pc\\Desktop\\Pixelearn',
    'c:\\Users\\Pc\\Desktop\\Pixelearn\\games',
    'c:\\Users\\Pc\\Desktop\\Pixelearn\\Articles',
    'c:\\Users\\Pc\\Desktop\\Pixelearn\\Lessons',
];

// Loading screen CSS link
const loadingCSS = '    <link rel="stylesheet" href="../styles/loading-screen.css">\n';

// Loading handler script
const loadingScript = '    <script src="../scripts/loading-handler.js" defer></script>\n';

// Function to process a single HTML file
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Skip if already processed
        if (content.includes('loading-handler.js')) {
            console.log(`Skipping (already processed): ${filePath}`);
            return;
        }
        
        // Add loading CSS after the last stylesheet
        const lastStyleIndex = content.lastIndexOf('</style>');
        if (lastStyleIndex !== -1) {
            content = content.slice(0, lastStyleIndex + 8) + '\n' + loadingCSS + content.slice(lastStyleIndex + 8);
        } else {
            // If no style tag found, add before </head>
            const headEndIndex = content.indexOf('</head>');
            if (headEndIndex !== -1) {
                content = content.slice(0, headEndIndex) + '\n' + loadingCSS + content.slice(headEndIndex);
            }
        }
        
        // Add loading handler script before </head>
        const headEndIndex = content.indexOf('</head>');
        if (headEndIndex !== -1) {
            content = content.slice(0, headEndIndex) + '\n' + loadingScript + content.slice(headEndIndex);
        }
        
        // Add loading screen placeholder after <body>
        const bodyStartIndex = content.indexOf('<body');
        const bodyTagEndIndex = content.indexOf('>', bodyStartIndex) + 1;
        if (bodyTagEndIndex > 0) {
            content = content.slice(0, bodyTagEndIndex) + '\n    <!-- Loading screen will be inserted here by loading-handler.js -->\n' + content.slice(bodyTagEndIndex);
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// Process all HTML files in the given directories
function processDirectories() {
    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            console.log(`Directory not found: ${dir}`);
            return;
        }
        
        console.log(`\nProcessing directory: ${dir}`);
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        files.forEach(file => {
            if (file.isFile() && file.name.endsWith('.html')) {
                processFile(path.join(dir, file.name));
            } else if (file.isDirectory()) {
                // Recursively process subdirectories
                const subDir = path.join(dir, file.name);
                const subFiles = fs.readdirSync(subDir, { withFileTypes: true });
                
                subFiles.forEach(subFile => {
                    if (subFile.isFile() && subFile.name.endsWith('.html')) {
                        processFile(path.join(subDir, subFile.name));
                    }
                });
            }
        });
    });
    
    console.log('\nProcessing complete!');
}

// Run the script
processDirectories();
