    /* Shared site JavaScript: mobile menu, smooth scrolling, and active nav highlighting */

    document.addEventListener('DOMContentLoaded', () => {
        // preserve the initial document title so client-side navigation doesn't change the browser tab text
        const originalTitle = document.title;
        /* Theme initialization and toggle handlers
           - Reads from localStorage 'theme' (values: 'dark'|'light')
           - If not set, uses system preference
           - Applies/removes 'dark' class on <html>
           - Wires .theme-btn.light and .theme-btn.dark buttons
        */
        (function initTheme(){
            const root = document.documentElement;
            const stored = localStorage.getItem('theme');
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initial = stored === 'dark' || stored === 'light' ? stored : 'dark';

            function applyTheme(mode){
                if(mode === 'dark') root.classList.add('dark');
                else root.classList.remove('dark');
                // update active states on buttons if present
                const btnLight = document.querySelector('.theme-btn.light');
                const btnDark = document.querySelector('.theme-btn.dark');
                if(btnLight) btnLight.classList.toggle('active', mode === 'light');
                if(btnDark) btnDark.classList.toggle('active', mode === 'dark');
                if(btnLight) btnLight.setAttribute('aria-pressed', String(mode === 'light'));
                if(btnDark) btnDark.setAttribute('aria-pressed', String(mode === 'dark'));
            }

            // Apply initial theme early
            applyTheme(initial);

            // Wire buttons (if present) to toggle and persist
            document.addEventListener('click', (e) => {
                const t = e.target;
                // allow clicks on the icon inside the button too
                const btn = t.closest && t.closest('.theme-btn');
                if(!btn) return;
                if(btn.classList.contains('light')){
                    localStorage.setItem('theme','light');
                    applyTheme('light');
                } else if(btn.classList.contains('dark')){
                    localStorage.setItem('theme','dark');
                    applyTheme('dark');
                }
            });

            // keep theme in sync if system preference changes and user hasn't explicitly chosen
            try{
                const mq = window.matchMedia('(prefers-color-scheme: dark)');
                mq.addEventListener && mq.addEventListener('change', (ev) => {
                    const storedVal = localStorage.getItem('theme');
                    if(storedVal !== 'light' && storedVal !== 'dark'){
                        applyTheme(ev.matches ? 'dark' : 'light');
                    }
                });
            } catch(err){/* older browsers ignore */}
        })();
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');

        let menuOpen = false;

        function closeMenu() {
            if (navLinks) {
                navLinks.classList.remove('active');
            }
            if (mobileMenuBtn) mobileMenuBtn.textContent = '☰';
            menuOpen = false;
        }

        function openMenu() {
            if (navLinks) {
                navLinks.style.display = 'flex';
                // Force reflow to trigger transition
                navLinks.offsetHeight;
                navLinks.classList.add('active');
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

        // Close menu when clicking on any nav link
        if (navLinks) {
            const navLinkItems = navLinks.querySelectorAll('a');
            navLinkItems.forEach((link) => {
                link.addEventListener('click', () => {
                    closeMenu();
                });
            });
        }

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

            function normalizeName(input) {
                if (!input) return 'index';
                // start with input as string
                let name = String(input);
                // strip query/hash
                name = name.split('?')[0].split('#')[0];
                // remove trailing slash(es)
                name = name.replace(/\/+$/, '');
                // take last segment
                const parts = name.split('/');
                name = parts.pop() || parts.pop() || '';
                // remove .html extension if present
                name = name.replace(/\.html$/i, '');
                return name || 'index';
            }

            const currentName = normalizeName(window.location.pathname);

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

                    const linkName = normalizeName(href);
                    if (linkName === currentName) {
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
            function addRevealObserver(){
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
            }

            // run reveal observer initially
            addRevealObserver();

            // --- SPA-like client-side navigation (load .html into <main> without full page reload) ---
            function loadPage(fetchUrl, addToHistory = true){
                // Add fade-out and slide-out transition to main content
                const mainEl = document.querySelector('main');
                if (mainEl) {
                    mainEl.style.opacity = '0';
                    mainEl.style.transform = 'translateX(30px)';
                    mainEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                }

                // ensure URL is relative or absolute; fetch will resolve relative paths correctly
                fetch(fetchUrl, {cache: 'no-cache'})
                    .then(resp => {
                        if (!resp.ok) throw new Error('Network response was not ok');
                        return resp.text();
                    })
                    .then(html => {
                        // Wait for fade-out to complete
                        setTimeout(() => {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(html, 'text/html');
                            const newMain = doc.querySelector('main');
                            if (newMain && mainEl) {
                                mainEl.innerHTML = newMain.innerHTML;
                                // Start new content from left position
                                mainEl.style.transform = 'translateX(-30px)';
                                mainEl.style.opacity = '0';
                                // Slide in from left to right and fade in
                                setTimeout(() => {
                                    mainEl.style.opacity = '1';
                                    mainEl.style.transform = 'translateX(0)';
                                }, 10);
                            }
                            // do NOT change document.title here — keep the original tab name
                            if (addToHistory) history.pushState({path: fetchUrl}, '', fetchUrl);
                            // run/restore behaviors for the newly injected content
                            highlightActiveNav();
                            addRevealObserver();
                            // close mobile menu if open (small screens) with smooth transition
                            if (navLinks && navLinks.classList.contains('active')){
                                closeMenu();
                            }
                            window.scrollTo({top:0,behavior:'smooth'});
                        }, 300);
                    })
                    .catch(err => {
                        // fallback to full navigation if fetch fails
                        console.error('AJAX navigation failed, falling back to full load', err);
                        window.location.href = fetchUrl;
                    });
            }

            // Intercept clicks on internal .html links and load via AJAX
            document.addEventListener('click', (e) => {
                const a = e.target.closest && e.target.closest('a');
                if (!a) return;
                // ignore external links, anchors, and downloads
                const href = a.getAttribute('href');
                if (!href) return;
                if (href.startsWith('#')) return; // let anchor behavior happen
                if (a.target === '_blank' || a.hasAttribute('download')) return;

                // Only intercept same-origin .html links or plain filenames (e.g., services.html)
                try{
                    const url = new URL(href, location.href);
                    if (url.origin !== location.origin) return;
                } catch(err){
                    // malformed URL — ignore
                    return;
                }

                if (href.match(/\.html($|\?)/i) || href === 'index.html'){
                    e.preventDefault();
                    loadPage(href, true);
                }
            });

            // handle back/forward navigation
            window.addEventListener('popstate', (e) => {
                const path = location.pathname.split('/').pop() || 'index.html';
                loadPage(path, false);
            });
    });
