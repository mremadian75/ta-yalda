;(function () {
  'use strict';

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function redistributeCats() {
    var cats = Array.prototype.slice.call(document.querySelectorAll('.page-kitten'));
    if (!cats.length) return;

    /* Spread across the whole document rather than pinning four cats to the
       current viewport. This keeps them cute without parking one on top of a
       heading while the user scrolls. */
    var zones = [
      [8, 19],
      [31, 43],
      [58, 70],
      [79, 92]
    ];

    cats.forEach(function (cat, index) {
      var zone = zones[index % zones.length];
      cat.style.setProperty('--kitten-top', rand(zone[0], zone[1]).toFixed(2) + '%');
      cat.style.setProperty('--kitten-edge', rand(0.8, 2.6).toFixed(2) + 'vw');
    });
  }

  function clampHorizontalViewport() {
    document.documentElement.style.maxWidth = '100%';
    document.body.style.maxWidth = '100%';

    /* Some Android browsers restore an old horizontal scroll offset after a
       stylesheet changes. Reset it once after layout settles. */
    requestAnimationFrame(function () {
      if (window.scrollX !== 0) window.scrollTo(0, window.scrollY);
    });
  }

  function init() {
    document.body.classList.add('v8-mobile-hotfix');
    redistributeCats();
    clampHorizontalViewport();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.addEventListener('pageshow', clampHorizontalViewport);
})();
