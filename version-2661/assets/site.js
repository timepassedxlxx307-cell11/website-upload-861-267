(function() {
    var header = document.querySelector('[data-site-header]');
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function setHeaderState() {
        if (!header) {
            return;
        }
        if (window.scrollY > 28) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function() {
            mobileNav.classList.toggle('is-open');
        });
    }

    window.addEventListener('scroll', setHeaderState, { passive: true });
    setHeaderState();

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            timer = window.setInterval(function() {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        startTimer();
    }

    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function(scope) {
        var input = scope.querySelector('[data-search-input]');
        var genre = scope.querySelector('[data-genre-filter]');
        var year = scope.querySelector('[data-year-filter]');
        var parent = scope.parentElement;
        var items = Array.prototype.slice.call(parent.querySelectorAll('.js-filter-item'));

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var genreValue = genre ? genre.value : '';
            var yearValue = year ? year.value : '';

            items.forEach(function(item) {
                var search = item.getAttribute('data-search') || '';
                var itemGenre = item.getAttribute('data-genre') || '';
                var itemYear = item.getAttribute('data-year') || '';
                var matchesSearch = !query || search.indexOf(query) !== -1;
                var matchesGenre = !genreValue || itemGenre.indexOf(genreValue) !== -1;
                var matchesYear = !yearValue || itemYear === yearValue;
                item.classList.toggle('is-filtered', !(matchesSearch && matchesGenre && matchesYear));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (genre) {
            genre.addEventListener('change', applyFilter);
        }
        if (year) {
            year.addEventListener('change', applyFilter);
        }
    });
})();
