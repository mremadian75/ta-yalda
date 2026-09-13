;(function () {
  'use strict';

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setText(selector, value) {
    var el = q(selector);
    if (el) el.textContent = value;
  }

  function istanbulDayIndex() {
    var cfg = window.TA_YALDA && window.TA_YALDA.config;
    var start = cfg && cfg.journeyStartsAt ? new Date(cfg.journeyStartsAt) : new Date('2026-09-13T00:00:00+03:00');
    var tz = cfg && cfg.timezone ? cfg.timezone : 'Europe/Istanbul';

    function parts(date) {
      var p = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(date);
      var obj = {};
      p.forEach(function (item) {
        if (item.type !== 'literal') obj[item.type] = Number(item.value);
      });
      return obj;
    }

    var a = parts(start);
    var b = parts(new Date());
    var startSerial = Date.UTC(a.year, a.month - 1, a.day) / 86400000;
    var nowSerial = Date.UTC(b.year, b.month - 1, b.day) / 86400000;
    return Math.max(0, Math.floor(nowSerial - startSerial));
  }

  function cleanCopy() {
    var routeFoot = q('.route-foot');
    if (routeFoot) routeFoot.remove();

    setText('[data-hero-kicker]', 'تا وقتی بالاخره ببینمت');
    setText('#today-title', 'امروز');
    setText('#unlock-title', 'برای تو');
    setText('#song-title-h', 'آهنگ امروز');
    setText('#cities-title', 'الان');
    setText('#flight-title', 'اون روز');
    setText('.foot-line', 'دوست دارم کوچولوی من ❤️');

    var mastheadMeta = q('.masthead-meta');
    if (mastheadMeta) mastheadMeta.textContent = '14 OCT · ISTANBUL';
  }

  function makeSoonSection() {
    if (!Array.isArray(window.DAILY_MEDIA) || !window.DAILY_MEDIA.length) return;
    if (q('.soon')) return;

    var song = q('.song');
    if (!song || !song.parentNode) return;

    var index = istanbulDayIndex();
    var item = window.DAILY_MEDIA[index % window.DAILY_MEDIA.length];

    var soon = document.createElement('section');
    soon.className = 'soon';
    soon.setAttribute('aria-labelledby', 'soon-title');
    soon.innerHTML = '' +
      '<div class="soon-head">' +
        '<h2 class="section-title" id="soon-title">من و تو به زودی</h2>' +
      '</div>' +
      '<div class="soon-card">' +
        '<div class="soon-media">' +
          '<video class="soon-video" data-soon-video autoplay muted loop playsinline preload="auto" aria-label="گیف امروز"></video>' +
          '<span class="soon-heart" aria-hidden="true">♡</span>' +
        '</div>' +
        '<div class="soon-copy">' +
          '<p class="soon-title" data-soon-title></p>' +
          '<p class="soon-text" data-soon-text></p>' +
        '</div>' +
      '</div>';

    var grid = document.createElement('div');
    grid.className = 'moments-grid';
    song.parentNode.insertBefore(grid, song);
    grid.appendChild(song);
    grid.appendChild(soon);

    var video = q('[data-soon-video]', soon);
    var title = q('[data-soon-title]', soon);
    var text = q('[data-soon-text]', soon);

    video.src = item.src;
    title.textContent = item.title || '';
    text.textContent = item.text || '';

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      video.removeAttribute('autoplay');
      video.pause();
    } else {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(function () {});
    }
  }

  function addLife() {
    if (q('.floating-sparks')) return;
    var sparks = document.createElement('div');
    sparks.className = 'floating-sparks';
    sparks.setAttribute('aria-hidden', 'true');
    sparks.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i>';
    document.body.appendChild(sparks);
  }

  function init() {
    document.body.classList.add('v6-polish');
    cleanCopy();
    makeSoonSection();
    addLife();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
