;(function () {
  'use strict';

  var layer = null;
  var pawPositions = [];
  var rafPending = false;
  var rebuildTimer = null;
  var lastHeight = 0;
  var lastWidth = 0;

  function docHeight() {
    var b = document.body;
    var d = document.documentElement;
    return Math.max(
      b ? b.scrollHeight : 0,
      b ? b.offsetHeight : 0,
      d ? d.scrollHeight : 0,
      d ? d.offsetHeight : 0,
      window.innerHeight || 0
    );
  }

  function pseudo(index) {
    var x = Math.sin((index + 1) * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function pawSvg() {
    return '' +
      '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">' +
        '<ellipse class="paw-toe" cx="9.7" cy="11.2" rx="3.7" ry="4.6" transform="rotate(-22 9.7 11.2)"/>' +
        '<ellipse class="paw-toe" cx="18.2" cy="7.2" rx="3.6" ry="4.8" transform="rotate(-6 18.2 7.2)"/>' +
        '<ellipse class="paw-toe" cx="27.2" cy="8.9" rx="3.6" ry="4.8" transform="rotate(10 27.2 8.9)"/>' +
        '<ellipse class="paw-toe" cx="33.2" cy="15.4" rx="3.5" ry="4.5" transform="rotate(24 33.2 15.4)"/>' +
        '<path class="paw-pad" d="M8.7 25.2c0-6 4.9-10.7 11.2-10.7 6.4 0 11.5 4.5 11.5 10.4 0 6.1-4.3 10.1-11.4 10.1-7 0-11.3-3.9-11.3-9.8Z"/>' +
      '</svg>';
  }

  function ensureLayer() {
    if (layer && document.body.contains(layer)) return layer;
    layer = document.querySelector('.paw-trail');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'paw-trail';
      layer.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(layer, document.body.firstChild);
    }
    return layer;
  }

  function buildTrail() {
    var host = ensureLayer();
    var height = docHeight();
    var width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if (!height || !width) return;

    lastHeight = height;
    lastWidth = width;
    host.style.height = height + 'px';
    host.textContent = '';
    pawPositions = [];

    var mobile = width <= 768;
    var step = mobile ? 112 : 132;
    var startY = mobile ? 58 : 70;
    var endY = Math.max(startY, height - 70);
    var count = Math.min(96, Math.max(12, Math.ceil((endY - startY) / step)));

    for (var i = 0; i <= count; i++) {
      var y = startY + i * step;
      if (y > endY) y = endY;

      var t = count ? i / count : 0;
      var wave = Math.sin(t * Math.PI * 4.35);
      var secondary = Math.sin(t * Math.PI * 9.2) * 2.8;
      var baseX = 50 + wave * (mobile ? 36 : 39) + secondary;
      var footOffset = (i % 2 === 0 ? -1 : 1) * (mobile ? 2.1 : 1.5);
      var x = Math.max(mobile ? 7 : 5, Math.min(mobile ? 93 : 95, baseX + footOffset));

      var nextT = Math.min(1, t + 0.012);
      var nextWave = Math.sin(nextT * Math.PI * 4.35);
      var nextSecondary = Math.sin(nextT * Math.PI * 9.2) * 2.8;
      var nextX = 50 + nextWave * (mobile ? 36 : 39) + nextSecondary;
      var direction = nextX - baseX;
      var rotation = (direction * 2.1) + (i % 2 === 0 ? -9 : 9);
      rotation += (pseudo(i) - .5) * 5;

      var paw = document.createElement('span');
      paw.className = 'paw-step';
      paw.style.setProperty('--paw-x', x.toFixed(2) + '%');
      paw.style.setProperty('--paw-y', y.toFixed(0) + 'px');
      paw.style.setProperty('--paw-rotation', rotation.toFixed(1) + 'deg');
      paw.innerHTML = pawSvg();

      host.appendChild(paw);
      pawPositions.push({ node: paw, y: y });
    }

    revealForScroll();
  }

  function revealForScroll() {
    rafPending = false;
    var revealLine = (window.scrollY || window.pageYOffset || 0) + (window.innerHeight || 0) * .86;
    for (var i = 0; i < pawPositions.length; i++) {
      if (pawPositions[i].y <= revealLine) {
        pawPositions[i].node.classList.add('is-seen');
      }
    }
  }

  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    window.requestAnimationFrame(revealForScroll);
  }

  function scheduleRebuild() {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(function () {
      var height = docHeight();
      var width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      if (Math.abs(height - lastHeight) > 80 || Math.abs(width - lastWidth) > 24) {
        buildTrail();
      }
    }, 220);
  }

  function init() {
    if (document.querySelector('.paw-trail')) return;
    buildTrail();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', scheduleRebuild, { passive: true });

    if (typeof ResizeObserver === 'function' && document.body) {
      var observer = new ResizeObserver(scheduleRebuild);
      observer.observe(document.body);
    }

    window.addEventListener('load', function () {
      setTimeout(buildTrail, 120);
      setTimeout(scheduleRebuild, 900);
    }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();