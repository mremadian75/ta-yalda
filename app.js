/* ============================================================================
   تا یلدا — application logic
   ----------------------------------------------------------------------------
   All editable personal content lives in data.js. This file only contains
   behaviour, so you can rewrite every message without touching it.

   Design rules this file follows:
   - Istanbul is the canonical timezone for every "what day is it" decision.
   - Content is keyed by DAYS REMAINING, never by "days since launch", so the
     emotional arc still lines up if the meeting date is ever moved.
   - Every external request has a timeout, a cache and a Persian fallback.
   - Nothing on screen may ever read "undefined", "NaN" or "--" forever.
   ========================================================================== */
'use strict';

(function () {
  // `window` in a browser, `global` in the Node test harness. Avoids globalThis,
  // which does not exist before Chrome 71 / iOS Safari 12.2.
  var ROOT = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this);
  const DATA = ROOT && ROOT.TA_YALDA;
  // If data.js failed to load, leave the static HTML alone rather than throwing.
  if (!DATA || !DATA.config) return;
  const CFG = DATA.config;

  const MS = { sec: 1000, min: 60000, hour: 3600000, day: 86400000 };
  const MEETING_TS = Date.parse(CFG.meetingAt);

  /* ==========================================================================
     1. Small utilities
     ========================================================================== */

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  /** Persian numerals for Persian sentences. Latin numerals stay in mono metadata. */
  function faNum(n) {
    return String(n).replace(/\d/g, d => FA_DIGITS[+d]);
  }
  const pad2 = n => (n < 10 ? '0' : '') + n;

  /** Write only when the value actually changed — avoids per-second layout churn. */
  function setText(el, value) {
    if (el && el.textContent !== value) el.textContent = value;
  }

  /** localStorage that never throws (Safari private mode, blocked cookies, quota). */
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        if (raw == null) return fallback;
        return JSON.parse(raw);
      } catch (_) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (_) {
        return false;
      }
    }
  };

  /** Deterministic per-day hash so "random" content is stable for a whole day. */
  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0);
  }

  /* ==========================================================================
     2. Time — everything anchored to Istanbul
     ========================================================================== */

  // Intl formatters are expensive. The old build made three per second.
  const fmtCache = new Map();
  function formatter(tz, opts) {
    const key = tz + '|' + JSON.stringify(opts);
    let f = fmtCache.get(key);
    if (!f) {
      f = new Intl.DateTimeFormat('en-GB', Object.assign({ timeZone: tz }, opts));
      fmtCache.set(key, f);
    }
    return f;
  }

  const DATE_PARTS = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };

  /**
   * Correction for a wrong device clock.
   *
   * The whole site is a countdown, so a phone whose date is days out would show
   * a confidently wrong number — or spend the arrival early and never get it
   * back. Open-Meteo already returns a trusted wall clock for Istanbul, so we
   * use it as a second opinion. It is quantised to 15 minutes, so we only
   * correct a skew big enough to be a real fault rather than rounding.
   */
  let clockOffset = 0;
  const SKEW_THRESHOLD = 30 * 60 * 1000;

  function now() { return Date.now() + clockOffset; }

  function calibrateClock(currentTimeLocal, utcOffsetSeconds) {
    if (typeof currentTimeLocal !== 'string' || typeof utcOffsetSeconds !== 'number') return false;
    const trustedUtc = Date.parse(currentTimeLocal + 'Z') - utcOffsetSeconds * 1000;
    if (!isFinite(trustedUtc)) return false;
    const skew = trustedUtc - Date.now();
    if (Math.abs(skew) > SKEW_THRESHOLD) {
      clockOffset = skew;
      return true;
    }
    return false;
  }

  function partsInTZ(ts, tz) {
    const parts = formatter(tz, DATE_PARTS).formatToParts(new Date(ts));
    const out = {};
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].type !== 'literal') out[parts[i].type] = parts[i].value;
    }
    return { year: +out.year, month: +out.month, day: +out.day, hour: +out.hour, minute: +out.minute };
  }

  /** Days since epoch *as counted on that timezone's wall calendar*. */
  function daySerialInTZ(ts, tz) {
    const p = partsInTZ(ts, tz);
    return Math.round(Date.UTC(p.year, p.month - 1, p.day) / MS.day);
  }

  function dayKeyInTZ(ts, tz) {
    const p = partsInTZ(ts, tz);
    return p.year + '-' + pad2(p.month) + '-' + pad2(p.day);
  }

  function hourInTZ(ts, tz) {
    return partsInTZ(ts, tz).hour;
  }

  function clockInTZ(ts, tz) {
    return formatter(tz, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(ts));
  }

  /**
   * The single source of truth for "where are we in the story".
   * Exported and unit-tested against every phase boundary.
   */
  function computeState(now) {
    const delta = MEETING_TS - now;
    const tz = CFG.timezone;
    const daysRemaining = daySerialInTZ(MEETING_TS, tz) - daySerialInTZ(now, tz);

    let phase;
    if (delta <= 0) phase = 'arrived';
    else if (daysRemaining <= 0) phase = 'today';
    else if (daysRemaining === 1) phase = 'tomorrow';
    else if (daysRemaining <= 3) phase = 'last72';
    else if (daysRemaining <= 7) phase = 'lastweek';
    else if (daysRemaining <= 14) phase = 'near';
    else phase = 'far';

    return {
      now: now,
      delta: delta,
      daysRemaining: Math.max(0, daysRemaining),
      phase: phase,
      isFinalHour: delta > 0 && delta <= MS.hour,
      dayKey: dayKeyInTZ(now, tz),
      // How far along the journey, 0 → 1. Clamped so it cannot go negative if
      // someone opens the site before the journey officially "starts".
      progress: clamp((now - Date.parse(CFG.journeyStartsAt)) / (MEETING_TS - Date.parse(CFG.journeyStartsAt)), 0, 1)
    };
  }

  /* ==========================================================================
     3. Content resolution
     ========================================================================== */

  /**
   * Pick the day's entry. If the meeting is further out than the written arc
   * (because the date moved), fall back to the evergreen pool — chosen by a
   * hash of the calendar date so it is stable all day rather than per refresh.
   */
  function contentForState(state) {
    if (state.phase === 'arrived') {
      return { note: DATA.arrival.note, unlock: DATA.arrival.unlock, unlockKind: DATA.arrival.unlockKind, source: 'arrival' };
    }
    const entry = DATA.days[state.daysRemaining];
    if (entry) {
      return { note: entry.note, unlock: entry.unlock, unlockKind: entry.unlockKind, source: 'arc' };
    }
    const pool = DATA.evergreen;
    const pick = pool[hashString(state.dayKey) % pool.length];
    return { note: pick.note, unlock: pick.unlock, unlockKind: pick.unlockKind, source: 'evergreen' };
  }

  /** A day's entry is open once its date has arrived: key K unlocks when remaining ≤ K. */
  function unlockedDays(state) {
    const keys = Object.keys(DATA.days).map(Number).sort((a, b) => b - a);
    return keys.filter(k => k >= state.daysRemaining);
  }

  /* ==========================================================================
     4. Network — timeout + cache + graceful failure
     ========================================================================== */

  async function fetchJSON(url, opts) {
    opts = opts || {};
    const timeout = opts.timeout || 8000;

    if (opts.cacheKey) {
      const hit = store.get(opts.cacheKey, null);
      if (hit && typeof hit.t === 'number' && Date.now() - hit.t < (opts.ttl || 0)) return hit.d;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { signal: controller.signal, mode: 'cors', credentials: 'omit' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (opts.cacheKey) store.set(opts.cacheKey, { t: Date.now(), d: data });
      // Only a genuinely fresh response is worth trusting as a clock.
      if (typeof opts.onFresh === 'function') opts.onFresh(data);
      return data;
    } finally {
      clearTimeout(timer);
    }
  }

  /* ==========================================================================
     5. Geography
     ========================================================================== */

  function haversineKm(a, b) {
    const R = 6371;
    const rad = d => (d * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat);
    const dLon = rad(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(h)));
  }

  /** Point on a quadratic bézier — the cats' flight arcs. */
  function bezier(p0, p1, p2, t) {
    const u = 1 - t;
    return {
      x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
      y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y
    };
  }

  // Must mirror the <path> d="" values in index.html (viewBox 0 0 1000 380).
  const ARCS = {
    mahan: { p0: { x: 70, y: 316 }, p1: { x: 250, y: 132 }, p2: { x: 500, y: 120 } },
    yalda: { p0: { x: 930, y: 316 }, p1: { x: 750, y: 132 }, p2: { x: 500, y: 120 } }
  };
  const VIEW = { w: 1000, h: 380 };
  // Where the two cats stand once she has landed: the altitude they set off
  // from, directly under the Istanbul marker rather than over its label.
  const ARRIVED_Y = 316;

  /* ==========================================================================
     6. Weather
     ========================================================================== */

  // WMO code → { fa label, icon key }. Anything unmapped degrades to a neutral entry.
  const WEATHER = {
    0: ['آفتابی', 'sun'], 1: ['کمی ابری', 'sun'], 2: ['نیمه‌ابری', 'cloud-sun'], 3: ['ابری', 'cloud'],
    45: ['مه', 'fog'], 48: ['مه', 'fog'],
    51: ['نم‌نم باران', 'rain'], 53: ['نم‌نم باران', 'rain'], 55: ['نم‌نم باران', 'rain'],
    56: ['باران یخ‌زده', 'rain'], 57: ['باران یخ‌زده', 'rain'],
    61: ['باران', 'rain'], 63: ['باران', 'rain'], 65: ['باران شدید', 'rain'],
    66: ['باران یخ‌زده', 'rain'], 67: ['باران یخ‌زده', 'rain'],
    71: ['برف', 'snow'], 73: ['برف', 'snow'], 75: ['برف سنگین', 'snow'], 77: ['برف', 'snow'],
    80: ['رگبار', 'rain'], 81: ['رگبار', 'rain'], 82: ['رگبار شدید', 'rain'],
    85: ['بارش برف', 'snow'], 86: ['بارش برف', 'snow'],
    95: ['رعدوبرق', 'storm'], 96: ['رعدوبرق و تگرگ', 'storm'], 99: ['رعدوبرق و تگرگ', 'storm']
  };
  const RAINY = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);

  const WEATHER_ICONS = {
    sun: '<circle cx="12" cy="12" r="4.6"/><path d="M12 1.6v2.6M12 19.8v2.6M22.4 12h-2.6M4.2 12H1.6M19.4 4.6l-1.9 1.9M6.5 17.5l-1.9 1.9M19.4 19.4l-1.9-1.9M6.5 6.5 4.6 4.6"/>',
    'cloud-sun': '<circle cx="8.4" cy="8.4" r="3.2"/><path d="M8.4 2.2v1.8M2.2 8.4H4M12.8 4 11.6 5.2M4 4l1.2 1.2"/><path d="M8 19.4h8.8a3.6 3.6 0 0 0 0-7.2 5 5 0 0 0-9.5 1.2A3 3 0 0 0 8 19.4Z"/>',
    cloud: '<path d="M7.4 19.4h9.2a3.8 3.8 0 0 0 0-7.6 5.4 5.4 0 0 0-10.2 1.3 3.2 3.2 0 0 0 1 6.3Z"/>',
    fog: '<path d="M4 9h16M2.6 13h18.8M5 17h14M7.5 21h9"/>',
    rain: '<path d="M7.4 15.6h9.2a3.8 3.8 0 0 0 0-7.6A5.4 5.4 0 0 0 6.4 9.3a3.2 3.2 0 0 0 1 6.3Z"/><path d="M9 18.4 8 21.4M13 18.4 12 21.4M17 18.4l-1 3"/>',
    snow: '<path d="M7.4 15.2h9.2a3.8 3.8 0 0 0 0-7.6A5.4 5.4 0 0 0 6.4 8.9a3.2 3.2 0 0 0 1 6.3Z"/><path d="M9 19h.01M13 19h.01M17 19h.01M11 21.6h.01M15 21.6h.01"/>',
    storm: '<path d="M7.4 14.6h9.2a3.8 3.8 0 0 0 0-7.6A5.4 5.4 0 0 0 6.4 8.3a3.2 3.2 0 0 0 1 6.3Z"/><path d="m13 16-3 4h3.6l-1.2 3.4"/>',
    none: '<circle cx="12" cy="12" r="1.4"/>'
  };

  const SUN_UP_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v3M5.6 11H3M21 11h-2.6M7.4 6.4 5.8 4.8M16.6 6.4l1.6-1.6M4 20h16M7 16.5a5 5 0 0 1 10 0"/></svg>';
  const SUN_DOWN_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 9.5v-3M5.6 11H3M21 11h-2.6M7.4 6.4 5.8 4.8M16.6 6.4l1.6-1.6M4 20h16M7 16.5a5 5 0 0 1 10 0"/><path d="m9.5 7 2.5 2.5L14.5 7"/></svg>';

  function weatherSVG(iconKey) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (WEATHER_ICONS[iconKey] || WEATHER_ICONS.none) + '</svg>';
  }

  /* ==========================================================================
     7. Rendering
     ========================================================================== */

  const el = {};
  const memo = { announce: '', dayKey: '', phase: '', unlockSignature: '' };
  const weatherByCity = {};

  function cacheDom() {
    el.body = document.body;
    el.heroKicker = $('[data-hero-kicker]');
    el.heroSub = $('[data-hero-sub]');
    el.countdownLead = $('[data-countdown-lead]');
    el.figureValue = $('[data-figure-value]');
    el.figureUnit = $('[data-figure-unit]');
    el.detail = $('[data-detail]');
    el.detailLabels = $('[data-detail-labels]');
    el.announce = $('[data-announce]');
    el.routeStage = $('[data-route-stage]');
    el.routeStatus = $('[data-route-status]');
    el.pin = $('[data-pin]');
    el.cats = { mahan: $('[data-cat="mahan"]'), yalda: $('[data-cat="yalda"]') };
    el.doneLines = { mahan: $('[data-line-done="mahan"]'), yalda: $('[data-line-done="yalda"]') };
    el.todayNote = $('[data-today-note]');
    el.todayStamp = $('[data-today-stamp]');
    el.todaySign = $('[data-today-sign]');
    el.unlockKind = $('[data-unlock-kind]');
    el.unlockBody = $('[data-unlock-body]');
    el.unlockCount = $('[data-unlock-count]');
    el.unlockPast = $('[data-unlock-past]');
    el.unlockList = $('[data-unlock-list]');
    el.unlockMore = $('[data-unlock-more]');
    el.unlockLocked = $('[data-unlock-locked]');
    el.whisper = $('[data-whisper]');
    el.whisperText = $('[data-whisper-text]');
    el.sheet = $('[data-sheet]');
    el.footYear = $('[data-foot-year]');
  }

  /* ---------------------------------------------------------------- countdown */

  function renderCountdown(state) {
    if (state.phase === 'arrived') {
      setText(el.countdownLead, DATA.arrival.countdownLead);
      setText(el.figureValue, DATA.arrival.figure);
      setText(el.figureUnit, '');
      setText(el.detail, '');
      setText(el.detailLabels, '');
      announce(DATA.arrival.announce);
      return;
    }

    const d = state.delta;
    // NB: the day count comes from state.daysRemaining (Istanbul calendar days),
    // never from Math.floor(delta / day). Deriving it two different ways is what
    // made the old build show two contradictory numbers on the same screen.
    const hours = Math.floor((d % MS.day) / MS.hour);
    const minutes = Math.floor((d % MS.hour) / MS.min);
    const seconds = Math.floor((d % MS.min) / MS.sec);

    const copy = DATA.phases[state.phase] || DATA.phases.far;
    setText(el.countdownLead, state.isFinalHour && copy.leadFinalHour ? copy.leadFinalHour : copy.lead);

    // The emphasis moves as the meeting approaches: days → hours → minutes.
    if (state.isFinalHour) {
      setText(el.figureValue, faNum(minutes));
      setText(el.figureUnit, 'دقیقه');
      setText(el.detail, pad2(seconds));
      setText(el.detailLabels, 'seconds');
    } else if (state.phase === 'today') {
      setText(el.figureValue, faNum(hours));
      setText(el.figureUnit, 'ساعت');
      setText(el.detail, pad2(minutes) + ' : ' + pad2(seconds));
      setText(el.detailLabels, 'minutes · seconds');
    } else {
      setText(el.figureValue, faNum(state.daysRemaining));
      setText(el.figureUnit, 'روز');
      setText(el.detail, pad2(hours) + ' : ' + pad2(minutes) + ' : ' + pad2(seconds));
      setText(el.detailLabels, 'hours · minutes · seconds');
    }

    // Screen readers get a sentence once a minute, never a per-second digit storm.
    let sentence;
    if (state.phase === 'today') sentence = faNum(hours) + ' ساعت و ' + faNum(minutes) + ' دقیقه مانده.';
    else sentence = faNum(state.daysRemaining) + ' روز و ' + faNum(hours) + ' ساعت مانده تا رسیدن به استانبول.';
    announce(sentence);
  }

  function announce(sentence) {
    if (memo.announce === sentence) return;
    memo.announce = sentence;
    setText(el.announce, sentence);
  }

  /* -------------------------------------------------------------------- route */

  /**
   * Where the two cats sit, in px, given the stage size.
   *
   * Pure on purpose: the bézier maths alone let the cats collide with each
   * other and with the Istanbul pin at narrow widths, so the separation is
   * enforced geometrically here and unit-tested at every breakpoint in
   * tools/test-phases.js rather than being left to chance.
   */
  function catPositions(opts) {
    const width = opts.width;
    const height = opts.height;
    const catW = opts.catW;
    const pinW = opts.pinW;
    const arrived = !!opts.arrived;

    const scaleX = width / VIEW.w;
    const scaleY = height / VIEW.h;

    // Cats travel most of the arc but never all of it — the last stretch is
    // reserved for the arrival state, when they finally stand together.
    const t = arrived ? 1 : clamp(opts.progress, 0, 1) * 0.86;

    const pM = bezier(ARCS.mahan.p0, ARCS.mahan.p1, ARCS.mahan.p2, t);
    const pY = bezier(ARCS.yalda.p0, ARCS.yalda.p1, ARCS.yalda.p2, t);

    let xM = pM.x * scaleX;
    let xY = pY.x * scaleX;
    const centre = ARCS.mahan.p2.x * scaleX;

    if (arrived) {
      // Side by side at the meeting point, just touching — but BELOW the pin,
      // not on top of it, or they cover the "Istanbul" label.
      const half = catW * 0.42;
      xM = centre - half;
      xY = centre + half;
      const y = ARRIVED_Y * scaleY;
      return { t: t, mahan: { x: xM, y: y }, yalda: { x: xY, y: y } };
    } else {
      const keepOut = pinW / 2 + catW / 2 + 6;
      xM = Math.min(xM, centre - keepOut);
      xY = Math.max(xY, centre + keepOut);
      // Never let them cross or touch each other.
      const minGap = catW + 8;
      if (xY - xM < minGap) {
        const mid = (xM + xY) / 2;
        xM = mid - minGap / 2;
        xY = mid + minGap / 2;
      }
      // Keep both fully inside the stage.
      xM = clamp(xM, catW / 2 + 2, width - catW / 2 - 2);
      xY = clamp(xY, catW / 2 + 2, width - catW / 2 - 2);
    }

    return {
      t: t,
      mahan: { x: xM, y: pM.y * scaleY },
      yalda: { x: xY, y: pY.y * scaleY }
    };
  }

  function renderRoute(state) {
    const stage = el.routeStage;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    if (!rect.width) return;

    const pos = catPositions({
      width: rect.width,
      height: rect.height,
      catW: (el.cats.mahan && el.cats.mahan.offsetWidth) || 40,
      pinW: (el.pin && el.pin.offsetWidth) || 28,
      progress: state.progress,
      arrived: state.phase === 'arrived'
    });
    const t = pos.t;

    place(el.cats.mahan, pos.mahan.x, pos.mahan.y);
    place(el.cats.yalda, pos.yalda.x, pos.yalda.y);

    // Draw the travelled part of each arc.
    setDashProgress(el.doneLines.mahan, t);
    setDashProgress(el.doneLines.yalda, t);

    const status = state.phase === 'arrived'
      ? DATA.arrival.routeStatus
      : faNum(state.daysRemaining) + (state.daysRemaining === 1 ? ' روز مانده' : ' روز مانده');
    setText(el.routeStatus, status);
  }

  function place(node, x, y) {
    if (!node) return;
    node.style.left = x + 'px';
    node.style.top = y + 'px';
  }

  function setDashProgress(path, t) {
    if (!path || typeof path.getTotalLength !== 'function') return;
    let len = 0;
    try { len = path.getTotalLength(); } catch (_) { return; }
    if (!len) return;
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len * (1 - t);
  }

  /* --------------------------------------------------------------------- cats */

  function catStateFor(who, state) {
    if (state.phase === 'arrived') return 'together';
    if (state.phase === 'today') return 'waiting';
    if (state.daysRemaining <= 3) return 'excited';
    if (state.daysRemaining <= 7) return 'packing';

    const cityKey = CFG.catCity[who];
    const w = weatherByCity[cityKey];
    if (w && RAINY.has(w.code)) return 'rain';

    const hour = hourInTZ(state.now, CFG.cities[cityKey].timezone);
    if (hour >= 23 || hour < 6) return 'sleeping';
    if (hour < 9) return 'stretching';
    return 'awake';
  }

  function renderCats(state) {
    ['mahan', 'yalda'].forEach(who => {
      const node = el.cats[who];
      if (!node) return;
      const next = catStateFor(who, state);
      if (node.dataset.state !== next) node.dataset.state = next;
    });
  }

  /* ------------------------------------------------------------ today + arc */

  function renderDay(state) {
    const content = contentForState(state);

    setText(el.todayNote, content.note);
    setText(el.todaySign, DATA.signature);
    setText(el.todayStamp, formatter(CFG.timezone, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(state.now)).toUpperCase());

    setText(el.unlockKind, DATA.unlockKinds[content.unlockKind] || DATA.unlockKinds.note);
    setText(el.unlockBody, content.unlock);

    renderUnlockHistory(state);
  }

  function renderUnlockHistory(state) {
    const open = unlockedDays(state).filter(k => k !== state.daysRemaining);
    const signature = state.dayKey + '|' + open.length;
    if (memo.unlockSignature === signature) return;
    memo.unlockSignature = signature;

    // How many have actually been opened: the past ones, plus today's if today
    // is inside the written arc.
    const openedCount = open.length + (DATA.days[state.daysRemaining] ? 1 : 0);

    if (open.length) {
      el.unlockPast.hidden = false;
      const list = el.unlockList;
      list.textContent = '';
      // Newest first: smaller daysRemaining is more recent.
      open.sort((a, b) => a - b).forEach(k => {
        const entry = DATA.days[k];
        if (!entry) return;
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'unlock-item';

        const kind = document.createElement('span');
        kind.className = 'unlock-item-kind';
        kind.textContent = DATA.unlockKinds[entry.unlockKind] || DATA.unlockKinds.note;

        const peek = document.createElement('span');
        peek.className = 'unlock-item-peek';
        peek.textContent = entry.unlock;

        const meta = document.createElement('span');
        meta.className = 'unlock-item-meta';
        meta.setAttribute('dir', 'ltr');
        meta.textContent = 'D-' + k;

        btn.append(kind, peek, meta);
        btn.setAttribute('aria-label', 'باز کردن یادداشت ' + faNum(k) + ' روز مانده');
        btn.addEventListener('click', () => openSheet(entry, k));
        li.appendChild(btn);
        list.appendChild(li);
      });

      applyUnlockCollapse();
    } else {
      el.unlockPast.hidden = true;
    }

    const remainingLocked = Object.keys(DATA.days).map(Number).filter(k => k < state.daysRemaining).length;
    if (remainingLocked > 0) {
      el.unlockLocked.hidden = false;
      setText(el.unlockLocked, faNum(remainingLocked) + ' تای دیگر هنوز نرسیده‌اند.');
    } else {
      el.unlockLocked.hidden = true;
    }
    setText(el.unlockCount, openedCount > 0 ? faNum(openedCount) + ' تا تا حالا' : '');
  }

  // The archive is a keepsake, not a feed: keep it short by default and let
  // her open the whole thing when she wants to read back through it.
  const RECENT = 5;
  let unlockExpanded = false;

  function applyUnlockCollapse() {
    const items = $$('li', el.unlockList);
    const more = el.unlockMore;
    items.forEach((li, i) => { li.hidden = !unlockExpanded && i >= RECENT; });
    if (!more) return;
    const hiddenCount = Math.max(0, items.length - RECENT);
    if (hiddenCount === 0) {
      more.hidden = true;
      return;
    }
    more.hidden = false;
    more.setAttribute('aria-expanded', unlockExpanded ? 'true' : 'false');
    setText(more, unlockExpanded ? 'کمتر' : faNum(hiddenCount) + ' تای دیگه');
  }

  function openSheet(entry, dayKey) {
    if (!el.sheet) return;
    setText($('[data-sheet-kind]'), DATA.unlockKinds[entry.unlockKind] || DATA.unlockKinds.note);
    setText($('[data-sheet-body]'), entry.unlock);
    setText($('[data-sheet-stamp]'), 'D-' + dayKey);
    if (typeof el.sheet.showModal === 'function') {
      el.sheet.showModal();
    } else {
      whisper(entry.unlock);
    }
  }

  /* ------------------------------------------------------------------ phases */

  function renderPhaseClass(state) {
    if (memo.phase === state.phase) return;
    memo.phase = state.phase;
    const body = el.body;
    ['far', 'near', 'lastweek', 'last72', 'tomorrow', 'today', 'arrived'].forEach(p => {
      body.classList.toggle('is-' + p, p === state.phase);
    });
    const copy = DATA.phases[state.phase] || DATA.phases.far;
    setText(el.heroKicker, copy.kicker);
    setText(el.heroSub, copy.sub);
  }

  /* ------------------------------------------------------------------ cities */

  function renderClocks(state) {
    Object.keys(CFG.cities).forEach(key => {
      const card = $('.city[data-city="' + key + '"]');
      if (!card) return;
      setText($('[data-city-time]', card), clockInTZ(state.now, CFG.cities[key].timezone));
    });
  }

  async function loadWeather(key) {
    const city = CFG.cities[key];
    const card = $('.city[data-city="' + key + '"]');
    if (!card) return;

    const iconEl = $('[data-city-icon]', card);
    const tempEl = $('[data-city-temp]', card);
    const condEl = $('[data-city-cond]', card);
    const sunEl = $('[data-city-sun]', card);

    const url = 'https://api.open-meteo.com/v1/forecast'
      + '?latitude=' + city.lat + '&longitude=' + city.lon
      + '&current=temperature_2m,weather_code'
      + '&daily=sunrise,sunset'
      + '&timezone=' + encodeURIComponent(city.timezone)
      + '&forecast_days=1';

    try {
      const data = await fetchJSON(url, {
        timeout: 8000,
        cacheKey: 'ty.weather.' + key,
        ttl: 20 * MS.min,
        // Istanbul is the canonical timezone, so a fresh response from it is
        // what we check the device clock against.
        onFresh: key === 'istanbul'
          ? fresh => { if (fresh.current && calibrateClock(fresh.current.time, fresh.utc_offset_seconds)) tick(); }
          : null
      });
      const cur = data && data.current;
      if (!cur || typeof cur.temperature_2m !== 'number') throw new Error('shape');

      const code = cur.weather_code;
      const entry = WEATHER[code] || ['هوای این‌جوری', 'none'];
      weatherByCity[key] = { code: code, temp: cur.temperature_2m };

      iconEl.innerHTML = weatherSVG(entry[1]);
      setText(tempEl, Math.round(cur.temperature_2m) + '°');
      setText(condEl, entry[0]);

      const sunset = data.daily && data.daily.sunset && data.daily.sunset[0];
      const sunrise = data.daily && data.daily.sunrise && data.daily.sunrise[0];
      if (sunset && sunrise) {
        // Static, author-written markup — no API text is ever interpolated as
        // HTML. The sr-only labels matter because the icons are aria-hidden,
        // so without them a screen reader would read "07:5320:27".
        sunEl.innerHTML =
          SUN_UP_SVG + '<span class="sr-only">طلوع </span><span></span>' +
          SUN_DOWN_SVG + '<span class="sr-only">غروب </span><span></span>';
        const slots = sunEl.querySelectorAll('span:not(.sr-only)');
        slots[0].textContent = String(sunrise).slice(11, 16);
        slots[1].textContent = String(sunset).slice(11, 16);
      } else {
        sunEl.textContent = '';
      }
      card.classList.remove('is-offline');
    } catch (_) {
      // The page must still look finished when the network does not cooperate.
      iconEl.innerHTML = weatherSVG('none');
      setText(tempEl, '');
      setText(condEl, DATA.fallbacks.weather);
      setText(sunEl, '');
      card.classList.add('is-offline');
    }
  }

  /* -------------------------------------------------------------------- song */

  function songForState(state) {
    const list = DATA.songs;
    const entry = list[state.daysRemaining % list.length];
    return entry;
  }

  async function setupSong(state) {
    const song = songForState(state);
    const titleEl = $('[data-song-title]');
    const artistEl = $('[data-song-artist]');
    const whyEl = $('[data-song-why]');
    const statusEl = $('[data-song-status]');
    const playBtn = $('[data-song-play]');
    const playLabel = $('[data-song-play-label]');
    const copyBtn = $('[data-song-copy]');
    const linkEl = $('[data-song-link]');
    const coverEl = $('[data-song-cover]');
    const audio = $('[data-song-audio]');

    const full = song.title + ' — ' + song.artist;

    setText(titleEl, song.title);
    setText(artistEl, song.artist);
    setText(whyEl, song.why || '');

    // Neither Spotify nor Apple Music is reachable from Iran, so the outbound
    // link is a configurable plain search (see config.songSearch in data.js).
    const search = CFG.songSearch || { label: 'جست‌وجوی آهنگ', url: 'https://duckduckgo.com/?q={q}' };
    linkEl.href = search.url.replace('{q}', encodeURIComponent(song.title + ' ' + song.artist));
    setText($('[data-song-link-label]'), search.label);

    // Copying the name needs no network and no third-party service at all.
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        let ok = false;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(full);
            ok = true;
          }
        } catch (_) { ok = false; }
        setText(statusEl, ok ? DATA.fallbacks.songCopied : DATA.fallbacks.songCopyFailed);
      });
    }

    /* ---- everything below here is optional enhancement ---- */

    let preview = null;

    playBtn.addEventListener('click', async () => {
      if (!preview) return;
      try {
        if (audio.paused) {
          await audio.play();
          setText(playLabel, 'مکث');
        } else {
          audio.pause();
          setText(playLabel, 'سی ثانیه گوش کن');
        }
      } catch (_) {
        setText(statusEl, DATA.fallbacks.songBlocked);
      }
    });
    audio.addEventListener('ended', () => setText(playLabel, 'دوباره'));
    audio.addEventListener('pause', () => {
      if (!audio.ended) setText(playLabel, 'سی ثانیه گوش کن');
    });

    try {
      const term = encodeURIComponent(song.title + ' ' + song.artist);
      const data = await fetchJSON(
        'https://itunes.apple.com/search?term=' + term + '&media=music&entity=song&limit=8',
        // Short timeout: from Iran this host is blocked and will simply hang.
        // Nothing on screen depends on it, so fail fast and quietly.
        { timeout: 4500, cacheKey: 'ty.song.' + song.title + '|' + song.artist, ttl: 7 * MS.day }
      );

      const match = pickBestTrack((data && data.results) || [], song);
      preview = (match && match.previewUrl) || null;

      const art = match && match.artworkUrl100;
      if (art) {
        const img = new Image();
        img.alt = '';
        img.decoding = 'async';
        img.addEventListener('load', () => {
          coverEl.textContent = '';
          coverEl.appendChild(img);
          coverEl.classList.add('has-art');
        });
        // A broken cover must never show a torn-image icon — keep the glyph.
        img.addEventListener('error', () => {});
        img.src = art.replace('100x100', '300x300');
      }
    } catch (_) {
      preview = null;
    }

    // Only now does the play control exist at all. If the lookup failed there
    // is simply no button, rather than a dead disabled one.
    if (preview) {
      audio.src = preview;
      playBtn.hidden = false;
    }
  }

  /** Prefer an exact-ish title AND artist match before falling back to anything playable. */
  function pickBestTrack(results, song) {
    const norm = s => String(s || '').toLowerCase().replace(/[’'`]/g, "'").replace(/[^a-z0-9']+/g, ' ').trim();
    const wantTitle = norm(song.title);
    const wantArtist = norm(song.artist);

    const scored = results
      .filter(r => r && r.previewUrl)
      .map(r => {
        const t = norm(r.trackName);
        const a = norm(r.artistName);
        let score = 0;
        if (t === wantTitle) score += 4;
        else if (t.indexOf(wantTitle) === 0 || wantTitle.indexOf(t) === 0) score += 2;
        if (a === wantArtist) score += 3;
        else if (a.indexOf(wantArtist) > -1 || wantArtist.indexOf(a) > -1) score += 1;
        return { r: r, score: score };
      })
      .sort((x, y) => y.score - x.score);

    if (!scored.length) return null;
    // A zero score means neither title nor artist lined up — better to show no
    // preview than to play an unrelated track.
    return scored[0].score > 0 ? scored[0].r : null;
  }

  /* ------------------------------------------------------------- cat secrets */

  let whisperTimer = null;
  function whisper(text) {
    if (!el.whisper) return;
    setText(el.whisperText, text);
    el.whisper.hidden = false;
    // Force a frame so the transition runs on first show.
    requestAnimationFrame(() => el.whisper.classList.add('is-visible'));
    clearTimeout(whisperTimer);
    whisperTimer = setTimeout(() => {
      el.whisper.classList.remove('is-visible');
      setTimeout(() => { el.whisper.hidden = true; }, 320);
    }, 5200);
  }

  function setupCats() {
    // Each cat keeps its own shuffled bag so lines don't repeat until the bag
    // is empty — random-per-click repeats far too often to feel intentional.
    const bags = { mahan: [], yalda: [] };

    function nextLine(who) {
      const source = DATA.catLines[who];
      if (!bags[who].length) {
        bags[who] = source.slice();
        for (let i = bags[who].length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const tmp = bags[who][i]; bags[who][i] = bags[who][j]; bags[who][j] = tmp;
        }
      }
      return bags[who].pop();
    }

    ['mahan', 'yalda'].forEach(who => {
      const node = el.cats[who];
      if (!node) return;
      node.addEventListener('click', () => {
        whisper(nextLine(who));
        node.classList.remove('is-poked');
        void node.offsetWidth;
        node.classList.add('is-poked');
      });
    });
  }

  /* ==========================================================================
     8. Boot + scheduling
     ========================================================================== */

  let tickTimer = null;
  let slowTimer = null;
  let tickRate = 0;

  /** Every second: only the things that actually change every second. */
  function tick() {
    const state = computeState(now());
    renderPhaseClass(state);
    renderCountdown(state);
    renderClocks(state);

    if (memo.dayKey !== state.dayKey) {
      memo.dayKey = state.dayKey;
      renderDay(state);
      renderCats(state);
      renderRoute(state);
    }

    // Once there is nothing left to count, stop running a 1s loop forever.
    const wanted = state.phase === 'arrived' ? 15000 : 1000;
    if (wanted !== tickRate) startTicking();
  }

  /** Everything else moves slowly enough to re-render once a minute. */
  function slowTick() {
    const state = computeState(now());
    renderCats(state);
    renderRoute(state);
  }

  function startTicking() {
    stopTicking();
    const state = computeState(now());
    tickRate = state.phase === 'arrived' ? 15000 : 1000;
    tick();
    slowTick();
    tickTimer = setInterval(tick, tickRate);
    slowTimer = setInterval(slowTick, 60000);
  }

  function stopTicking() {
    if (tickTimer) clearInterval(tickTimer);
    if (slowTimer) clearInterval(slowTimer);
    tickTimer = slowTimer = null;
    tickRate = 0;
  }

  function init() {
    cacheDom();
    setText(el.footYear, String(new Date().getFullYear()));

    const state = computeState(now());

    // The arrival stamp and the ticket are rendered from config.meetingAt, not
    // typed into the HTML, so they can never drift from the actual countdown.
    const meetingDate = new Date(MEETING_TS);
    const stampDate = formatter(CFG.timezone, { day: '2-digit', month: 'short', year: 'numeric' })
      .format(meetingDate).replace(/\s/g, ' ').toUpperCase();
    const stampTime = clockInTZ(MEETING_TS, CFG.timezone);
    const f = CFG.flight;
    $$('[data-stamp-date]').forEach(n => setText(n, stampDate));
    $$('[data-stamp-time]').forEach(n => setText(n, stampTime));
    $$('[data-stamp-code]').forEach(n => setText(n, f.toCode));
    setText($('[data-ticket-name]'), f.passenger);
    setText($('[data-ticket-from]'), f.fromCode);
    setText($('[data-ticket-to]'), f.toCode);
    setText($('[data-ticket-cities]'), f.fromCity + ' — ' + f.toCity);
    setText($('[data-stamp-route]'),
      [CFG.cities.madrid.name, CFG.cities.istanbul.name, CFG.cities.sari.name].join(' · ').toUpperCase());

    // Distances are constant — compute once, not on a timer.
    setText($('[data-km="madrid"]'), haversineKm(CFG.cities.madrid, CFG.cities.istanbul).toLocaleString('en-US') + ' km');
    setText($('[data-km="sari"]'), haversineKm(CFG.cities.sari, CFG.cities.istanbul).toLocaleString('en-US') + ' km');

    renderDay(state);
    memo.dayKey = state.dayKey;
    setupCats();
    setupSong(state);

    Object.keys(CFG.cities).forEach(key => {
      loadWeather(key).then(() => renderCats(computeState(now())));
    });
    setInterval(() => Object.keys(CFG.cities).forEach(loadWeather), 20 * MS.min);

    startTicking();

    // Recompute cat positions when the layout changes, not on every frame.
    if (typeof ResizeObserver === 'function' && el.routeStage) {
      new ResizeObserver(() => renderRoute(computeState(now()))).observe(el.routeStage);
    } else {
      window.addEventListener('resize', () => renderRoute(computeState(now())));
    }

    // Don't burn her battery in a background tab; resync on return.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopTicking();
      else startTicking();
    });

    if (el.unlockMore) {
      el.unlockMore.addEventListener('click', () => {
        unlockExpanded = !unlockExpanded;
        applyUnlockCollapse();
      });
    }

    const sheetClose = $('[data-sheet-close]');
    if (sheetClose) sheetClose.addEventListener('click', () => { if (typeof el.sheet.close === 'function') el.sheet.close(); });
    if (el.sheet) {
      // e.target === dialog is also true for clicks on the dialog's own padding,
      // which the reader perceives as inside the card. Test the actual box.
      el.sheet.addEventListener('click', e => {
        const b = el.sheet.getBoundingClientRect();
        const outside = e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom;
        if (outside && typeof el.sheet.close === 'function') el.sheet.close();
      });
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }

  // Exported for the test harness in tools/test-phases.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      computeState, contentForState, unlockedDays, catStateFor,
      daySerialInTZ, dayKeyInTZ, hourInTZ, haversineKm, bezier,
      catPositions, pickBestTrack, faNum, hashString, MEETING_TS,
      _setWeather: (key, val) => { weatherByCity[key] = val; }
    };
  }
})();
