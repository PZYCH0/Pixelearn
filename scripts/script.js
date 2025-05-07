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
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
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
