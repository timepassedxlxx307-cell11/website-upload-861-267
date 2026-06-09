(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
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
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(next);
        restart();
      });
    });

    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var container = panel.parentElement || document;
      var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
      var empty = container.querySelector('[data-filter-empty]');
      var search = panel.querySelector('[data-filter-search]');
      var region = panel.querySelector('[data-filter-region]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');

      if (window.__initialSearchFromQuery && search) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          search.value = q;
        }
      }

      function apply() {
        var keyword = normalize(search && search.value);
        var regionValue = normalize(region && region.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1 || text.indexOf(regionValue) !== -1;
          var matchType = !typeValue || cardType.indexOf(typeValue) !== -1 || text.indexOf(typeValue) !== -1;
          var matchYear = !yearValue || cardYear === yearValue || (yearValue === '经典' && Number(cardYear) < 2015);
          var show = matchKeyword && matchRegion && matchType && matchYear;
          card.classList.toggle('hidden-by-filter', !show);
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [search, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  var hlsLoadingPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLoadingPromise) {
      return hlsLoadingPromise;
    }
    hlsLoadingPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsLoadingPromise;
  }

  function playVideo(shell) {
    var video = shell.querySelector('video[data-hls-src]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-hls-src');
    if (!source) {
      return;
    }

    function startPlayback() {
      shell.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (video.dataset.ready === 'true') {
      startPlayback();
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.dataset.ready = 'true';
      startPlayback();
      return;
    }

    loadHlsLibrary().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.dataset.ready = 'true';
          startPlayback();
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            hls.destroy();
            video.src = source;
            video.dataset.ready = 'true';
            startPlayback();
          }
        });
      } else {
        video.src = source;
        video.dataset.ready = 'true';
        startPlayback();
      }
    }).catch(function () {
      video.src = source;
      video.dataset.ready = 'true';
      startPlayback();
    });
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]'));
    shells.forEach(function (shell) {
      var button = shell.querySelector('[data-player-start]');
      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          playVideo(shell);
        });
      }
      shell.addEventListener('click', function (event) {
        if (event.target && event.target.tagName === 'VIDEO') {
          return;
        }
        if (button && button.contains(event.target)) {
          return;
        }
        if (!shell.classList.contains('is-playing')) {
          playVideo(shell);
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
