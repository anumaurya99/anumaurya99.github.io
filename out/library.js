(function () {
    const tablist   = document.querySelector('.lib-tabs');
    const tabs      = [...tablist.querySelectorAll('[role="tab"]')];
    const indicator = tablist.querySelector('.lib-tab-indicator');
    const panels    = [...document.querySelectorAll('#library [role="tabpanel"]')];

    function moveIndicator(tab) {
        const listRect = tablist.getBoundingClientRect();
        const tabRect  = tab.getBoundingClientRect();
        indicator.style.left  = (tabRect.left - listRect.left + tablist.scrollLeft) + 'px';
        indicator.style.width = tabRect.width + 'px';
    }

    function activate(tab) {
        tabs.forEach(t => {
            t.setAttribute('aria-selected', 'false');
            t.setAttribute('tabindex', '-1');
        });
        panels.forEach(p => { p.hidden = true; });

        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');
        document.getElementById(tab.getAttribute('aria-controls')).hidden = false;
        moveIndicator(tab);

        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    function switchTab(tab) {
        if (document.startViewTransition) {
            document.startViewTransition(() => activate(tab));
        } else {
            activate(tab);
        }
    }

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => { tab.focus(); switchTab(tab); });
        tab.addEventListener('keydown', e => {
            const map = {
                ArrowRight: (i + 1) % tabs.length,
                ArrowLeft:  (i - 1 + tabs.length) % tabs.length,
                Home: 0,
                End:  tabs.length - 1,
            };
            if (!(e.key in map)) return;
            e.preventDefault();
            const next = tabs[map[e.key]];
            next.focus();
            switchTab(next);
        });
    });

    moveIndicator(tabs.find(t => t.getAttribute('aria-selected') === 'true'));
    window.addEventListener('resize', () => {
        moveIndicator(tabs.find(t => t.getAttribute('aria-selected') === 'true'));
    }, { passive: true });

    document.querySelectorAll('#library .lib-item').forEach(item => {
        const video = item.querySelector('video');
        if (!video) return;
        item.addEventListener('mouseenter', () => { video.play(); });
        item.addEventListener('mouseleave', () => { video.pause(); });
    });
})();
