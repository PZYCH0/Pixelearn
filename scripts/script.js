// Scroll to top functionality
const scrollToTopButton = document.getElementById('scroll-to-top');
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Show/hide scroll to top button
    if (currentScroll > 300) {
        scrollToTopButton.classList.add('visible');
    } else {
        scrollToTopButton.classList.remove('visible');
    }

    // Handle navbar hide/show
    if (currentScroll > lastScroll) {
        // Scrolling down
        navbar.classList.add('hide');
    } else {
        // Scrolling up
        navbar.classList.remove('hide');
    }
    
    lastScroll = currentScroll;
});

scrollToTopButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        // Check if the link is to a section on the current page (starts with #)
        // Or if it contains the current page's filename followed by a hash
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isCurrentPageSection = href.startsWith('#') || href.includes(currentPage + '#');

        if (isCurrentPageSection) {
            e.preventDefault();

            // Extract the section ID
            const sectionId = href.includes('#') ? '#' + href.split('#')[1] : href;
            const targetSection = document.querySelector(sectionId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
        // If it's a link to another page with a section, let the default behavior happen
    });
});

// Scroll animations
const scrollAnimationElements = document.querySelectorAll('.scroll-animation');

const checkScroll = () => {
    scrollAnimationElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight * 0.8) {
            element.classList.add('active');
        }
    });
};

// Initial check
checkScroll();

// Check on scroll
window.addEventListener('scroll', checkScroll);

// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.navbar nav');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            // Change icon based on menu state
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.navbar nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                
                // Reset icon
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
});
