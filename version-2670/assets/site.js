(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      mobileNav.hidden = expanded;
    });
  }

  document.querySelectorAll('.site-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var action = form.getAttribute('action') || 'search.html';
      var target = query ? action + '?q=' + encodeURIComponent(query) : action;
      window.location.href = target;
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === heroIndex);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showHero(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var topButton = document.querySelector('.back-to-top');
  if (topButton) {
    window.addEventListener('scroll', function () {
      topButton.classList.toggle('is-visible', window.scrollY > 560);
    });
    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var searchRoot = document.querySelector('[data-search-page]');
  if (searchRoot && typeof SEARCH_MOVIES !== 'undefined') {
    var queryInput = searchRoot.querySelector('[name="q"]');
    var typeSelect = searchRoot.querySelector('[name="type"]');
    var yearSelect = searchRoot.querySelector('[name="year"]');
    var regionSelect = searchRoot.querySelector('[name="region"]');
    var resultBox = searchRoot.querySelector('.search-result-grid');
    var note = searchRoot.querySelector('.search-results-note');
    var searchForm = searchRoot.querySelector('.search-panel');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (queryInput) {
      queryInput.value = initialQuery;
    }

    function uniqueValues(key) {
      var seen = {};
      SEARCH_MOVIES.forEach(function (item) {
        var value = item[key] || '';
        if (value) {
          seen[value] = true;
        }
      });
      return Object.keys(seen).sort(function (a, b) {
        return b.localeCompare(a, 'zh-CN');
      });
    }

    function fillOptions(select, values) {
      if (!select) {
        return;
      }
      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillOptions(typeSelect, uniqueValues('type'));
    fillOptions(yearSelect, uniqueValues('year'));
    fillOptions(regionSelect, uniqueValues('region'));

    function cardHtml(item) {
      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">' +
        '<span class="poster" style="--cover-image: url('' + item.cover + '');">' +
        '<span class="poster-badge">' + escapeHtml(item.year) + '</span>' +
        '<span class="poster-play">▶</span>' +
        '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p class="movie-line">' + escapeHtml(item.line) + '</p>' +
        '<div class="movie-meta"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
        '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    function renderResults() {
      var q = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var results = SEARCH_MOVIES.filter(function (item) {
        var haystack = [item.title, item.line, item.genre, item.tags, item.region, item.type, item.year].join(' ').toLowerCase();
        if (q && haystack.indexOf(q) === -1) {
          return false;
        }
        if (type && item.type !== type) {
          return false;
        }
        if (year && item.year !== year) {
          return false;
        }
        if (region && item.region !== region) {
          return false;
        }
        return true;
      }).slice(0, 96);

      if (resultBox) {
        resultBox.innerHTML = results.map(cardHtml).join('');
      }
      if (note) {
        note.textContent = results.length ? '已筛选出相关影片，点击卡片进入详情页观看。' : '没有找到匹配内容，请更换关键词或筛选条件。';
      }
    }

    [queryInput, typeSelect, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', renderResults);
        control.addEventListener('change', renderResults);
      }
    });

    if (searchForm) {
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        renderResults();
      });
    }

    renderResults();
  }
})();
