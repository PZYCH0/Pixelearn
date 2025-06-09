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

// Hamburger menu toggle for mobile navbar
// All navbar logic is now wrapped in DOMContentLoaded to ensure it runs after DOM is ready

document.addEventListener('DOMContentLoaded', () => {
  // Hamburger menu logic
  const menuToggle = document.querySelector('.menu-toggle');
  const navbar = document.querySelector('.navbar');

  if (menuToggle && navbar) {
    menuToggle.addEventListener('click', () => {
      navbar.classList.toggle('nav-open');
    });
    // Optional: close nav when a link is clicked (mobile UX)
    navbar.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', () => {
        navbar.classList.remove('nav-open');
      });
    });
  }

  // Scroll to top functionality
  const scrollToTopButton = document.getElementById('scroll-to-top');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    // Show/hide scroll to top button
    if (scrollToTopButton) {
      if (currentScroll > 300) {
        scrollToTopButton.classList.add('visible');
      } else {
        scrollToTopButton.classList.remove('visible');
      }
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

  if (scrollToTopButton) {
    scrollToTopButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

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
});


// Mobile menu toggle functionality with enhanced dropdown animation
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.navbar nav');
    const body = document.body;
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            // Toggle active class with animation
            navMenu.classList.toggle('active');
            body.classList.toggle('menu-open');
            menuToggle.classList.toggle('active');
            // Toggle animated drop on navbar
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                navbar.classList.toggle('open');
            }
            
            // Add a ripple effect to the button
            const ripple = document.createElement('span');
            ripple.classList.add('menu-ripple');
            menuToggle.appendChild(ripple);
            
            // Remove ripple after animation completes
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // Change icon based on menu state with enhanced animation
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('active')) {
                    // Menu opening animation
                    icon.style.transform = 'rotate(90deg) scale(1.2)';
                    setTimeout(() => {
                        icon.classList.remove('fa-bars');
                        icon.classList.add('fa-times');
                        icon.style.transform = 'rotate(0deg) scale(1)';
                    }, 150);
                } else {
                    // Menu closing animation
                    icon.style.transform = 'rotate(-90deg) scale(1.2)';
                    setTimeout(() => {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                        icon.style.transform = 'rotate(0deg) scale(1)';
                    }, 150);
                }
            }
        });
        
        // Close menu when clicking on a link with smooth transition
        const navLinks = document.querySelectorAll('.navbar nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                body.classList.remove('menu-open');
                
                // Reset icon with animation
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.style.transform = 'rotate(-90deg)';
                    setTimeout(() => {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                        icon.style.transform = 'rotate(0deg)';
                    }, 150);
                }
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                body.classList.remove('menu-open');
                
                // Reset icon
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.style.transform = 'rotate(-90deg)';
                    setTimeout(() => {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                        icon.style.transform = 'rotate(0deg)';
                    }, 150);
                }
            }
        });
    }
});
