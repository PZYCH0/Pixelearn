const fs = require('fs');
const path = require('path');

// Navigation bar HTML template
const navBarHTML = `
    <!-- Top Navigation Bar -->
    <nav class="top-navbar">
        <div class="top-nav-container">
            <div class="nav-logo">
                <a href="../index.html" class="logo-link">
                    <img src="../assets/15.png" alt="Pixelearn Logo" class="logo-img">
                    <span class="logo-text">Pixelearn</span>
                </a>
            </div>
            <div class="nav-links">
                <a href="../index.html" class="nav-link">Home</a>
                <a href="../index.html#lessons" class="nav-link">Videos</a>
                <a href="../index.html#articles" class="nav-link active">Articles</a>
                <a href="../index.html#games" class="nav-link">Toolkit</a>
                <a href="../index.html#about" class="nav-link">About</a>
            </div>
            <div class="nav-mobile-toggle" id="mobileMenuToggle">
                <i class="fas fa-bars"></i>
            </div>
        </div>
    </nav>

    <!-- Mobile Menu -->
    <div class="mobile-menu" id="mobileMenu">
        <div class="mobile-menu-content">
            <a href="../index.html" class="mobile-nav-link">Home</a>
            <a href="../index.html#lessons" class="mobile-nav-link">Videos</a>
            <a href="../index.html#articles" class="mobile-nav-link active">Articles</a>
            <a href="../index.html#games" class="mobile-nav-link">Toolkit</a>
            <a href="../index.html#about" class="mobile-nav-link">About</a>
        </div>
    </div>`;

// Mobile menu toggle script
const mobileMenuScript = `
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const mobileMenuToggle = document.getElementById('mobileMenuToggle');
            const mobileMenu = document.getElementById('mobileMenu');
            
            if (mobileMenuToggle && mobileMenu) {
                mobileMenuToggle.addEventListener('click', function() {
                    mobileMenu.classList.toggle('active');
                    this.classList.toggle('active');
                });
            }
            
            // Close mobile menu when clicking on a link
            const mobileLinks = document.querySelectorAll('.mobile-menu-content a');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                });
            });
        });
    </script>`;

// Function to process all HTML files in the Articles directory
function updateArticleNavs() {
    const articlesDir = path.join(__dirname, '..', 'Articles');
    const files = fs.readdirSync(articlesDir);
    
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const filePath = path.join(articlesDir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Remove any existing navigation
            content = content.replace(/<!-- Top Navigation Bar -->[\s\S]*?<\/div>\s*<\/nav>\s*<!-- \/Top Navigation Bar -->/g, '');
            content = content.replace(/<!-- Mobile Menu -->[\s\S]*?<\/div>\s*<\/div>\s*<!-- \/Mobile Menu -->/g, '');
            
            // Add new navigation after the opening body tag
            content = content.replace(
                /<body[^>]*>([\s\S]*?)(<div[^>]*class=["']pixel-cloud["']|$)/,
                (match, p1, p2) => {
                    return `${match.startsWith('<body') ? match : '<body>'}${navBarHTML}${p2 || ''}`;
                }
            );
            
            // Add mobile menu script before the closing body tag
            if (!content.includes('mobileMenuToggle')) {
                content = content.replace('</body>', `${mobileMenuScript}\n</body>`);
            }
            
            // Save the updated file
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated navigation in: ${file}`);
        }
    });
    
    console.log('Navigation update complete!');
}

// Run the update
updateArticleNavs();
