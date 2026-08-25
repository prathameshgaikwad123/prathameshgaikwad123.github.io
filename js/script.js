/* ===================================================================
   PRATHAMESH GAIKWAD — PORTFOLIO
   Vanilla JS, no dependencies. Everything here is an enhancement:
   with JavaScript disabled the page is fully readable and navigable.

   1. Theme      light/dark, system-aware, persisted only on choice
   2. Chrome     masthead / baseline rail solidify once the view scrolls
   3. Router     panel views, URL + history, View Transitions
   4. Menu       overlay navigation below 62rem, focus trapped
   5. Home       restrained pointer response in the opening view
   6. Work       project index: active state, parallax, cursor detail
   7. Case       cross-document transition tag, zoom, scroll progress
   8. GH chart   hide the figure if the third-party service is down
   9. Year       footer copyright
   =================================================================== */

(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var wide = window.matchMedia('(min-width: 62rem)');
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    /* One shared rAF slot: pointer handlers only ever write CSS custom
       properties, and only once per frame. */
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

    function onMedia(query, handler) {
        if (typeof query.addEventListener === 'function') query.addEventListener('change', handler);
        else if (typeof query.addListener === 'function') query.addListener(handler);  /* Safari < 14 */
    }

    var motionOK = function () { return !reduceMotion.matches; };


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
    onMedia(darkQuery, function () {
        if (!readStored()) {
            root.removeAttribute('data-theme');
            describe();
        }
    });


    /* ---------- 2. FIXED CHROME ------------------------------------ */

    var masthead = document.getElementById('masthead');
    var baseline = document.getElementById('baseline');
    var progress = document.getElementById('progress');

    if (masthead || baseline || progress) {
        var solid = false;

        var paintChrome = function () {
            var next = window.scrollY > 8;
            if (next !== solid) {
                solid = next;
                if (masthead) masthead.classList.toggle('is-solid', next);
                if (baseline) baseline.classList.toggle('is-solid', next);
            }

            if (progress) {
                var span = document.documentElement.scrollHeight - window.innerHeight;
                progress.style.setProperty('--p', span > 0 ? Math.min(1, window.scrollY / span) : 0);
            }
        };

        window.addEventListener('scroll', paintChrome, { passive: true });
        window.addEventListener('resize', paintChrome, { passive: true });
        paintChrome();
    }


    /* ---------- 3. ROUTER ------------------------------------------ */
    /* The home page is a set of panels. Only one is in the document flow
       at a time; the URL hash names it, so every panel stays linkable,
       shareable and reachable with the back button. */

    var views = [].slice.call(document.querySelectorAll('[data-view]'));
    var navLinks = [].slice.call(document.querySelectorAll('[data-nav]'));
    var locatorCount = document.getElementById('locator-count');
    var locatorName = document.getElementById('locator-name');
    var nextLink = document.getElementById('baseline-next');
    var nextName = document.getElementById('baseline-next-name');
    var scrollHint = document.getElementById('baseline-scroll');
    var routeStatus = document.getElementById('route-status');
    var current = null;

    /* The hint is an affordance, not decoration: it appears only when the
       panel actually continues below the fold, and retires once the
       visitor has started reading. */
    function paintHint() {
        if (!scrollHint) return;
        var more = document.documentElement.scrollHeight - window.innerHeight > 8;
        scrollHint.hidden = !more || window.scrollY > 24;
    }

    function watchHint() {
        window.addEventListener('scroll', paintHint, { passive: true });
        window.addEventListener('resize', paintHint, { passive: true });
    }

    function viewByName(name) {
        for (var i = 0; i < views.length; i++) {
            if (views[i].getAttribute('data-view') === name) return views[i];
        }
        return null;
    }

    /* Resolves any in-page hash — including the ids of blocks nested
       inside a panel, such as #tools or #impact — to the panel that
       holds it. */
    function resolve(hash) {
        var id = (hash || '').replace(/^#/, '');
        if (!id) return { view: views[0], target: null };

        var el = null;
        try { el = document.getElementById(id); } catch (e) { el = null; }
        if (!el) return { view: views[0], target: null };

        if (el.hasAttribute('data-view')) return { view: el, target: null };

        var owner = el.closest('[data-view]');
        return owner ? { view: owner, target: el } : { view: views[0], target: null };
    }

    function paintNav(view) {
        var name = view.getAttribute('data-view');
        navLinks.forEach(function (link) {
            var on = link.getAttribute('data-nav') === name;
            if (on) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });

        var num = view.getAttribute('data-num');
        var label = view.getAttribute('data-label') || name;

        if (locatorCount) {
            locatorCount.textContent = num ? num + ' / 05' : 'Index';
        }
        if (locatorName) locatorName.textContent = label;

        /* Where the next step goes, named rather than implied. */
        if (nextLink && nextName) {
            var next = views[(views.indexOf(view) + 1) % views.length];
            nextLink.setAttribute('href', '#' + next.getAttribute('data-view'));
            nextName.textContent = next.getAttribute('data-label') || '';
        }
    }

    function swap(view, target) {
        if (current) current.classList.remove('is-active');
        view.classList.add('is-active');
        current = view;

        paintNav(view);

        /* A panel change is a fresh screen: start it at the top rather
           than inheriting the previous panel's scroll position. */
        if (target) {
            target.scrollIntoView({ block: 'start', behavior: 'auto' });
        } else {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }

        /* Layout has settled by the next frame — measure then. */
        requestAnimationFrame(paintHint);
    }

    function announce(view) {
        if (!routeStatus) return;
        routeStatus.textContent = (view.getAttribute('data-label') || '') + ' — view';
    }

    function show(view, opts) {
        opts = opts || {};
        if (!view || view === current) {
            if (view === current && opts.target) {
                opts.target.scrollIntoView({ block: 'start', behavior: 'auto' });
            }
            return;
        }

        /* Focus is moved inside the swap, not after it: a panel that is
           still display:none cannot take focus. It lands on the panel
           itself rather than its first link, so a screen reader announces
           the new context before its contents; tabindex="-1" keeps the
           panel out of the tab sequence. */
        var commit = function () {
            swap(view, opts.target);
            if (opts.focus) {
                view.focus({ preventScroll: true });
                announce(view);
            }
        };

        if (opts.animate !== false && motionOK() && typeof document.startViewTransition === 'function') {
            document.startViewTransition(commit);
        } else {
            commit();
        }
    }

    function go(name, opts) {
        var view = viewByName(name);
        if (!view) return;

        var hash = '#' + name;
        if (location.hash !== hash) {
            try { history.pushState({ view: name }, '', hash); }
            catch (e) { location.hash = name; }
        }
        show(view, opts);
    }

    if (views.length) {
        /* Stagger indices for the panel entrance, assigned once. */
        views.forEach(function (view) {
            [].slice.call(view.querySelectorAll('[data-lift]')).forEach(function (el, i) {
                el.style.setProperty('--i', i);
            });
        });

        watchHint();

        var initial = resolve(location.hash);
        show(initial.view, { animate: false, target: initial.target });

        /* Any in-page link routes; every other link navigates normally. */
        document.addEventListener('click', function (e) {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

            var link = e.target.closest('a[href]');
            if (!link || link.target === '_blank') return;

            var href = link.getAttribute('href');
            if (!href || href.charAt(0) !== '#' || href === '#') return;

            var found = resolve(href);
            if (!found.view) return;

            e.preventDefault();
            closeMenu(false);
            go(found.view.getAttribute('data-view'), { focus: true, target: found.target });
        });

        window.addEventListener('popstate', function () {
            var found = resolve(location.hash);
            closeMenu(false);
            show(found.view, { target: found.target });
        });

        /* The address bar can change the hash without a popstate. */
        window.addEventListener('hashchange', function () {
            var found = resolve(location.hash);
            if (found.view === current) return;
            closeMenu(false);
            show(found.view, { target: found.target });
        });

        /* Left / right step through the panels — an application-style
           shortcut that never competes with vertical scrolling. */
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
            if (menu && menu.classList.contains('is-open')) return;

            var el = document.activeElement;
            if (el && (el.isContentEditable ||
                /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(el.tagName))) return;

            var i = views.indexOf(current);
            if (i < 0) return;

            var next = views[i + (e.key === 'ArrowRight' ? 1 : -1)];
            if (!next) return;

            e.preventDefault();
            go(next.getAttribute('data-view'), { focus: true });
        });
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


    /* ---------- 5. HOME POINTER RESPONSE --------------------------- */
    /* Two composited layers follow the pointer at a distance: a warm
       wash and a few pixels of drift on the two display lines. Nothing
       reflows, nothing moves far enough to unsettle the type. */

    var homeView = document.getElementById('home');
    var wash = document.getElementById('field-wash');
    var homeLines = [].slice.call(document.querySelectorAll('.home__line'));

    if (homeView && (wash || homeLines.length) && finePointer.matches) {
        var schedule = rafOnce();
        var homeActive = true;

        var onHomeMove = function (e) {
            if (!homeActive || !motionOK()) return;
            var x = e.clientX;
            var y = e.clientY;

            schedule(function () {
                if (wash) {
                    wash.style.setProperty('--px', x + 'px');
                    wash.style.setProperty('--py', y + 'px');
                }
                if (homeLines.length) {
                    /* -1 … 1 across the viewport, capped at 10px of drift. */
                    var drift = ((x / window.innerWidth) - 0.5) * 20;
                    homeLines.forEach(function (line) {
                        line.style.setProperty('--drift', drift.toFixed(2) + 'px');
                    });
                }
            });
        };

        window.addEventListener('pointermove', onHomeMove, { passive: true });

        onMedia(reduceMotion, function (e) {
            homeActive = !e.matches;
            if (e.matches && homeLines.length) {
                homeLines.forEach(function (line) { line.style.removeProperty('--drift'); });
            }
        });
    }


    /* ---------- 6. WORK INDEX -------------------------------------- */

    var workIndex = document.getElementById('work-index');
    var rows = workIndex ? [].slice.call(workIndex.querySelectorAll('.work-row')) : [];

    if (rows.length) {
        var activeRow = null;

        var setRow = function (row) {
            if (!row || row === activeRow) return;
            if (activeRow) activeRow.classList.remove('is-active');
            row.classList.add('is-active');
            activeRow = row;
        };

        setRow(rows[0]);

        rows.forEach(function (row) {
            /* pointerenter covers mouse, pen and touch; focusin gives the
               keyboard the same behaviour without a second code path. */
            row.addEventListener('pointerenter', function () { setRow(row); });
            row.addEventListener('focusin', function () { setRow(row); });
        });

        /* --- Parallax on the active cover --------------------------- */
        var scheduleWork = rafOnce();

        workIndex.addEventListener('pointermove', function (e) {
            if (!motionOK() || !wide.matches || !finePointer.matches || !activeRow) return;

            var box = workIndex.getBoundingClientRect();
            var nx = ((e.clientX - box.left) / box.width - 0.5) * 2;
            var ny = ((e.clientY - box.top) / box.height - 0.5) * 2;
            var img = activeRow.querySelector('.work-row__media img');
            if (!img) return;

            scheduleWork(function () {
                img.style.setProperty('--mx', (nx * -10).toFixed(1) + 'px');
                img.style.setProperty('--my', (ny * -10).toFixed(1) + 'px');
            });
        }, { passive: true });

        workIndex.addEventListener('pointerleave', function () {
            rows.forEach(function (row) {
                var img = row.querySelector('.work-row__media img');
                if (img) { img.style.removeProperty('--mx'); img.style.removeProperty('--my'); }
            });
        });

        /* --- Cursor detail ------------------------------------------ */
        var cursor = document.getElementById('work-cursor');
        var cursorText = document.getElementById('work-cursor-text');

        if (cursor && finePointer.matches) {
            var scheduleCursor = rafOnce();

            var moveCursor = function (e) {
                if (!motionOK() || !wide.matches) return;
                var x = e.clientX + 18;
                var y = e.clientY + 18;

                scheduleCursor(function () {
                    cursor.style.setProperty('--cx', x + 'px');
                    cursor.style.setProperty('--cy', y + 'px');
                });
            };

            workIndex.addEventListener('pointermove', moveCursor, { passive: true });

            rows.forEach(function (row) {
                var link = row.querySelector('.work-row__link');
                var cta = row.querySelector('.work-row__cta');
                if (!link) return;

                link.addEventListener('pointerenter', function (e) {
                    if (e.pointerType !== 'mouse' || !motionOK() || !wide.matches) return;
                    if (cursorText && cta) cursorText.textContent = cta.textContent.trim();
                    cursor.classList.add('is-on');
                });

                link.addEventListener('pointerleave', function () {
                    cursor.classList.remove('is-on');
                });
            });

            /* Any panel change or scroll retires the chip. */
            window.addEventListener('blur', function () { cursor.classList.remove('is-on'); });
            document.addEventListener('click', function () { cursor.classList.remove('is-on'); });
        }
    }


    /* ---------- 7. CASE-STUDY TRANSITIONS & ZOOM ------------------- */

    var supportsVT = typeof document.startViewTransition === 'function';

    /* Forward: tag the cover of the project being opened so it morphs
       into the case-study cover instead of cross-fading with the page. */
    if (supportsVT && rows.length && 'onpageswap' in window) {
        window.addEventListener('pageswap', function (e) {
            if (!e.viewTransition || !e.activation || !e.activation.entry) return;

            var to = e.activation.entry.url || '';
            for (var i = 0; i < rows.length; i++) {
                var slug = rows[i].getAttribute('data-project');
                if (slug && to.indexOf('/work/' + slug + '.html') !== -1) {
                    var img = rows[i].querySelector('.work-row__media img');
                    if (img) img.style.viewTransitionName = 'project-cover';
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
                    var img = row.querySelector('.work-row__media img');
                    if (!img) return;

                    if (activeRow) activeRow.classList.remove('is-active');
                    row.classList.add('is-active');
                    activeRow = row;

                    img.style.viewTransitionName = 'project-cover';
                    e.viewTransition.finished.then(function () {
                        img.style.viewTransitionName = '';
                    }, function () {
                        img.style.viewTransitionName = '';
                    });
                    return;
                }
            }
        });
    }

    /* --- Image zoom on case-study pages ----------------------------- */
    /* Built here rather than in the markup so the pages stay plain HTML
       and keep working without JavaScript. */

    var zoomables = [].slice.call(
        document.querySelectorAll('.case-figure--cover img, .case-gallery img')
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

        /* Clicking the backdrop — anywhere outside the image bar. */
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


    /* ---------- 8. GITHUB CHART FALLBACK --------------------------- */
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


    /* ---------- 9. FOOTER YEAR ------------------------------------- */

    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

})();
