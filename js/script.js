/* ===================================================================
   PRATHAMESH GAIKWAD — PORTFOLIO
   Vanilla JS, no dependencies. Everything here is an enhancement:
   with JavaScript disabled the page is fully readable and navigable.

   1. Theme      light/dark, system-aware, persisted only on choice
   2. Header     hairline appears once the page has scrolled
   3. Nav        mobile panel with focus trap, Esc, focus restore
   4. Scrollspy  active nav link
   5. Reveal     one-shot entrance transitions
   6. GH chart   hide the figure if the third-party service is down
   7. Year       footer copyright
   =================================================================== */

(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');


    /* ---------- 1. THEME ------------------------------------------- */

    var THEME_KEY = 'pg-theme';
    var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    var toggle = document.getElementById('theme-toggle');

    function readStored() {
        try {
            var v = localStorage.getItem(THEME_KEY);
            return (v === 'light' || v === 'dark') ? v : null;
        } catch (e) {
            return null;
        }
    }

    /* The theme actually being displayed, whether it came from a stored
       choice or from the operating system. */
    function activeTheme() {
        var attr = root.getAttribute('data-theme');
        if (attr === 'light' || attr === 'dark') return attr;
        return darkQuery.matches ? 'dark' : 'light';
    }

    function describe() {
        if (!toggle) return;
        var next = activeTheme() === 'dark' ? 'light' : 'dark';
        toggle.setAttribute('aria-label', 'Switch to ' + next + ' theme');
        toggle.setAttribute('title', 'Switch to ' + next + ' theme');
    }

    if (toggle) {
        describe();

        toggle.addEventListener('click', function () {
            var next = activeTheme() === 'dark' ? 'light' : 'dark';

            /* Backgrounds flip instantly while text colour would animate,
               which puts some text briefly at low contrast against the new
               background. Suppress transitions for the swap itself. */
            root.classList.add('theme-switch');
            root.setAttribute('data-theme', next);
            requestAnimationFrame(function () {
                requestAnimationFrame(function () { root.classList.remove('theme-switch'); });
            });

            /* Storage is written only here — on a deliberate choice — so an
               untouched visit keeps following the system preference. */
            try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
            describe();
        });
    }

    /* Follow the system while the visitor has never chosen for themselves. */
    function onSystemChange() {
        if (!readStored()) {
            root.removeAttribute('data-theme');
            describe();
        }
    }

    if (typeof darkQuery.addEventListener === 'function') {
        darkQuery.addEventListener('change', onSystemChange);
    } else if (typeof darkQuery.addListener === 'function') {
        darkQuery.addListener(onSystemChange);           /* Safari < 14 */
    }


    /* ---------- 2. HEADER ----------------------------------------- */

    var header = document.getElementById('site-header');

    if (header) {
        var scrolled = false;

        var onScroll = function () {
            var next = window.scrollY > 8;
            if (next !== scrolled) {
                scrolled = next;
                header.classList.toggle('is-scrolled', next);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }


    /* ---------- 3. MOBILE NAV ------------------------------------- */

    var navToggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('site-nav');

    if (navToggle && nav) {
        var FOCUSABLE = 'a[href], button:not([disabled])';
        var lastFocused = null;

        var isOpen = function () {
            return navToggle.getAttribute('aria-expanded') === 'true';
        };

        var openNav = function () {
            var previous = document.activeElement;
            /* document.body is not a useful place to return focus to. */
            lastFocused = (previous && previous !== document.body) ? previous : navToggle;

            navToggle.setAttribute('aria-expanded', 'true');
            navToggle.setAttribute('aria-label', 'Close menu');
            nav.classList.add('is-open');
            document.body.classList.add('is-locked');

            /* The panel starts at visibility:hidden, and a hidden element
               cannot take focus — so wait for the style change to land. */
            requestAnimationFrame(function () {
                var first = nav.querySelector(FOCUSABLE);
                if (first) first.focus();
                if (document.activeElement !== first) navToggle.focus();
            });
        };

        var closeNav = function (restore) {
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Open menu');
            nav.classList.remove('is-open');
            document.body.classList.remove('is-locked');

            if (restore) {
                var back = (lastFocused && document.contains(lastFocused)) ? lastFocused : navToggle;
                back.focus();
                if (document.activeElement !== back) navToggle.focus();
            }
            lastFocused = null;
        };

        navToggle.addEventListener('click', function () {
            isOpen() ? closeNav(true) : openNav();
        });

        /* Jumping to a section should dismiss the panel. */
        nav.addEventListener('click', function (e) {
            if (e.target.closest('a') && isOpen()) closeNav(false);
        });

        document.addEventListener('keydown', function (e) {
            if (!isOpen()) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                closeNav(true);
                return;
            }

            if (e.key !== 'Tab') return;

            /* Keep focus inside the panel and the button that opened it. */
            var items = [].slice.call(nav.querySelectorAll(FOCUSABLE)).concat([navToggle]);
            if (!items.length) return;

            var first = items[0];
            var last = items[items.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });

        /* Reaching the desktop breakpoint retires the panel entirely. */
        var wide = window.matchMedia('(min-width: 62rem)');
        var onWide = function (e) { if (e.matches && isOpen()) closeNav(false); };

        if (typeof wide.addEventListener === 'function') {
            wide.addEventListener('change', onWide);
        } else if (typeof wide.addListener === 'function') {
            wide.addListener(onWide);
        }
    }


    /* ---------- 4. SCROLLSPY -------------------------------------- */

    var navLinks = [].slice.call(document.querySelectorAll('.site-nav__link[href^="#"]'));

    if (navLinks.length && 'IntersectionObserver' in window) {
        var targets = navLinks
            .map(function (link) {
                var id = link.getAttribute('href').slice(1);
                var el = id && document.getElementById(id);
                return el ? { link: link, el: el } : null;
            })
            .filter(Boolean);

        if (targets.length) {
            var visible = new Set();

            var paint = function () {
                /* When several sections are on screen, the highest one wins. */
                var winner = targets
                    .filter(function (t) { return visible.has(t.el); })
                    .sort(function (a, b) {
                        return a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top;
                    })[0];

                navLinks.forEach(function (link) {
                    link.classList.toggle('is-active', !!winner && link === winner.link);
                });
            };

            var spy = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) visible.add(entry.target);
                    else visible.delete(entry.target);
                });
                paint();
            }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });

            targets.forEach(function (t) { spy.observe(t.el); });
        }
    }


    /* ---------- 5. REVEAL ----------------------------------------- */

    var revealables = [].slice.call(document.querySelectorAll('[data-reveal]'));

    function showAll() {
        revealables.forEach(function (el) { el.classList.add('is-in'); });
    }

    if (!revealables.length) {
        /* nothing to do */
    } else if (reduceMotion.matches || !('IntersectionObserver' in window)) {
        showAll();
    } else {
        var reveal = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                obs.unobserve(entry.target);
            });
            /* Fires as soon as any part of the element enters, minus a small
               bottom inset. Tall blocks (a project is ~1000px on desktop)
               would otherwise still be fading in by the time they are read. */
        }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });

        revealables.forEach(function (el) { reveal.observe(el); });

        /* Anything already in view on load should not wait for a scroll. */
        requestAnimationFrame(function () {
            revealables.forEach(function (el) {
                if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
            });
        });
    }

    /* Switching reduced-motion on mid-session must not leave content hidden. */
    if (typeof reduceMotion.addEventListener === 'function') {
        reduceMotion.addEventListener('change', function (e) { if (e.matches) showAll(); });
    }


    /* ---------- 6. GITHUB CHART FALLBACK -------------------------- */
    /* The contribution chart comes from ghchart.rshah.org. If that service
       is unreachable, hide the whole figure rather than leaving a broken
       image in the middle of the page. */

    var chart = document.getElementById('gh-chart');

    if (chart) {
        var chartImg = chart.querySelector('img');

        if (chartImg) {
            var dropChart = function () { chart.hidden = true; };

            chartImg.addEventListener('error', dropChart);

            /* A cached failure can complete before this listener attaches. */
            if (chartImg.complete && chartImg.naturalWidth === 0) dropChart();
        }
    }


    /* ---------- 7. FOOTER YEAR ------------------------------------ */

    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

})();
