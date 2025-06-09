/**
 * Pixelearn Enhanced Navbar Functionality
 * Implements transparent, closable navigation for both mobile and desktop
 */

document.addEventListener('DOMContentLoaded', function() {
    // Close navbar when clicking outside of it
    document.addEventListener('click', function(event) {
        const navbarCollapse = document.querySelector('#pixelearnNavbar');
        const navbarToggler = document.querySelector('.navbar-toggler');
        
        if (navbarCollapse && navbarCollapse.classList.contains('show') && 
            !navbarCollapse.contains(event.target) && 
            event.target !== navbarToggler && 
            !navbarToggler.contains(event.target)) {
            // Close the navbar by simulating a click on the toggler button
            navbarToggler.click();
        }
    });
    
    // Add click handler for close button
    const navbarCollapse = document.querySelector('#pixelearnNavbar');
    if (navbarCollapse) {
        // Close menu when clicking menu items
        const navLinks = navbarCollapse.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Only close menu on mobile
                if (window.innerWidth < 992) {
                    const navbarToggler = document.querySelector('.navbar-toggler');
                    if (navbarToggler && navbarCollapse.classList.contains('show')) {
                        navbarToggler.click();
                    }
                }
            });
        });
        
        // Add click event for the custom close button (::before pseudo element)
        // We need to track clicks on the navbar-collapse element itself
        navbarCollapse.addEventListener('click', function(e) {
            // Calculate if the click was on the close button (top-right area)
            const rect = navbarCollapse.getBoundingClientRect();
            const closeButtonArea = {
                top: rect.top + 20,   // Approximate position of the close button
                right: rect.right - 20,
                width: 30,
                height: 30
            };
            
            if (e.clientX >= closeButtonArea.right - closeButtonArea.width && 
                e.clientX <= closeButtonArea.right &&
                e.clientY >= closeButtonArea.top &&
                e.clientY <= closeButtonArea.top + closeButtonArea.height) {
                
                // If clicked in the close button area, close the menu
                const navbarToggler = document.querySelector('.navbar-toggler');
                if (navbarToggler) {
                    navbarToggler.click();
                }
                e.stopPropagation(); // Prevent event bubbling
            }
        });
    }
    
    // Adjust navbar transparency on scroll
    const navbar = document.querySelector('.custom-navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                // Make navbar slightly more opaque when scrolling
                navbar.style.backgroundColor = 'rgba(26, 26, 46, 0.6)';
                navbar.style.backdropFilter = 'blur(8px)';
            } else {
                // Reset to default transparency
                navbar.style.backgroundColor = 'rgba(26, 26, 46, 0.4)';
                navbar.style.backdropFilter = 'blur(5px)';
            }
        });
    }
});
