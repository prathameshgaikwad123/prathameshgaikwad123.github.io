/* ===================================================
   PORTFOLIO RESUME — JavaScript
   Theme Toggle | Scroll Animations | Mobile Menu
   =================================================== */

(function () {
    'use strict';

    // ---------- THEME MANAGEMENT ----------
    const STORAGE_KEY = 'portfolio-theme';
    const html = document.documentElement;
    const toggleBtn = document.getElementById('theme-toggle');

    /**
     * Get the user's preferred theme.
     * Priority: localStorage > system preference > 'light'
     */
    function getPreferredTheme() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') return stored;

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    }

    /**
     * Apply the theme to the document
     */
    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);

        // Update favicon emoji if desired
        const emoji = theme === 'dark' ? '🌙' : '☀️';
    }

    /**
     * Toggle between light and dark themes
     */
    function toggleTheme() {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);

        // Add a small bounce animation to the toggle button
        toggleBtn.style.transform = 'scale(0.85)';
        setTimeout(() => {
            toggleBtn.style.transform = '';
        }, 150);
    }

    // Initialize theme
    applyTheme(getPreferredTheme());

    // Toggle button click
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
    }

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem(STORAGE_KEY)) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // ---------- SCROLL ANIMATIONS ----------
    function initScrollAnimations() {
        const sections = document.querySelectorAll('.section');

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.style.animationPlayState = 'running';
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.1,
                    rootMargin: '0px 0px -40px 0px',
                }
            );

            sections.forEach((section) => {
                section.style.animationPlayState = 'paused';
                observer.observe(section);
            });
        } else {
            // Fallback: show all sections
            sections.forEach((section) => {
                section.style.opacity = '1';
            });
        }
    }

    // ---------- LANGUAGE BAR ANIMATION ----------
    function initLanguageBars() {
        const fills = document.querySelectorAll('.language-fill');

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const fill = entry.target;
                            const width = fill.style.width;
                            fill.style.width = '0%';
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    fill.style.width = width;
                                });
                            });
                            observer.unobserve(fill);
                        }
                    });
                },
                { threshold: 0.5 }
            );

            fills.forEach((fill) => observer.observe(fill));
        }
    }

    // ---------- SMOOTH SCROLL FOR ANCHOR LINKS ----------
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    });
                }
            });
        });
    }

    // ---------- ACTIVE SECTION HIGHLIGHT (optional nav) ----------
    function initActiveHighlight() {
        const sections = document.querySelectorAll('.section[id]');

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const id = entry.target.id;
                            // Remove active class from all
                            document.querySelectorAll('.nav-link').forEach((link) => {
                                link.classList.remove('active');
                            });
                            // Add active class to current
                            const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                            if (activeLink) activeLink.classList.add('active');
                        }
                    });
                },
                { threshold: 0.3 }
            );

            sections.forEach((section) => observer.observe(section));
        }
    }

    // ---------- KEYBOARD SHORTCUT ----------
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Press 'D' to toggle dark mode (when not typing in an input)
            if (e.key === 'd' && !isTyping(e)) {
                toggleTheme();
            }
        });
    }

    function isTyping(e) {
        const tag = e.target.tagName.toLowerCase();
        return tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
    }

    // ---------- INITIALIZE EVERYTHING ----------
    document.addEventListener('DOMContentLoaded', () => {
        initScrollAnimations();
        initLanguageBars();
        initSmoothScroll();
        initActiveHighlight();
        initKeyboardShortcuts();
    });

})();
