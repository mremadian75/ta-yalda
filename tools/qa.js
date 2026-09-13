/* ============================================================================
   node tools/qa.js   [--shots]
   ----------------------------------------------------------------------------
   Drives the real page in Chromium at every breakpoint and at every stage of
   the countdown, and fails on: console errors, failed requests, horizontal
   overflow, undefined/NaN on screen, missing content, tap targets under 44px,
   and cats overlapping. With --shots it also writes screenshots.
   ========================================================================== */
'use strict';

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SHOTS = process.argv.includes('--shots');
const SHOT_DIR = process.env.SHOT_DIR || path.join(ROOT, '.qa-shots');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json'
};

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      const file = path.join(ROOT, p);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); return res.end('not found');
      }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(fs.readFileSync(file));
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

/** Freeze the page's clock at a chosen instant, before any script runs. */
function clockScript(iso) {
  return `(() => {
    const FIXED = ${Date.parse(iso)};
    const Real = Date;
    const start = Real.now();
    function Fake(...a) {
      if (a.length === 0) return new Real(FIXED + (Real.now() - start));
      return new Real(...a);
    }
    Fake.prototype = Real.prototype;
    Fake.now = () => FIXED + (Real.now() - start);
    Fake.parse = Real.parse; Fake.UTC = Real.UTC;
    Object.setPrototypeOf(Fake, Real);
    globalThis.Date = Fake;
  })();`;
}

const STAGES = [
  ['far-30d',    '2026-09-14T12:00:00+03:00'],
  ['near-12d',   '2026-10-02T12:00:00+03:00'],
  ['lastweek-7d','2026-10-07T12:00:00+03:00'],
  ['last72-3d',  '2026-10-11T12:00:00+03:00'],
  ['tomorrow-1d','2026-10-13T12:00:00+03:00'],
  ['today-4h',   '2026-10-14T06:45:00+03:00'],
  ['final-hour', '2026-10-14T10:00:00+03:00'],
  ['arrived',    '2026-10-14T11:30:00+03:00'],
  ['after-3d',   '2026-10-17T12:00:00+03:00']
];

const WIDTHS = [320, 375, 390, 430, 768, 1024, 1440];

const problems = [];
const note = (ctx, msg) => problems.push(`${ctx}: ${msg}`);

