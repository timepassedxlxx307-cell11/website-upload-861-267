(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function showSlide(slides, dots, index) {
    slides.forEach(function(slide, i) {
      slide.classList.toggle("is-active", i === index);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle("is-active", i === index);
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        index = i;
        showSlide(slides, dots, index);
      });
    });
    setInterval(function() {
      index = (index + 1) % slides.length;
      showSlide(slides, dots, index);
    }, 6500);
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function() {
      menu.hidden = !menu.hidden;
    });
  }

  function setupGlobalSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
    if (!inputs.length || !window.SITE_MOVIES) {
      return;
    }
    inputs.forEach(function(input) {
      var box = input.parentElement.querySelector("[data-search-results]");
      input.addEventListener("input", function() {
        var query = input.value.trim().toLowerCase();
        if (!query) {
          box.classList.remove("is-open");
          box.innerHTML = "";
          return;
        }
        var hits = window.SITE_MOVIES.filter(function(movie) {
          return movie.text.indexOf(query) !== -1;
        }).slice(0, 12);
        box.innerHTML = hits.map(function(movie) {
          return '<a class="search-hit" href="' + movie.url + '">' +
            '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" onerror="this.style.opacity=\'0\';">' +
            '<span><strong>' + movie.title + '</strong><span>' + movie.meta + '</span></span>' +
            '</a>';
        }).join("");
        box.classList.toggle("is-open", hits.length > 0);
      });
      document.addEventListener("click", function(event) {
        if (!input.parentElement.contains(event.target)) {
          box.classList.remove("is-open");
        }
      });
    });
  }

  function setupLocalFilter() {
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-filter-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!cards.length || (!input && !select)) {
      return;
    }
    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var year = select ? select.value : "";
      cards.forEach(function(card) {
        var value = card.getAttribute("data-filter") || "";
        var okKeyword = !keyword || value.indexOf(keyword) !== -1;
        var okYear = !year || value.indexOf(year) !== -1;
        card.style.display = okKeyword && okYear ? "" : "none";
      });
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function(shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector("[data-play-overlay]");
      var button = shell.querySelector("[data-play-button]");
      var stream = shell.getAttribute("data-video");
      var started = false;
      var hlsInstance = null;

      function start() {
        if (!video || !stream) {
          return;
        }
        if (!started) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
          } else {
            video.src = stream;
          }
          started = true;
        }
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function() {});
        }
      }

      if (button) {
        button.addEventListener("click", function(event) {
          event.preventDefault();
          start();
        });
      }
      if (overlay) {
        overlay.addEventListener("click", start);
      }
      shell.addEventListener("dblclick", start);
      window.addEventListener("beforeunload", function() {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function() {
    setupHero();
    setupMenu();
    setupGlobalSearch();
    setupLocalFilter();
    setupPlayers();
  });
})();
