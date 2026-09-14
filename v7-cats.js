;(function () {
  'use strict';

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function catSvg(color, accent) {
    return '' +
      '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
        '<path class="mini-cat-tail" d="M16 46c-9 1-12-5-8-10" fill="none" stroke="' + accent + '" stroke-width="3.8" stroke-linecap="round"/>' +
        '<path d="M17 24 13 11l12 7c2-1 4-1 7-1s5 0 7 1l12-7-4 13c4 4 6 9 6 14 0 11-8 18-21 18S11 49 11 38c0-5 2-10 6-14Z" fill="' + color + '"/>' +
        '<path d="M19 22l-3-7 7 4.3Z" fill="' + accent + '" opacity=".55"/>' +
        '<path d="M45 22l3-7-7 4.3Z" fill="' + accent + '" opacity=".55"/>' +
        '<circle class="mini-cat-eye" cx="24" cy="34" r="2.8" fill="#1b0c24"/>' +
        '<circle class="mini-cat-eye" cx="40" cy="34" r="2.8" fill="#1b0c24"/>' +
        '<circle cx="24.8" cy="33.1" r=".75" fill="#ffffff" opacity=".92"/>' +
        '<circle cx="40.8" cy="33.1" r=".75" fill="#ffffff" opacity=".92"/>' +
        '<path class="mini-cat-nose" d="M29.6 39h4.8L32 41.4Z" fill="' + accent + '" stroke="#4d244d" stroke-width=".55" stroke-linejoin="round"/>' +
        '<path class="mini-cat-mouth" d="M32 41.1v2.1M32 43.2c-1.6 0-2.7 1-3.5 1.9M32 43.2c1.6 0 2.7 1 3.5 1.9" fill="none" stroke="#1b0c24" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<circle cx="20" cy="41" r="2.6" fill="' + accent + '" opacity=".22"/>' +
        '<circle cx="44" cy="41" r="2.6" fill="' + accent + '" opacity=".22"/>' +
        '<path d="M20 39h-8M20 42l-8 2M44 39h8M44 42l8 2" fill="none" stroke="#5a4167" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>' +
      '</svg>';
  }

  function addRandomCats() {
    if (q('.page-kittens')) return;

    var palette = [
      ['#fff3f8', '#ff7fb1'],
      ['#f2ebff', '#9c83ff'],
      ['#ffe8d8', '#ff9569'],
      ['#e9f4ff', '#6f9cff']
    ];

    var zones = [
      { top: [10, 23], side: 'left' },
      { top: [31, 45], side: 'right' },
      { top: [57, 70], side: 'left' },
      { top: [77, 91], side: 'right' }
    ];

    var wrap = document.createElement('div');
    wrap.className = 'page-kittens';
    wrap.setAttribute('aria-hidden', 'true');

    zones.forEach(function (zone, i) {
      var cat = document.createElement('span');
      cat.className = 'page-kitten page-kitten-' + (i + 1);
      cat.style.setProperty('--kitten-top', rand(zone.top[0], zone.top[1]).toFixed(2) + 'vh');
      cat.style.setProperty('--kitten-edge', rand(0.6, 4.8).toFixed(2) + 'vw');
      cat.style.setProperty('--kitten-rotate', rand(-13, 13).toFixed(1) + 'deg');
      cat.style.setProperty('--kitten-delay', (-rand(0, 4)).toFixed(2) + 's');
      cat.dataset.side = zone.side;
      cat.innerHTML = catSvg(palette[i][0], palette[i][1]);
      wrap.appendChild(cat);
    });

    document.body.appendChild(wrap);
  }

  function tidySoonCopy() {
    var soon = q('.soon');
    if (!soon) return;
    var title = q('[data-soon-title]', soon);
    var text = q('[data-soon-text]', soon);
    var copy = q('.soon-copy', soon);
    var hasCopy = Boolean((title && title.textContent.trim()) || (text && text.textContent.trim()));
    if (!hasCopy && copy) {
      copy.remove();
      var card = q('.soon-card', soon);
      if (card) card.classList.add('is-media-only');
    }
  }

  function init() {
    document.body.classList.add('v7-handwritten');
    tidySoonCopy();
    addRandomCats();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