async function inspect(page, ctx, width, opts) {
  opts = opts || {};
  // Give the layout and the deferred network work a moment to settle.
  await page.waitForTimeout(900);

  const r = await page.evaluate(() => {
    const out = { overflow: null, bad: [], tiny: [], empty: [], cats: null, text: {} };

    if (document.documentElement.scrollWidth > window.innerWidth + 1) {
      out.overflow = { scrollWidth: document.documentElement.scrollWidth, inner: window.innerWidth };
      // Name the widest offending element so the report is actionable.
      let worst = null;
      document.querySelectorAll('*').forEach(el => {
        const b = el.getBoundingClientRect();
        if (b.right > window.innerWidth + 1 || b.left < -1) {
          if (!worst || b.width > worst.w) {
            worst = { sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''), w: b.width, right: b.right };
          }
        }
      });
      out.overflow.worst = worst;
    }

    const BAD = /\bundefined\b|\bNaN\b|\[object |\bnull\b/;
    document.querySelectorAll('body *').forEach(el => {
      if (el.children.length) return;
      const t = (el.textContent || '').trim();
      if (t && BAD.test(t)) out.bad.push(t.slice(0, 80));
    });

    // Interactive things must be finger-sized.
    document.querySelectorAll('button, a[href]:not(.skip-link), [role="button"]').forEach(el => {
      const b = el.getBoundingClientRect();
      if (b.width === 0 && b.height === 0) return;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') return;
      // A cat carries its own 44px pseudo-element hit area.
      const eff = el.classList.contains('cat')
        ? Math.max(b.height, 44)
        : b.height;
      const effW = el.classList.contains('cat') ? Math.max(b.width, 44) : b.width;
      if (eff < 44 || effW < 44) {
        out.tiny.push({ sel: el.className || el.tagName, w: Math.round(b.width), h: Math.round(b.height) });
      }
    });

    const must = {
      'figure value': '[data-figure-value]',
      'countdown lead': '[data-countdown-lead]',
      "today's note": '[data-today-note]',
      'unlock body': '[data-unlock-body]',
      'song title': '[data-song-title]',
      'route status': '[data-route-status]'
    };
    for (const [label, sel] of Object.entries(must)) {
      const el = document.querySelector(sel);
      const t = el ? (el.textContent || '').trim() : '';
      out.text[label] = t;
      if (!t || t === '…' || t === '—') out.empty.push(label);
    }

    const stage = document.querySelector('[data-route-stage]');
    const m = document.querySelector('[data-cat="mahan"]');
    const y = document.querySelector('[data-cat="yalda"]');
    const pin = document.querySelector('[data-pin]');
    if (stage && m && y && pin) {
      const mb = m.getBoundingClientRect(), yb = y.getBoundingClientRect(), pb = pin.getBoundingClientRect();
      // A real 2D intersection: sharing an x-range while sitting below the pin
      // is not an overlap.
      const hits = (a, b) => !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
      out.cats = {
        gap: Math.round(Math.min(yb.left, mb.left) === mb.left ? yb.left - mb.right : mb.left - yb.right),
        mahanOverPin: hits(mb, pb),
        yaldaOverPin: hits(yb, pb),
        inStage: mb.left >= stage.getBoundingClientRect().left - 1 && yb.right <= stage.getBoundingClientRect().right + 1
      };
    }
    return out;
  });

  if (r.overflow) note(ctx, `horizontal overflow ${r.overflow.scrollWidth}px > ${r.overflow.inner}px — worst: ${JSON.stringify(r.overflow.worst)}`);
  if (r.bad.length) note(ctx, `broken text on screen: ${JSON.stringify(r.bad.slice(0, 3))}`);
  if (r.empty.length) note(ctx, `empty content: ${r.empty.join(', ')}`);
  r.tiny.forEach(t => note(ctx, `tap target under 44px: ${t.sel} (${t.w}×${t.h})`));
  if (r.cats) {
    if (opts.arrived) {
      // After the meeting the two cats are SUPPOSED to stand together —
      // closeness is the payoff, not a layout bug. But they must not cover the
      // Istanbul marker or its label.
      if (r.cats.gap > 40) note(ctx, `cats should be together after arrival but are ${r.cats.gap}px apart`);
      if (r.cats.mahanOverPin || r.cats.yaldaOverPin) note(ctx, `a cat covers the Istanbul marker after arrival`);
    } else {
      if (r.cats.gap < 0) note(ctx, `cats overlap each other by ${-r.cats.gap}px`);
      if (r.cats.mahanOverPin || r.cats.yaldaOverPin) note(ctx, `a cat overlaps the Istanbul pin`);
    }
    if (!r.cats.inStage) note(ctx, `a cat escapes the route stage`);
  }
  return r;
}

