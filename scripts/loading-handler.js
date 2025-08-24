/**
 * Loading Screen Handler
 * This script handles the loading screen functionality across all pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create loading screen HTML
    const loadingScreenHTML = `
    <div class="loading-screen">
        <div class="loading-content">
            <div class="heart-container">
                <img src="../assets/LoadingHeart.gif" alt="Loading..." class="heart-pulse">
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
