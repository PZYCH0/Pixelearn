const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.join(__dirname, '..');
const fileExtensions = ['.html', '.css', '.js'];

// Patterns to find and replace
const pathPatterns = [
  // Replace absolute paths starting with /
  { 
    pattern: /(src|href)="\/([^"]+\.(?:png|jpg|jpeg|gif|svg|mp4|wav|mp3|css|js))"?/gi,
    replacement: '$1="$2"'
  },
  // Replace paths with /assets/ to use relative path
  { 
    pattern: /(src|href)="([^"]*\/)?assets\/([^"]+)"/gi,
    replacement: '$1="../assets/$3"'
  },
  // Fix paths in CSS url()
  { 
    pattern: /url\(['"]?\/([^'")]+)['"]?\)/gi,
    replacement: 'url(../$1)'
  }
];

// Function to process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Apply all path patterns
    pathPatterns.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement);
    });
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated paths in: ${path.relative(rootDir, filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Recursively process all files in a directory
function processDirectory(directory) {
  let fileCount = 0;
  
  try {
    const files = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(directory, file.name);
      
      if (file.isDirectory()) {
        // Skip node_modules and .git directories
        if (file.name === 'node_modules' || file.name === '.git') {
          continue;
        }
        fileCount += processDirectory(fullPath);
      } else if (fileExtensions.includes(path.extname(file.name).toLowerCase())) {
        if (processFile(fullPath)) {
          fileCount++;
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error.message);
  }
  
  return fileCount;
}

// Main function
function main() {
  console.log('Fixing relative paths in project files...');
  const startTime = Date.now();
  
  const filesUpdated = processDirectory(rootDir);
  
  const timeElapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ Fixed paths in ${filesUpdated} files in ${timeElapsed} seconds`);
  
  // Special case: Fix loading handler script separately
  const loadingHandlerPath = path.join(rootDir, 'scripts', 'loading-handler.js');
  if (fs.existsSync(loadingHandlerPath)) {
    let content = fs.readFileSync(loadingHandlerPath, 'utf8');
    content = content.replace(
      /src=["']\.\.\/assets\/LoadingHeart\.gif["']/,
      'src="../assets/LoadingHeart.gif"'
    );
    fs.writeFileSync(loadingHandlerPath, content, 'utf8');
    console.log('✅ Updated loading handler script');
  }
}

// Run the script
main();