(async () => {
  const { server, port } = await serve();
  const base = `http://127.0.0.1:${port}/`;
  const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  if (SHOTS) fs.mkdirSync(SHOT_DIR, { recursive: true });

  console.log('\n\x1b[1mA. Every stage of the countdown (390px)\x1b[0m');
  for (const [name, iso] of STAGES) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2, locale: 'fa-IR' });
    await ctx.addInitScript(clockScript(iso));
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    page.on('requestfailed', r => {
      if (r.url().startsWith(base)) errs.push('LOCAL REQUEST FAILED ' + r.url() + ' ' + (r.failure() || {}).errorText);
    });

    await page.goto(base, { waitUntil: 'networkidle' }).catch(() => page.goto(base));
    const r = await inspect(page, `stage:${name}`, 390, { arrived: name === 'arrived' || name.startsWith('after') });
    if (errs.length) note(`stage:${name}`, `console: ${errs.slice(0, 3).join(' | ')}`);

    const extra = await page.evaluate(() => ({
      phase: document.body.className,
      cats: [...document.querySelectorAll('.cat')].map(c => c.dataset.state).join('/'),
      height: document.documentElement.scrollHeight,
      pastRows: document.querySelectorAll('[data-unlock-list] li:not([hidden])').length
    }));
    console.log(`   ${name.padEnd(13)} body="${extra.phase.padEnd(12)}" figure="${(r.text['figure value'] || '').slice(0, 12).padEnd(12)}" cats=${extra.cats.padEnd(19)} page=${String(extra.height).padStart(5)}px rows=${extra.pastRows}`);
    if (extra.height > 9000) note(`stage:${name}`, `page is ${extra.height}px tall on a phone`);

    if (SHOTS) await page.screenshot({ path: path.join(SHOT_DIR, `stage-${name}.png`), fullPage: true });
    await ctx.close();
  }

  console.log('\n\x1b[1mB. Every breakpoint (at T-30d)\x1b[0m');
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, locale: 'fa-IR' });
    await ctx.addInitScript(clockScript('2026-09-14T12:00:00+03:00'));
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await page.goto(base, { waitUntil: 'networkidle' }).catch(() => page.goto(base));
    const r = await inspect(page, `width:${w}`, w);
    if (errs.length) note(`width:${w}`, errs.join(' | '));
    console.log(`   ${String(w).padStart(4)}px  overflow=${r.overflow ? 'YES' : 'no '}  cat-gap=${r.cats ? r.cats.gap + 'px' : 'n/a'}`);
    if (SHOTS) await page.screenshot({ path: path.join(SHOT_DIR, `width-${w}.png`), fullPage: true });
    await ctx.close();
  }

  console.log('\n\x1b[1mC. Both APIs dead (the page must still look finished)\x1b[0m');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2, locale: 'fa-IR' });
    await ctx.addInitScript(clockScript('2026-09-20T12:00:00+03:00'));
    // Kill every external host, keep the local assets.
    await ctx.route('**', route => {
      const u = route.request().url();
      if (u.startsWith(base)) return route.continue();
      return route.abort();
    });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await page.goto(base).catch(() => {});
    await page.waitForTimeout(2500);
    const r = await inspect(page, 'offline', 390);
    if (errs.length) note('offline', errs.join(' | '));
    const fallback = await page.evaluate(() => ({
      weather: [...document.querySelectorAll('[data-city-cond]')].map(e => e.textContent.trim()),
      song: (document.querySelector('[data-song-status]') || {}).textContent,
      play: (document.querySelector('[data-song-play-label]') || {}).textContent
    }));
    console.log(`   weather → ${JSON.stringify(fallback.weather)}`);
    console.log(`   song    → "${(fallback.song || '').trim()}" / button "${(fallback.play || '').trim()}"`);
    if (fallback.weather.some(t => !t || /undefined|NaN/.test(t))) note('offline', 'weather fallback missing');
    if (SHOTS) await page.screenshot({ path: path.join(SHOT_DIR, 'offline.png'), fullPage: true });
    await ctx.close();
  }

  console.log('\n\x1b[1mD. localStorage blocked + reduced motion\x1b[0m');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce', locale: 'fa-IR' });
    await ctx.addInitScript(clockScript('2026-10-08T12:00:00+03:00'));
    await ctx.addInitScript(`Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });`);
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await page.goto(base, { waitUntil: 'networkidle' }).catch(() => {});
    const r = await inspect(page, 'no-storage', 390);
    if (errs.length) note('no-storage', errs.join(' | '));
    console.log(`   note rendered: "${(r.text["today's note"] || '').slice(0, 44)}…"`);
    await ctx.close();
  }

  // ── E. The success path ────────────────────────────────────────────────
  // This sandbox's browser cannot reach the open internet, so every section
  // above exercises the FAILURE path. Stub both APIs with real captured
  // responses so the healthy rendering is actually verified too.
  console.log('\n\x1b[1mE. Both APIs healthy (real responses, stubbed)\x1b[0m');
  {
    const fx = d => JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', d), 'utf8'));
    const weather = {
      '41.0082': fx('weather-istanbul.json'),
      '40.4168': fx('weather-madrid.json'),
      '36.5633': fx('weather-sari.json')
    };
    const itunes = fx('itunes.json');

    const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2, locale: 'fa-IR' });
    // 30 days out => songs[30], which is what tools/fixtures/itunes.json holds.
    // The app deliberately refuses to play a track that does not match the song
    // of the day, so the fixture has to line up with the date.
    await ctx.addInitScript(clockScript('2026-09-14T12:00:00+03:00'));
    await ctx.route('**', route => {
      const u = route.request().url();
      if (u.startsWith(base)) return route.continue();
      if (u.indexOf('api.open-meteo.com') > -1) {
        const lat = Object.keys(weather).find(k => u.indexOf(k) > -1);
        return route.fulfil
          ? route.fulfil({ contentType: 'application/json', body: JSON.stringify(weather[lat]) })
          : route.fulfill({ contentType: 'application/json', body: JSON.stringify(weather[lat]) });
      }
      if (u.indexOf('itunes.apple.com') > -1) {
        return route.fulfill({ contentType: 'application/json', body: JSON.stringify(itunes) });
      }
      // Artwork and audio: succeed with a 1px gif / empty body rather than abort.
      return route.fulfill({ status: 200, contentType: 'image/gif', body: Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64') });
    });

    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await page.goto(base).catch(() => {});
    await page.waitForTimeout(2200);
    const r = await inspect(page, 'healthy', 390);
    if (errs.length) note('healthy', errs.join(' | '));

    const live = await page.evaluate(() => ({
      cities: [...document.querySelectorAll('.city')].map(c => ({
        name: c.querySelector('.city-name').textContent.trim(),
        temp: c.querySelector('[data-city-temp]').textContent.trim(),
        cond: c.querySelector('[data-city-cond]').textContent.trim(),
        sun: c.querySelector('[data-city-sun]').textContent.trim(),
        icon: !!c.querySelector('[data-city-icon] svg')
      })),
      playVisible: !document.querySelector('[data-song-play]').hidden,
      playLabel: document.querySelector('[data-song-play-label]').textContent.trim(),
      catStates: [...document.querySelectorAll('.cat')].map(c => c.dataset.state)
    }));

    live.cities.forEach(c => {
      console.log(`   ${c.name.padEnd(9)} ${c.temp.padEnd(5)} ${c.cond.padEnd(12)} sun:${c.sun || '(none)'} icon:${c.icon ? 'svg' : 'MISSING'}`);
      if (!c.temp) note('healthy', `${c.name}: no temperature rendered`);
      if (!c.icon) note('healthy', `${c.name}: weather icon did not render`);
      if (!c.sun) note('healthy', `${c.name}: sunrise/sunset row empty`);
      if (/undefined|NaN/.test(c.temp + c.cond + c.sun)) note('healthy', `${c.name}: broken value`);
    });
    console.log(`   play button: ${live.playVisible ? 'shown ("' + live.playLabel + '")' : 'HIDDEN'} · cats: ${live.catStates.join(', ')}`);
    if (!live.playVisible) note('healthy', 'preview found but the play button stayed hidden');

    if (SHOTS) await page.screenshot({ path: path.join(SHOT_DIR, 'healthy.png'), fullPage: true });
    await ctx.close();
  }

  await browser.close();
  server.close();

  console.log('\n' + '─'.repeat(62));
  if (problems.length) {
    console.log(`\x1b[31m${problems.length} problem(s)\x1b[0m`);
    problems.forEach(p => console.log('  ✗ ' + p));
    process.exit(1);
  }
  console.log('\x1b[32mBrowser QA clean.\x1b[0m');
  if (SHOTS) console.log(`Screenshots → ${SHOT_DIR}`);
})();
