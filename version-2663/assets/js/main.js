(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
            document.body.classList.toggle('no-scroll', mobilePanel.classList.contains('is-open'));
        });
    }

    const carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        let current = 0;
        let timer = null;

        const showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        const start = function () {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        const stop = function () {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                stop();
                showSlide(index);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    }

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    const globalSearch = document.querySelector('[data-global-search]');

    if (globalSearch && query) {
        globalSearch.value = query;
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        const list = panel.parentElement.querySelector('[data-card-list]');
        const cards = list ? Array.from(list.querySelectorAll('[data-movie-card]')) : [];
        const input = panel.querySelector('[data-movie-filter]');
        const year = panel.querySelector('[data-year-filter]');
        const empty = panel.parentElement.querySelector('[data-empty-state]');

        const normalize = function (value) {
            return String(value || '').trim().toLowerCase();
        };

        const filter = function () {
            const keyword = normalize(input ? input.value : '');
            const selectedYear = year ? year.value : '';
            let visible = 0;

            cards.forEach(function (card) {
                const text = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.region,
                    card.dataset.keywords
                ].join(' '));
                const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                const matchYear = !selectedYear || card.dataset.year === selectedYear;
                const show = matchKeyword && matchYear;

                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        };

        if (input) {
            input.addEventListener('input', filter);
        }

        if (year) {
            year.addEventListener('change', filter);
        }

        filter();
    });

    document.querySelectorAll('[data-play-shortcut]').forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const target = document.getElementById(link.dataset.playShortcut);
            if (target) {
                target.click();
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
}());
