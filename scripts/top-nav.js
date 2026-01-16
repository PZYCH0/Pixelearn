document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const navbar = document.querySelector('.top-navbar');
    let lastScroll = 0;

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            this.classList.toggle('active');
        });

        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            });
        });
    }

    if (!navbar) return;

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        }

        if (currentScroll <= 0) {
            navbar.classList.remove('hide-nav');
            navbar.classList.add('show-nav');
        } else if (currentScroll > lastScroll && !navbar.classList.contains('hide-nav')) {
            navbar.classList.add('hide-nav');
            navbar.classList.remove('show-nav');
        } else if (currentScroll < lastScroll && navbar.classList.contains('hide-nav')) {
            navbar.classList.remove('hide-nav');
            navbar.classList.add('show-nav');
        }

        if (sections.length > 0) {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= (sectionTop - sectionHeight / 3)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href === `#${current}` || (current === '' && href === '#')) {
                    link.classList.add('active');
                }
            });
        }

        lastScroll = currentScroll;
    });
});
