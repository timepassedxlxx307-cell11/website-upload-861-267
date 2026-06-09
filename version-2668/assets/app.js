(function () {
    function text(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupMenu() {
        const header = document.querySelector(".site-header");
        const button = document.querySelector(".menu-toggle");

        if (!header || !button) {
            return;
        }

        button.addEventListener("click", function () {
            header.classList.toggle("menu-open");
        });
    }

    function setupHero() {
        const slides = Array.from(document.querySelectorAll(".hero-slide"));
        const dots = Array.from(document.querySelectorAll(".hero-dot"));

        if (!slides.length || !dots.length) {
            return;
        }

        let active = 0;
        let timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                const index = Number(dot.getAttribute("data-slide-to") || 0);
                show(index);
                start();
            });
        });

        const hero = document.querySelector(".hero-section");
        if (hero) {
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
        }

        start();
    }

    function setupFilters() {
        const panels = Array.from(document.querySelectorAll(".filter-panel"));

        panels.forEach(function (panel) {
            const section = panel.parentElement;
            if (!section) {
                return;
            }

            const scope = section.querySelector(".filter-scope");
            if (!scope) {
                return;
            }

            const input = panel.querySelector(".movie-search-input");
            const selects = Array.from(panel.querySelectorAll(".filter-select"));
            const cards = Array.from(scope.querySelectorAll(".movie-card, .ranking-item"));

            function apply() {
                const query = text(input ? input.value : "");
                const filters = selects.map(function (select) {
                    return {
                        key: select.getAttribute("data-filter"),
                        value: text(select.value)
                    };
                }).filter(function (item) {
                    return item.key && item.value;
                });
                let visible = 0;

                cards.forEach(function (card) {
                    const searchText = text(card.getAttribute("data-search"));
                    const matchesQuery = !query || searchText.indexOf(query) !== -1;
                    const matchesFilters = filters.every(function (item) {
                        const value = text(card.getAttribute("data-" + item.key));
                        return value.indexOf(item.value) !== -1;
                    });
                    const matches = matchesQuery && matchesFilters;
                    card.classList.toggle("is-hidden", !matches);
                    if (matches) {
                        visible += 1;
                    }
                });

                scope.classList.toggle("is-empty", visible === 0);
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());
