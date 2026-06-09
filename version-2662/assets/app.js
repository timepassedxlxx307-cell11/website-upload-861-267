(function () {
  function onReady(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll('[data-search-form]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        if (!value) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  function cardMarkup(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<a class="movie-card" href="./' + movie.url + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">' +
      '<span class="movie-poster" style="background-image: url(\'' + movie.image + '\');">' +
      '<span class="movie-badge">' + escapeHtml(movie.type) + '</span>' +
      '<span class="movie-quality">1080P</span>' +
      '<span class="movie-play">▶</span>' +
      '</span>' +
      '<span class="movie-info">' +
      '<strong>' + escapeHtml(movie.title) + '</strong>' +
      '<span class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</span>' +
      '<span class="movie-desc">' + escapeHtml(movie.desc) + '</span>' +
      '<span class="tag-row">' + tags + '</span>' +
      '</span>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.MOVIE_INDEX) {
      return;
    }
    var panel = document.querySelector('[data-search-panel]');
    var input = document.querySelector('[data-search-input]');
    var filter = document.querySelector('[data-category-filter]');
    var title = document.querySelector('[data-result-title]');
    var desc = document.querySelector('[data-result-desc]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }
    function render() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var category = filter ? filter.value : '';
      var list = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.desc, movie.tags.join(' ')].join(' ').toLowerCase();
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedCategory = !category || movie.category === category;
        return matchedQuery && matchedCategory;
      }).slice(0, 96);
      if (!list.length) {
        results.innerHTML = '<div class="content-panel"><h2>暂无匹配影片</h2><p>可以尝试更换关键词或切换分类继续浏览。</p></div>';
      } else {
        results.innerHTML = list.map(cardMarkup).join('');
      }
      if (title) {
        title.textContent = query || category ? '相关影片' : '推荐影片';
      }
      if (desc) {
        desc.textContent = query || category ? '已根据当前条件展示匹配内容。' : '输入关键词或选择分类后即可筛选片库内容。';
      }
    }
    if (panel) {
      panel.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
        var value = input ? input.value.trim() : '';
        var nextUrl = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
        window.history.replaceState({}, '', nextUrl);
      });
    }
    if (input) {
      input.addEventListener('input', render);
    }
    if (filter) {
      filter.addEventListener('change', render);
    }
    render();
  }

  function setupPlayer() {
    var box = document.querySelector('[data-player]');
    if (!box) {
      return;
    }
    var video = box.querySelector('video');
    var cover = box.querySelector('[data-player-cover]');
    var button = box.querySelector('[data-play-button]');
    var hlsUrl = box.getAttribute('data-hls');
    var attached = false;
    var hlsInstance = null;
    function attach() {
      if (attached || !video || !hlsUrl) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          backBufferLength: 30
        });
        hlsInstance.loadSource(hlsUrl);
        hlsInstance.attachMedia(video);
        attached = true;
        return;
      }
      video.src = hlsUrl;
      attached = true;
    }
    function play() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (video) {
        video.setAttribute('controls', 'controls');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
    }
    if (button) {
      button.addEventListener('click', play);
    }
    if (cover) {
      cover.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  }

  onReady(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupSearchPage();
    setupPlayer();
  });
})();
