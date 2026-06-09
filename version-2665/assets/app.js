(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-target]"));
      var previous = carousel.querySelector("[data-slide-prev]");
      var next = carousel.querySelector("[data-slide-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      if (previous) {
        previous.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          restart();
        });
      });

      show(0);
      restart();
    });

    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
      var section = form.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
      var empty = section.querySelector(".filter-empty");

      function value(name) {
        var field = form.elements[name];
        return field ? String(field.value || "").trim().toLowerCase() : "";
      }

      function applyFilter() {
        var query = value("q");
        var type = value("type");
        var region = value("region");
        var year = value("year");
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();

          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (type && String(card.getAttribute("data-type") || "").toLowerCase() !== type) {
            ok = false;
          }
          if (region && String(card.getAttribute("data-region") || "").toLowerCase() !== region) {
            ok = false;
          }
          if (year && String(card.getAttribute("data-year") || "").toLowerCase() !== year) {
            ok = false;
          }

          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      form.addEventListener("input", applyFilter);
      form.addEventListener("change", applyFilter);
    });

    document.querySelectorAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var start = box.querySelector(".player-start");
      var source = video ? video.querySelector("source") : null;
      var stream = source ? source.getAttribute("src") : "";
      var prepared = false;
      var hls = null;

      function prepareVideo() {
        if (!video || prepared || !stream) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }

        prepared = true;
      }

      function playVideo() {
        prepareVideo();
        if (!video) {
          return;
        }
        var attempt = video.play();
        box.classList.add("is-playing");
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            box.classList.remove("is-playing");
          });
        }
      }

      if (start) {
        start.addEventListener("click", playVideo);
      }

      if (video) {
        video.addEventListener("play", function () {
          box.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (video.currentTime === 0 || video.ended) {
            box.classList.remove("is-playing");
          }
        });
        video.addEventListener("click", function () {
          if (!prepared) {
            playVideo();
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  });
})();
