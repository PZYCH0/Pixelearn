const fs = require('fs');
const path = require('path');

// List of game files to update
const gameFiles = [
    'ActivityManager.html',
    'coming_soon.html',
    'EXO.html',
    'leaderboard.html',
    'PunkBag.html',
    'Punkdoro.html',
    'teacher_activity_timer (1).html',
    'ToPunk.html',
    'wheel_of_fortune.html',
    'XO.html'
];

// Navigation HTML to insert
const navHTML = `
    <!-- Side Navigation Button -->
    <div class="side-nav-button">
        <button id="toggleSideNav" aria-label="Open navigation menu">
            <img src="../assets/pixilart-drawing.png" alt="Menu" class="pixel-nav-icon">
        </button>
    </div>
    
    <!-- Side Navigation Panel -->
    <div id="sideNavPanel" class="side-nav-panel">
        <button class="close-side-nav" aria-label="Close navigation menu">
            <i class="fas fa-times"></i>
        </button>
        <div class="side-nav-content">
            <a href="../index.html" class="side-nav-link">Home</a>
            <a href="../index.html#games" class="side-nav-link">Learning Games</a>
            <a href="../index.html#portfolio" class="side-nav-link">Teaching Portfolio</a>
            <a href="../index.html#articles" class="side-nav-link">Articles</a>
            <a href="../index.html#about" class="side-nav-link">About Me</a>
            <a href="../index.html#contact" class="side-nav-link">Contact</a>
        </div>
    </div>`;

// Navigation script to insert
const navScript = `
    // Initialize side navigation
    document.addEventListener('DOMContentLoaded', function() {
        const toggleButton = document.getElementById('toggleSideNav');
        const sideNav = document.getElementById('sideNavPanel');
        const closeButton = document.querySelector('.close-side-nav');
        const body = document.body;

        if (toggleButton && sideNav && closeButton) {
            toggleButton.addEventListener('click', function() {
                body.classList.toggle('side-nav-open');
                sideNav.classList.toggle('open');
            });

            closeButton.addEventListener('click', function() {
                body.classList.remove('side-nav-open');
                sideNav.classList.remove('open');
            });
        }
    });`;

// Function to update a single file
function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Add CSS link if not present
        if (!content.includes('side-nav.css')) {
            content = content.replace(
                /(<link[^>]*>)/,
                `$1\n    <link rel="stylesheet" href="side-nav.css">`
            );
        }
        
        // Add navigation HTML if not present
        if (!content.includes('side-nav-button')) {
            content = content.replace(
                /(<body[^>]*>)/,
                `$1\n${navHTML}`
            );
        }
        
        // Add navigation script if not present
        if (!content.includes('toggleSideNav')) {
            // Try to find the closing </script> tag before </body>
            const scriptTag = content.match(/<\/script>\s*<\/body>/);
            if (scriptTag) {
                content = content.replace(
                    /<\/script>\s*<\/body>/,
                    `${navScript}\n    </script>\n</body>`
                );
            } else {
                // If no script tag found, add before </body>
                content = content.replace(
                    /<\/body>/,
                    `    <script>${navScript}\n    </script>\n</body>`
                );
            }
        }
        
        // Save the updated file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated ${filePath}`);
        return true;
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
        return false;
    }
}

// Process all game files
console.log('🚀 Starting navigation update...');
const updatedFiles = [];
const failedFiles = [];

gameFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        if (updateFile(filePath)) {
            updatedFiles.push(file);
        } else {
            failedFiles.push(file);
        }
    } else {
        console.log(`⚠️  File not found: ${file}`);
        failedFiles.push(file);
    }
});

// Print summary
console.log('\n📊 Update Summary:');
console.log(`✅ Successfully updated: ${updatedFiles.length} files`);
if (updatedFiles.length > 0) {
    console.log('   - ' + updatedFiles.join('\n   - '));
}

if (failedFiles.length > 0) {
    console.log(`\n❌ Failed to update: ${failedFiles.length} files`);
    console.log('   - ' + failedFiles.join('\n   - '));
}

console.log('\n✨ Update complete!');
