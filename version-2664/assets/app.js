(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setHero(index) {
    var slides = all(".hero-slide");
    var dots = all(".hero-dot");
    if (!slides.length) {
      return;
    }
    var nextIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === nextIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === nextIndex);
    });
    document.documentElement.dataset.heroIndex = String(nextIndex);
  }

  function currentHero() {
    var parsed = parseInt(document.documentElement.dataset.heroIndex || "0", 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  function setupHero() {
    var slides = all(".hero-slide");
    if (!slides.length) {
      return;
    }
    setHero(0);
    all(".hero-dot").forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        setHero(index);
      });
    });
    var prev = one(".hero-prev");
    var next = one(".hero-next");
    if (prev) {
      prev.addEventListener("click", function () {
        setHero(currentHero() - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        setHero(currentHero() + 1);
      });
    }
    window.setInterval(function () {
      setHero(currentHero() + 1);
    }, 5800);
  }

  function setupNav() {
    var button = one(".nav-toggle");
    var nav = one(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function matchCard(card, query, filter) {
    var text = [
      card.dataset.title || "",
      card.dataset.genre || "",
      card.dataset.tags || "",
      card.dataset.region || "",
      card.dataset.year || "",
      card.dataset.type || ""
    ].join(" ").toLowerCase();
    var filterText = filter === "all" ? "" : filter.toLowerCase();
    var queryOk = !query || text.indexOf(query) !== -1;
    var filterOk = !filterText || text.indexOf(filterText) !== -1;
    return queryOk && filterOk;
  }

  function refreshCards() {
    var input = one("[data-search-input]");
    var query = input ? input.value.trim().toLowerCase() : "";
    var active = one(".filter-button.is-active");
    var filter = active ? active.dataset.filter || "all" : "all";
    var visible = 0;
    all(".movie-card").forEach(function (card) {
      var ok = matchCard(card, query, filter);
      card.hidden = !ok;
      if (ok) {
        visible += 1;
      }
    });
    all(".empty-state").forEach(function (node) {
      node.classList.toggle("is-visible", visible === 0);
    });
  }

  function setupFilters() {
    var input = one("[data-search-input]");
    if (input) {
      input.addEventListener("input", refreshCards);
    }
    all(".filter-button").forEach(function (button) {
      button.addEventListener("click", function () {
        all(".filter-button").forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        refreshCards();
      });
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = one("#movie-player");
    var stage = one(".player-stage");
    var buttons = all("[data-play-button]");
    var hlsInstance = null;
    if (!video || !stage || !streamUrl) {
      return;
    }

    function attach() {
      if (video.dataset.ready === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      video.dataset.ready = "1";
    }

    function play() {
      attach();
      stage.classList.add("is-playing");
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    });
    stage.addEventListener("click", function (event) {
      if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === "video") {
        return;
      }
      play();
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupNav();
    setupHero();
    setupFilters();
    refreshCards();
  });
})();
