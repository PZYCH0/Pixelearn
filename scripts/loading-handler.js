/**
 * Loading Screen Handler
 * This script handles the loading screen functionality across all pages
 */

// Add loading screen styles
const loadingStyles = `
.loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(26, 26, 46, 0.95);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    transition: opacity 0.5s ease-out, visibility 0.5s ease-out;
}

.loading-content {
    text-align: center;
    padding: 2rem;
    max-width: 90%;
    width: 300px;
}

.heart-container {
    margin: 0 auto 1.5rem;
    width: 150px;
    height: 150px;
    position: relative;
}

.heart-pulse {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 0 20px rgba(255, 0, 255, 0.8));
}

.loading-text {
    font-family: 'Press Start 2P', cursive;
    color: #fff;
    font-size: 1rem;
    margin-bottom: 0.5rem;
    text-shadow: 0 0 10px rgba(255, 0, 255, 0.7);
    letter-spacing: 1px;
}

.loading-message {
    color: #ccc;
    font-style: italic;
    font-size: 0.9rem;
    margin-top: 0.5rem;
}

/* Hide when loaded */
body.loaded .loading-screen {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
}
`;

// Add styles to head
const styleElement = document.createElement('style');
styleElement.textContent = loadingStyles;
document.head.appendChild(styleElement);

// Load the Press Start 2P font
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

document.addEventListener('DOMContentLoaded', function() {
    // Create loading screen HTML
    const loadingScreenHTML = `
    <div class="loading-screen">
        <div class="loading-content">
            <div class="heart-container">
                <img src="assets/LoadingHeart.gif" alt="Loading..." class="heart-pulse">
            </div>
            <div class="loading-text-container">
                <p class="loading-text">Loading Your Experience</p>
                <p class="loading-message">Preparing something amazing...</p>
            </div>
        </div>
    </div>`;

    // Add loading screen to the body
    document.body.insertAdjacentHTML('afterbegin', loadingScreenHTML);

    // Add loaded class to body when everything is loaded
    window.addEventListener('load', function() {
        // Add a small delay to ensure all assets are loaded
        setTimeout(function() {
            document.body.classList.add('loaded');
            // Remove loading screen from DOM after animation completes
            setTimeout(function() {
                const loadingScreen = document.querySelector('.loading-screen');
                if (loadingScreen) {
                    loadingScreen.remove();
                }
            }, 500); // Match this with CSS transition duration
        }, 1000); // Minimum display time for loading screen
    });
});
