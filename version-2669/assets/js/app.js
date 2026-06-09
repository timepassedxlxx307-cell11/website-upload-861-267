(function () {
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function byQuery(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }

  function initMobileNav() {
    var button = document.querySelector('.mobile-nav-toggle');
    var panel = document.querySelector('.mobile-nav-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = byQuery(slider, '.hero-slide');
    var dots = byQuery(slider, '.hero-dot');
    var previous = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function buildSearchItem(item) {
    var link = document.createElement('a');
    link.className = 'search-result-item';
    link.href = item.url;
    var image = document.createElement('img');
    image.src = item.cover;
    image.alt = item.title;
    var text = document.createElement('span');
    var title = document.createElement('strong');
    title.textContent = item.title;
    var meta = document.createElement('span');
    meta.textContent = [item.year, item.type, item.genre].filter(Boolean).join(' · ');
    text.appendChild(title);
    text.appendChild(meta);
    link.appendChild(image);
    link.appendChild(text);
    return link;
  }

  function initSiteSearch() {
    var records = Array.isArray(window.movieIndex) ? window.movieIndex : (typeof movieIndex !== 'undefined' ? movieIndex : []);
    byQuery(document, '.site-search').forEach(function (box) {
      var input = box.querySelector('.site-search-input');
      var results = box.querySelector('.search-results');
      if (!input || !results) {
        return;
      }

      input.addEventListener('input', function () {
        var query = normalize(input.value);
        results.innerHTML = '';
        if (!query) {
          results.hidden = true;
          return;
        }
        var matches = records.filter(function (item) {
          var haystack = normalize([
            item.title,
            item.year,
            item.type,
            item.genre,
            item.category,
            (item.tags || []).join(' ')
          ].join(' '));
          return haystack.indexOf(query) !== -1;
        }).slice(0, 12);

        if (!matches.length) {
          var empty = document.createElement('div');
          empty.className = 'no-results';
          empty.textContent = '没有找到相关影片';
          results.appendChild(empty);
        } else {
          matches.forEach(function (item) {
            results.appendChild(buildSearchItem(item));
          });
        }
        results.hidden = false;
      });

      document.addEventListener('click', function (event) {
        if (!box.contains(event.target)) {
          results.hidden = true;
        }
      });
    });
  }

  function initLocalFilters() {
    byQuery(document, '[data-local-filter]').forEach(function (filter) {
      var input = filter.querySelector('.local-filter-input');
      var type = filter.querySelector('.local-filter-type');
      var year = filter.querySelector('.local-filter-year');
      var grid = filter.nextElementSibling;
      if (!grid) {
        return;
      }
      var cards = byQuery(grid, '[data-movie-card]');
      var empty = document.createElement('div');
      empty.className = 'no-results';
      empty.textContent = '没有找到符合条件的影片';

      function apply() {
        var query = normalize(input && input.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        var visible = 0;
        cards.forEach(function (card) {
          var title = normalize(card.getAttribute('data-title'));
          var tags = normalize(card.getAttribute('data-tags'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matched = true;
          if (query && title.indexOf(query) === -1 && tags.indexOf(query) === -1) {
            matched = false;
          }
          if (typeValue && cardType.indexOf(typeValue) === -1) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (!visible) {
          if (!empty.parentNode) {
            grid.after(empty);
          }
        } else if (empty.parentNode) {
          empty.parentNode.removeChild(empty);
        }
      }

      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  initMobileNav();
  initHeroSlider();
  initSiteSearch();
  initLocalFilters();
})();
