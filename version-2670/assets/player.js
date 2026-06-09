(function () {
  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('video');
    var mask = shell.querySelector('.play-mask');
    var message = shell.querySelector('.player-message');
    var streamUrl = shell.getAttribute('data-stream') || '';
    var hlsInstance = null;
    var prepared = false;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add('is-visible');
    }

    function prepareVideo() {
      if (!video || !streamUrl || prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage('播放暂时不可用，请稍后重试。');
          }
        });
      } else {
        video.src = streamUrl;
      }
    }

    function playVideo() {
      prepareVideo();
      shell.classList.add('is-playing');
      if (video) {
        video.play().catch(function () {
          showMessage('点击视频区域继续播放。');
        });
      }
    }

    if (mask) {
      mask.addEventListener('click', playVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('error', function () {
        showMessage('播放暂时不可用，请稍后重试。');
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
