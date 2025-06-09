/**
 * Pixelearn Side Navigation Panel
 * Controls the side pop-up navigation panel behavior
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const toggleButton = document.getElementById('toggleSideNav');
    const closeButton = document.querySelector('.close-side-nav');
    const sideNavPanel = document.getElementById('sideNavPanel');
    const navLinks = document.querySelectorAll('.side-nav-link');
    
    // Toggle side navigation panel
    toggleButton.addEventListener('click', function() {
        sideNavPanel.classList.add('open');
    });
    
    // Close side navigation panel
    closeButton.addEventListener('click', function() {
        sideNavPanel.classList.remove('open');
    });
    
    // Close when clicking a navigation link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            sideNavPanel.classList.remove('open');
            
            // Add active class to clicked link and remove from others
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Close when clicking outside the panel
    document.addEventListener('click', function(event) {
        if (!sideNavPanel.contains(event.target) && 
            !toggleButton.contains(event.target) && 
            sideNavPanel.classList.contains('open')) {
            sideNavPanel.classList.remove('open');
        }
    });
    
    // Set active link based on current section
    function setActiveNavLink() {
        const scrollPosition = window.scrollY + 100;
        
        document.querySelectorAll('section[id]').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(item => item.classList.remove('active'));
                
                const activeLink = document.querySelector(`.side-nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }
    
    // Update active link on scroll
    window.addEventListener('scroll', setActiveNavLink);
    
    // Set initial active link
    setActiveNavLink();
});
