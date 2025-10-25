    /* Shared site JavaScript: mobile menu, smooth scrolling, and active nav highlighting */

    document.addEventListener('DOMContentLoaded', () => {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');

        let menuOpen = false;

        function closeMenu() {
            if (navLinks) {
                navLinks.classList.remove('active');
                navLinks.style.display = '';
            }
            if (mobileMenuBtn) mobileMenuBtn.textContent = '☰';
            menuOpen = false;
        }

        function openMenu() {
            if (navLinks) {
                navLinks.classList.add('active');
                navLinks.style.display = 'flex';
            }
            if (mobileMenuBtn) mobileMenuBtn.textContent = '✕';
            menuOpen = true;
        }

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (menuOpen) closeMenu();
                else openMenu();
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (
                menuOpen &&
                navLinks &&
                !navLinks.contains(e.target) &&
                mobileMenuBtn &&
                !mobileMenuBtn.contains(e.target)
            ) {
                closeMenu();
            }
        });

        // Smooth scrolling for same-page anchors
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (!targetId || targetId === '#') return;
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const headerOffset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    // close mobile menu on small screens
                    if (window.innerWidth < 768) closeMenu();
                }
            });
        });

        // Active nav highlighting (works across pages)
        function highlightActiveNav() {
            const links = document.querySelectorAll('.nav-links a');
            const currentPath = window.location.pathname.split('/').pop() || 'index.html';

            links.forEach((link) => {
                link.classList.remove('active');
                link.style.color = '';

                try {
                    const href = link.getAttribute('href');
                    if (!href) return;

                    // If link is an anchor, handle via hash
                    if (href.startsWith('#')) {
                        if (window.location.hash === href) {
                            link.classList.add('active');
                            link.style.color = getComputedStyle(document.documentElement).getPropertyValue('--primary') || '';
                        }
                        return;
                    }

                    const linkFile = href.split('/').pop();
                    // treat empty path as index
                    if ((linkFile === '' && currentPath === 'index.html') || linkFile === currentPath) {
                        link.classList.add('active');
                        link.style.color = getComputedStyle(document.documentElement).getPropertyValue('--primary') || '';
                    }
                } catch (err) {
                    // ignore malformed hrefs
                }
            });
        }

        highlightActiveNav();
        window.addEventListener('popstate', highlightActiveNav);
        window.addEventListener('hashchange', highlightActiveNav);

            // Reveal-on-scroll: add 'visible' to elements with .reveal when they enter viewport
            (function addRevealObserver(){
                const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                const items = document.querySelectorAll('.reveal');
                if (!items || items.length === 0) return;

                if (prefersReduced) {
                    items.forEach(el => el.classList.add('visible'));
                    return;
                }

                const obs = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                            observer.unobserve(entry.target);
                        }
                    });
                }, {root:null,rootMargin:'0px 0px -8% 0px',threshold:0.06});

                items.forEach(el => obs.observe(el));
            })();
    });
