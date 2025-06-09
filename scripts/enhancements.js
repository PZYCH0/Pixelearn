// ========================================
// ENHANCED FEATURES - JavaScript
// ========================================

document.addEventListener("DOMContentLoaded", function() {
    // Page loading animation
    const pixelLoader = document.querySelector('.pixel-loader');
    if (pixelLoader) {
        setTimeout(() => {
            pixelLoader.classList.add('hidden');
            setTimeout(() => {
                pixelLoader.style.display = 'none';
            }, 500);
        }, 1500); // Show loader for 1.5 seconds
    }

    // Highlight active section in navbar
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar nav a');
    
    function highlightActiveSection() {
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                // Remove active class from all links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to corresponding navbar link
                const activeLink = document.querySelector(`.navbar nav a[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }
    
    // Highlight section on scroll
    window.addEventListener('scroll', highlightActiveSection);
    
    // Initial highlight
    highlightActiveSection();
    
    // Animate sections when they come into view
    function animateSectionsOnScroll() {
        const sectionElements = document.querySelectorAll('section');
        
        sectionElements.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (sectionTop < windowHeight * 0.75) {
                section.classList.add('visible');
            }
        });
    }
    
    // Initial animation check
    animateSectionsOnScroll();
    
    // Check for animations on scroll
    window.addEventListener('scroll', animateSectionsOnScroll);
    
    // Smooth scrolling for anchor links with offset for fixed navbar
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href').length > 1) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});
