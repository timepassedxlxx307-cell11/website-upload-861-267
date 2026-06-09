(function () {
  var video = document.querySelector('.watch-video');
  var cover = document.querySelector('.player-cover');
  var triggers = Array.prototype.slice.call(document.querySelectorAll('.player-start, .player-cover'));
  if (!video || typeof pageStreamUrl === 'undefined') {
    return;
  }

  var loaded = false;
  var hls = null;

  function loadStream() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = pageStreamUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(pageStreamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }
    video.src = pageStreamUrl;
  }

  function startPlayback() {
    loadStream();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    video.play().catch(function () {
      window.setTimeout(function () {
        video.play().catch(function () {});
      }, 250);
    });
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', startPlayback);
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
