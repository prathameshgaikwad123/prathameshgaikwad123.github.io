/* ===================================================================
   PRATHAMESH GAIKWAD — PORTFOLIO
   Vanilla JS, no dependencies. Everything here is an enhancement: with
   JavaScript disabled the page is a complete, readable document.

   0. Intro      one line, once per session, then the entrance is let go
   1. Theme      light/dark, system-aware, persisted only on choice
   2. Chrome     the floating plate gathers ground, scroll progress, and
                 the active section's ground travels with it
   3. Reveal     one entrance rule for the whole site, played once
   4. Menu       overlay navigation below 62rem, focus trapped
   5. Index      selected work: active row and the travelling plate
   6. Case       cross-document cover transition, image zoom
   7. GH chart   hide the figure if the third-party service is down
   8. Year       footer copyright
   =================================================================== */

(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    /* Matches the media query that turns on the travelling plate in CSS. */
    var stageQuery = window.matchMedia('(min-width: 62rem) and (hover: hover) and (pointer: fine)');
    var wide = window.matchMedia('(min-width: 62rem)');

    function onMedia(query, handler) {
        if (typeof query.addEventListener === 'function') query.addEventListener('change', handler);
        else if (typeof query.addListener === 'function') query.addListener(handler);  /* Safari < 14 */
    }

    /* One shared rAF slot per caller: handlers coalesce to one write. */
    function rafOnce() {
        var pending = false;
        var run = null;
        return function (fn) {
            run = fn;
            if (pending) return;
            pending = true;
            requestAnimationFrame(function () {
                pending = false;
                if (run) run();
            });
        };
    }

    function motionOK() { return !reduceMotion.matches; }


    /* ---------- 0. INTRO ------------------------------------------- */
    /* Whether the intro plays was settled in the document head, before
       the first paint, and the overlay fades itself out in CSS — so the
       page is revealed whatever happens to this file. The only thing
       held here is the entrance below, so that a first-time visitor sees
       the page arrive instead of a page that has already arrived. */

    /* --intro-fill plus --intro-exit. A backstop only: the fade begins at
       the first paint, which this script cannot time, so the end of the
       fade itself is what is listened for. */
    var INTRO_MS = 1250;
    var intro = document.getElementById('intro');
    var introPlaying = !!(intro && root.classList.contains('is-intro'));
    var held = [];

    function afterIntro(fn) {
        if (introPlaying) held.push(fn);
        else fn();
    }

    function endIntro() {
        if (!introPlaying) return;
        introPlaying = false;
        root.classList.remove('is-intro');
        intro.hidden = true;

        var queue = held;
        held = [];
        queue.forEach(function (fn) { fn(); });
    }

    if (introPlaying) {
        /* The overlay's own fade, not the line's fill or the phrase's. */
        intro.addEventListener('animationend', function (e) {
            if (e.target === intro) endIntro();
        });

        /* A fade that finished before this file arrived leaves no event to
           wait for; one that never runs at all would leave the page
           behind the overlay. Either way the intro is over. */
        if (window.getComputedStyle(intro).opacity === '0') endIntro();
        else window.setTimeout(endIntro, INTRO_MS + 500);
    }


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

    /* The theme actually on screen, whether it came from a stored choice
       or from the operating system. */
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

            /* Backgrounds flip instantly while colour would animate, which
               puts some text briefly at low contrast against the new
               ground. Suppress transitions for the swap itself. */
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

    onMedia(darkQuery, function () {
        if (!readStored()) {
            root.removeAttribute('data-theme');
            describe();
        }
    });


    /* ---------- 2. FLOATING NAVIGATION & ACTIVE SECTION ------------ */
    /* Which band the reader is in is decided once per frame, from a single
       line three tenths of the way down the viewport. */

    var masthead = document.getElementById('masthead');
    var progress = document.getElementById('progress');

    var navLinks = [].slice.call(document.querySelectorAll('.nav__link[href^="#"], .menu__link[href^="#"]'));
    var spy = [];

    navLinks.forEach(function (link) {
        var id = (link.getAttribute('href') || '').replace(/^#/, '');
        if (!id) return;
        var section = document.getElementById(id);
        if (!section || section === document.body) return;
        if (spy.indexOf(section) === -1) spy.push(section);
    });

    function offsetTop(el) {
        var y = 0;
        while (el) { y += el.offsetTop; el = el.offsetParent; }
        return y;
    }

    /* The active section's ground travels rather than being switched on
       and off under each label: one element behind the list, moved to the
       current link. Without this file the ground is drawn by CSS on the
       current link instead, so the state is never lost. */

    var navBar = document.getElementById('nav');
    var navList = navBar ? navBar.querySelector('.nav__list') : null;
    var navPill = null;
    var pillPlaced = false;

    if (navList) {
        navPill = document.createElement('span');
        navPill.className = 'nav__pill';
        navPill.setAttribute('aria-hidden', 'true');
        navList.insertBefore(navPill, navList.firstChild);
        navBar.classList.add('has-pill');
    }

    function placeNavPill() {
        if (!navPill) return;

        var link = navList.querySelector('.nav__link[aria-current]');

        /* Below the desktop breakpoint the list is not laid out at all,
           and on a page with no section in view there is nothing to mark. */
        if (!link || !navList.offsetWidth) {
            navPill.classList.remove('is-on');
            pillPlaced = false;
            return;
        }

        /* The first placement arrives in position and fades; only later
           changes travel. */
        if (!pillPlaced) navPill.classList.add('is-first');

        navPill.style.setProperty('--x', link.offsetLeft + 'px');
        navPill.style.setProperty('--w', link.offsetWidth + 'px');
        navPill.classList.add('is-on');

        if (!pillPlaced) {
            pillPlaced = true;
            requestAnimationFrame(function () { navPill.classList.remove('is-first'); });
        }
    }

    function paintSpy() {
        if (!spy.length) return;

        var line = window.scrollY + window.innerHeight * 0.3;
        var bottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
        var active = null;

        for (var i = 0; i < spy.length; i++) {
            if (bottom || offsetTop(spy[i]) <= line) active = spy[i];
        }

        var id = active ? active.id : null;
        navLinks.forEach(function (link) {
            var on = id && link.getAttribute('href') === '#' + id;
            if (on) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
    }

    if (masthead || progress || spy.length) {
        var solid = false;
        var scheduleChrome = rafOnce();

        var paintChrome = function () {
            var next = window.scrollY > 8;
            if (next !== solid) {
                solid = next;
                if (masthead) masthead.classList.toggle('is-solid', next);
            }

            if (progress) {
                var span = document.documentElement.scrollHeight - window.innerHeight;
                progress.style.setProperty('--p', span > 0 ? Math.min(1, window.scrollY / span) : 0);
            }

            paintSpy();
            placeNavPill();
        };

        var onScroll = function () { scheduleChrome(paintChrome); };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        paintChrome();

        /* Label widths settle when the interface face arrives, and the
           list is only measurable once the desktop breakpoint is met. */
        if (window.document.fonts && window.document.fonts.ready) {
            window.document.fonts.ready.then(function () { scheduleChrome(paintChrome); });
        }
        window.addEventListener('load', onScroll);
        onMedia(wide, onScroll);
    }


    /* ---------- 3. ENTRANCE --------------------------------------- */
    /* A small rise and a fade, staggered by position within its own
       group, played once and then forgotten. */

    var revealed = [].slice.call(document.querySelectorAll('[data-reveal], [data-reveal-soft], [data-reveal-rule]'));

    if (revealed.length) {
        /* Stagger is per parent, so a list of six projects counts one to
           six rather than continuing a page-wide tally. */
        var seen = [];
        var counts = [];

        revealed.forEach(function (el) {
            var parent = el.parentNode;
            var i = seen.indexOf(parent);
            if (i === -1) { seen.push(parent); counts.push(0); i = seen.length - 1; }
            var n = Math.min(counts[i], 6);
            el.style.setProperty('--d', (n * 70) + 'ms');
            counts[i] = counts[i] + 1;
        });

        if (typeof IntersectionObserver === 'function' && motionOK()) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-in');
                    io.unobserve(entry.target);
                });
            }, { threshold: 0.04, rootMargin: '0px 0px -6% 0px' });

            afterIntro(function () {
                revealed.forEach(function (el) { io.observe(el); });
            });
        } else {
            revealed.forEach(function (el) { el.classList.add('is-in'); });
        }
    }


    /* ---------- 4. MENU (below 62rem) ------------------------------ */

    var menuBtn = document.getElementById('menu-btn');
    var menu = document.getElementById('menu');
    var lastFocused = null;

    function menuOpen() {
        return !!(menuBtn && menuBtn.getAttribute('aria-expanded') === 'true');
    }

    function openMenu() {
        if (!menuBtn || !menu) return;
        var previous = document.activeElement;
        lastFocused = (previous && previous !== document.body) ? previous : menuBtn;

        menuBtn.setAttribute('aria-expanded', 'true');
        menu.classList.add('is-open');
        document.body.classList.add('is-locked');

        /* The panel starts at visibility:hidden and a hidden element
           cannot take focus, so wait for the style change to land. */
        requestAnimationFrame(function () {
            var first = menu.querySelector('a[href], button:not([disabled])');
            if (first) first.focus();
            if (document.activeElement !== first) menuBtn.focus();
        });
    }

    function closeMenu(restore) {
        if (!menuBtn || !menu || !menuOpen()) return;

        menuBtn.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
        document.body.classList.remove('is-locked');

        if (restore) {
            var back = (lastFocused && document.contains(lastFocused)) ? lastFocused : menuBtn;
            back.focus();
            if (document.activeElement !== back) menuBtn.focus();
        }
        lastFocused = null;
    }

    if (menuBtn && menu) {
        menuBtn.addEventListener('click', function () {
            if (menuOpen()) closeMenu(true); else openMenu();
        });

        /* Following a link inside the overlay closes it: the anchor scroll
           happens on the page behind. */
        menu.addEventListener('click', function (e) {
            var link = e.target.closest('a[href^="#"]');
            if (link) closeMenu(false);
        });

        document.addEventListener('keydown', function (e) {
            if (!menuOpen()) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                closeMenu(true);
                return;
            }

            if (e.key !== 'Tab') return;

            /* Keep focus inside the panel and the button that opened it. */
            var items = [].slice.call(menu.querySelectorAll('a[href], button:not([disabled])'))
                          .concat([menuBtn]);
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

        /* Reaching the desktop breakpoint retires the overlay entirely. */
        onMedia(wide, function (e) { if (e.matches) closeMenu(false); });
    }


    /* ---------- 5. WORK INDEX ------------------------------------- */
    /* One interaction, repeated for every project: the row becomes the
       active one, and the preview plate travels down the right of the
       index to meet it. Below the desktop breakpoint — or on a touch
       screen — each row simply carries its own preview and a tap opens
       the case study. */

    var index = document.getElementById('work-index');
    var rows = index ? [].slice.call(index.querySelectorAll('.idx')) : [];
    var activeRow = null;

    if (rows.length) {
        var list = index.querySelector('.index__list');
        var schedulePlate = rafOnce();

        var placePlate = function () {
            if (!activeRow || !list || !stageQuery.matches) return;

            var figure = activeRow.querySelector('.idx__figure');
            if (!figure) return;

            var height = figure.offsetHeight;
            var y = activeRow.offsetTop + (activeRow.offsetHeight - height) / 2;
            var limit = list.offsetHeight - height;

            if (limit < 0) limit = 0;
            if (y < 0) y = 0;
            if (y > limit) y = limit;

            index.style.setProperty('--plate-y', y.toFixed(1) + 'px');
        };

        var setRow = function (row) {
            if (!row || row === activeRow) return;
            if (activeRow) activeRow.classList.remove('is-on');
            row.classList.add('is-on');
            activeRow = row;
            placePlate();
        };

        setRow(rows[0]);
        schedulePlate(placePlate);

        rows.forEach(function (row) {
            /* pointerenter covers mouse and pen; focusin gives the keyboard
               the same behaviour without a second code path. */
            row.addEventListener('pointerenter', function (e) {
                if (e.pointerType === 'touch') return;
                setRow(row);
            });
            row.addEventListener('focusin', function () { setRow(row); });
        });

        window.addEventListener('resize', function () { schedulePlate(placePlate); }, { passive: true });
        window.addEventListener('load', function () { schedulePlate(placePlate); });
        onMedia(stageQuery, function () { schedulePlate(placePlate); });
    }


    /* ---------- 6. CASE-STUDY TRANSITION & ZOOM ------------------- */

    var supportsVT = typeof document.startViewTransition === 'function';

    /* Forward: tag the cover of the project being opened so it settles
       into the case-study cover instead of cross-fading with the page. */
    if (supportsVT && rows.length && 'onpageswap' in window) {
        window.addEventListener('pageswap', function (e) {
            if (!e.viewTransition || !e.activation || !e.activation.entry) return;

            var to = e.activation.entry.url || '';
            for (var i = 0; i < rows.length; i++) {
                var slug = rows[i].getAttribute('data-project');
                if (slug && to.indexOf('/work/' + slug + '.html') !== -1) {
                    var img = rows[i].querySelector('.idx__figure img');
                    if (img && rows[i].classList.contains('is-on')) {
                        img.style.viewTransitionName = 'project-cover';
                    }
                    return;
                }
            }
        });
    }

    /* Back: tag the cover of the project being returned from, so the
       case-study image settles back into the index. */
    if (supportsVT && rows.length && 'onpagereveal' in window) {
        window.addEventListener('pagereveal', function (e) {
            if (!e.viewTransition) return;

            var nav = window.navigation;
            var from = (nav && nav.activation && nav.activation.from) ? nav.activation.from.url : '';
            if (!from) return;

            for (var i = 0; i < rows.length; i++) {
                var slug = rows[i].getAttribute('data-project');
                if (slug && from.indexOf('/work/' + slug + '.html') !== -1) {
                    var row = rows[i];
                    var img = row.querySelector('.idx__figure img');
                    if (!img) return;

                    if (activeRow && activeRow !== row) activeRow.classList.remove('is-on');
                    row.classList.add('is-on');
                    activeRow = row;

                    img.style.viewTransitionName = 'project-cover';
                    var clear = function () { img.style.viewTransitionName = ''; };
                    e.viewTransition.finished.then(clear, clear);
                    return;
                }
            }
        });
    }

    /* --- Image zoom on case-study pages ----------------------------- */
    /* Built here rather than in the markup so the pages stay plain HTML
       and keep working without JavaScript. */

    var zoomables = [].slice.call(
        document.querySelectorAll('.case-figure--cover .frame__media img, .case-gallery .frame__media img')
    );

    if (zoomables.length && typeof HTMLDialogElement === 'function' &&
        typeof HTMLDialogElement.prototype.showModal === 'function') {

        var dialog = document.createElement('dialog');
        dialog.className = 'lightbox';
        dialog.innerHTML =
            '<img alt="">' +
            '<div class="lightbox__bar">' +
                '<span class="lightbox__caption"></span>' +
                '<button type="button" class="lightbox__close">Close</button>' +
            '</div>';
        document.body.appendChild(dialog);

        var big = dialog.querySelector('img');
        var caption = dialog.querySelector('.lightbox__caption');
        var opener = null;

        dialog.querySelector('.lightbox__close').addEventListener('click', function () {
            dialog.close();
        });

        /* Clicking the backdrop — anywhere outside the image and its bar. */
        dialog.addEventListener('click', function (e) {
            if (e.target === dialog) dialog.close();
        });

        dialog.addEventListener('close', function () {
            big.removeAttribute('src');
            if (opener && document.contains(opener)) opener.focus();
            opener = null;
        });

        zoomables.forEach(function (img) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'zoom-btn';
            btn.setAttribute('aria-label', 'Expand image');

            img.parentNode.insertBefore(btn, img);
            btn.appendChild(img);

            btn.addEventListener('click', function () {
                opener = btn;
                big.src = img.currentSrc || img.src;
                big.alt = img.alt || '';
                if (caption) caption.textContent = img.alt || '';
                dialog.showModal();
            });
        });
    }


    /* ---------- 7. GITHUB CHART FALLBACK -------------------------- */
    /* The contribution chart comes from ghchart.rshah.org. If that
       service is unreachable, hide the whole figure rather than leaving a
       broken image in the middle of the page. */

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


    /* ---------- 8. FOOTER YEAR ------------------------------------ */

    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

})();
