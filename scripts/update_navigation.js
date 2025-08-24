// Script to update navigation across all HTML files
const fs = require('fs');
const path = require('path');

// Define the new navigation HTML
const newNavHTML = `
    <!-- Top Navigation Bar -->
    <nav class="top-navbar">
        <div class="top-nav-container">
            <div class="nav-logo">
                <a href="index.html" class="logo-link">
                    <img src="../assets/15.png" alt="Pixelearn Logo" class="logo-img">
                    <span class="logo-text">Pixelearn</span>
                </a>
            </div>
            <div class="nav-links">
                <a href="index.html" class="nav-link">Home</a>
                <a href="index.html#lessons" class="nav-link">Videos</a>
                <a href="index.html#articles" class="nav-link">Articles</a>
                <a href="index.html#games" class="nav-link">Toolkit</a>
                <a href="index.html#about" class="nav-link">About</a>
            </div>
            <div class="nav-mobile-toggle" id="mobileMenuToggle">
                <i class="fas fa-bars"></i>
            </div>
        </div>
    </nav>

    <!-- Mobile Menu -->
    <div class="mobile-menu" id="mobileMenu">
        <div class="mobile-menu-content">
            <a href="index.html" class="mobile-nav-link">Home</a>
            <a href="index.html#lessons" class="mobile-nav-link">Videos</a>
            <a href="index.html#articles" class="mobile-nav-link">Articles</a>
            <a href="index.html#games" class="mobile-nav-link">Toolkit</a>
            <a href="index.html#about" class="mobile-nav-link">About</a>
        </div>
    </div>`;

// List of files to update (relative to project root)
const filesToUpdate = [
    'ActivityManagerMain.html',
    'ClassroomChampion.html',
    'PunkdoroMain.html',
    'TicTacTense.html',
    'To_Do.html',
    'coming_soon.html',
    'embed.html',
    'games/leaderboard.html',
    'games/wheel_of_fortune.html',
    'games/XO.html',
    'games/ActivityManager.html',
    'games/Punkdoro.html',
    'games/ToPunk.html',
    'games/PunkBag.html',
    'games/EXO.html',
    'games/coming_soon.html',
    'games/teacher_activity_timer (1).html'
];

// Function to update navigation in a file
function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remove existing navigation
        content = content.replace(/<!-- Top Navigation Bar -->[\s\S]*?<\/nav>\s*<!-- Mobile Menu -->[\s\S]*?<\/div>/, '');
        
        // Add new navigation before the first <section> or <div class="container">
        content = content.replace(/(<body[^>]*>)([\s\S]*?)(<section|<div class="container")/i, 
            (match, p1, p2, p3) => {
                return `${p1}${newNavHTML}${p2}${p3}`;
            }
        );
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated navigation in ${filePath}`);
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
    }
}

// Process all files
console.log('🚀 Starting navigation update...\n');
filesToUpdate.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        updateFile(filePath);
    } else {
        console.log(`⚠️  File not found: ${filePath}`);
    }
});

console.log('\n✨ Navigation update complete!');
