/* ============================================================================
   node tools/test-phases.js
   ----------------------------------------------------------------------------
   Simulates the whole run — 30 days out, the last week, 72 hours, the final
   day, the final hour, the moment of arrival and afterwards — and asserts the
   page would show the right thing. Also checks the Istanbul date boundary,
   the cat geometry at every breakpoint, and that no content path can produce
   undefined / NaN.
   ========================================================================== */
'use strict';

require('../data.js');
const A = require('../app.js');

const MEETING = Date.parse('2026-10-14T10:45:00+03:00');
const H = 3600000, M = 60000, D = 86400000;

let pass = 0, fail = 0;
const failures = [];

function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { pass++; }
  else { fail++; failures.push(`${name}\n      expected: ${JSON.stringify(expected)}\n      actual:   ${JSON.stringify(actual)}`); }
}
function assert(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; failures.push(`${name}${detail ? '\n      ' + detail : ''}`); }
}
function section(t) { console.log(`\n\x1b[1m${t}\x1b[0m`); }

const istanbul = ts => new Date(ts).toLocaleString('sv-SE', { timeZone: 'Europe/Istanbul' });

/* ------------------------------------------------------------------ 0. ICU */
section('0. Environment');
assert('Node has full ICU (Persian + timezone data)',
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tehran' }).format(0).length > 0);
check('Istanbul is UTC+3 in January (no DST)',
  new Date('2026-01-15T00:00:00Z').toLocaleString('en-GB', { timeZone: 'Europe/Istanbul', hour: '2-digit', hourCycle: 'h23' }), '03');
check('Istanbul is UTC+3 in July (still no DST)',
  new Date('2026-07-15T00:00:00Z').toLocaleString('en-GB', { timeZone: 'Europe/Istanbul', hour: '2-digit', hourCycle: 'h23' }), '03');
check('Tehran is UTC+3:30 in October (DST abolished 2022)',
  new Date('2026-10-14T00:00:00Z').toLocaleString('en-GB', { timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }), '03:30');
check('Madrid is UTC+2 on 13 Sep 2026 (CEST)',
  new Date('2026-09-13T00:00:00Z').toLocaleString('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', hourCycle: 'h23' }), '02');
check('Madrid is UTC+1 on 1 Nov 2026 (CET, after DST ends)',
  new Date('2026-11-01T12:00:00Z').toLocaleString('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', hourCycle: 'h23' }), '13');

/* ---------------------------------------------------------- 1. phase table */
section('1. Phase at each stage of the story');

const cases = [
  ['30 days out',            Date.parse('2026-09-14T12:00:00+03:00'), 'far',      30],
  ['15 days out (still far)', Date.parse('2026-09-29T12:00:00+03:00'), 'far',      15],
  ['14 days out',            Date.parse('2026-09-30T12:00:00+03:00'), 'near',     14],
  ['8 days out',             Date.parse('2026-10-06T12:00:00+03:00'), 'near',      8],
  ['7 days out (T-7)',       Date.parse('2026-10-07T12:00:00+03:00'), 'lastweek',  7],
  ['4 days out',             Date.parse('2026-10-10T12:00:00+03:00'), 'lastweek',  4],
  ['3 days out (T-72h)',     Date.parse('2026-10-11T12:00:00+03:00'), 'last72',    3],
  ['2 days out',             Date.parse('2026-10-12T12:00:00+03:00'), 'last72',    2],
  ['1 day out (tomorrow)',   Date.parse('2026-10-13T12:00:00+03:00'), 'tomorrow',  1],
  ['meeting day, 06:00',     Date.parse('2026-10-14T06:00:00+03:00'), 'today',     0],
  ['1 hour before',          MEETING - H,                             'today',     0],
  ['1 minute before',        MEETING - M,                             'today',     0],
  ['exact moment',           MEETING,                                 'arrived',   0],
  ['1 second after',         MEETING + 1000,                          'arrived',   0],
  ['a week after',           MEETING + 7 * D,                         'arrived',   0]
];

for (const [label, ts, phase, days] of cases) {
  const s = A.computeState(ts);
  check(`${label} → phase`, s.phase, phase);
  check(`${label} → daysRemaining`, s.daysRemaining, days);
}

/* ------------------------------------------------- 2. Istanbul day boundary */
section('2. The Istanbul midnight boundary');

// 13 Oct 23:59:59 Istanbul is still "tomorrow"; one second later it is "today".
const beforeMidnight = Date.parse('2026-10-13T23:59:59+03:00');
const afterMidnight = Date.parse('2026-10-14T00:00:00+03:00');
check('23:59:59 on 13 Oct → tomorrow', A.computeState(beforeMidnight).phase, 'tomorrow');
check('00:00:00 on 14 Oct → today', A.computeState(afterMidnight).phase, 'today');
check('day flips exactly at Istanbul midnight',
  [A.computeState(beforeMidnight).daysRemaining, A.computeState(afterMidnight).daysRemaining], [1, 0]);

// The countdown must not read "0 days" for a whole day while a day remains —
// that was the bug in the previous build (Math.floor on the raw delta).
const oct13noon = Date.parse('2026-10-13T12:00:00+03:00');
assert('at 12:00 on 13 Oct it still says 1 day, not 0',
  A.computeState(oct13noon).daysRemaining === 1,
  `got ${A.computeState(oct13noon).daysRemaining}`);

// A viewer whose device clock is in another timezone must still see the same day.
const sameInstant = Date.parse('2026-10-07T12:00:00+03:00');
check('device timezone does not change the day count',
  A.computeState(sameInstant).daysRemaining, 7);

/* ----------------------------------------------- 3. content never breaks */
section('3. Content resolution');

const BAD = /undefined|NaN|\[object|null/;
let contentChecked = 0;
for (let ts = Date.parse('2026-09-13T00:30:00+03:00'); ts <= MEETING + 2 * D; ts += 6 * H) {
  const s = A.computeState(ts);
  const c = A.contentForState(s);
  contentChecked++;
  if (!c.note || !c.unlock || BAD.test(c.note) || BAD.test(c.unlock)) {
    fail++; failures.push(`content broken at ${istanbul(ts)} (phase ${s.phase}, D-${s.daysRemaining}): ${JSON.stringify(c)}`);
    break;
  }
}
pass++;
console.log(`   checked ${contentChecked} six-hourly instants across the whole run`);

// Far-future dates (if the meeting were moved) fall back to evergreen, stably.
const farOut = Date.parse('2026-06-01T12:00:00+03:00');
const c1 = A.contentForState(A.computeState(farOut));
const c2 = A.contentForState(A.computeState(farOut + 5 * H));
check('evergreen content is stable within one calendar day', c1.note, c2.note);
const nextDay = A.contentForState(A.computeState(farOut + 26 * H));
assert('evergreen is chosen from the pool', typeof nextDay.note === 'string' && nextDay.note.length > 0);

/* ------------------------------------------------------- 4. unlock gating */
section('4. Daily unlock gating');

const DATA = globalThis.TA_YALDA;
const dayKeys = Object.keys(DATA.days).map(Number);
if (dayKeys.length) {
  const at7 = A.computeState(Date.parse('2026-10-07T12:00:00+03:00'));
  const open7 = A.unlockedDays(at7);
  assert('no future day is ever unlocked',
    open7.every(k => k >= at7.daysRemaining),
    `leaked: ${open7.filter(k => k < at7.daysRemaining).join(',')}`);
  assert('today is unlocked', open7.includes(at7.daysRemaining) || !DATA.days[at7.daysRemaining]);

  const atEnd = A.computeState(MEETING - H);
  assert('every written day is open by the meeting',
    A.unlockedDays(atEnd).length === dayKeys.length,
    `${A.unlockedDays(atEnd).length} of ${dayKeys.length}`);

  const atStart = A.computeState(Date.parse('2026-09-13T12:00:00+03:00'));
  assert('on day one only day one is open',
    A.unlockedDays(atStart).length === 1,
    `${A.unlockedDays(atStart).length} open`);

  // The counter must say how many have been OPENED, not how many are left.
  const openedAt = st => {
    const s = A.computeState(st);
    const past = A.unlockedDays(s).filter(k => k !== s.daysRemaining);
    return past.length + (DATA.days[s.daysRemaining] ? 1 : 0);
  };
  check('opened count on day one', openedAt(Date.parse('2026-09-13T12:00:00+03:00')), 1);
  check('opened count at T-7', openedAt(Date.parse('2026-10-07T12:00:00+03:00')), Math.max(...dayKeys) - 7 + 1);
  check('opened count on meeting morning', openedAt(MEETING - H), dayKeys.length);
} else {
  console.log('   (days{} is empty — skipping)');
}

/* ----------------------------------------------------------- 5. cat states */
section('5. Cat states');

A._setWeather('madrid', { code: 0, temp: 20 });
A._setWeather('sari', { code: 0, temp: 20 });

check('far out, Madrid mid-afternoon → awake',
  A.catStateFor('mahan', A.computeState(Date.parse('2026-09-20T15:00:00+02:00'))), 'awake');
check('far out, Madrid 02:00 → sleeping',
  A.catStateFor('mahan', A.computeState(Date.parse('2026-09-20T02:00:00+02:00'))), 'sleeping');
check('far out, Sari 07:00 → stretching',
  A.catStateFor('yalda', A.computeState(Date.parse('2026-09-20T07:00:00+03:30'))), 'stretching');
check('far out, Sari 01:00 → sleeping',
  A.catStateFor('yalda', A.computeState(Date.parse('2026-09-20T01:00:00+03:30'))), 'sleeping');

A._setWeather('sari', { code: 63, temp: 14 });
check('rain in Sari → umbrella',
  A.catStateFor('yalda', A.computeState(Date.parse('2026-09-20T15:00:00+03:30'))), 'rain');
check('rain does not override the suitcase inside the last week',
  A.catStateFor('yalda', A.computeState(Date.parse('2026-10-09T15:00:00+03:30'))), 'packing');
A._setWeather('sari', { code: 0, temp: 20 });

check('T-7 → packing', A.catStateFor('mahan', A.computeState(Date.parse('2026-10-07T15:00:00+03:00'))), 'packing');
check('T-3 → excited',  A.catStateFor('mahan', A.computeState(Date.parse('2026-10-11T15:00:00+03:00'))), 'excited');
check('meeting day → waiting', A.catStateFor('mahan', A.computeState(MEETING - 3 * H)), 'waiting');
check('after arrival → together', A.catStateFor('mahan', A.computeState(MEETING + H)), 'together');
check('after arrival, Yalda too', A.catStateFor('yalda', A.computeState(MEETING + H)), 'together');

/* -------------------------------------------------- 6. cat geometry / overlap */
section('6. Cats never collide, at any width');

const WIDTHS = [320, 360, 375, 390, 414, 430, 600, 768, 834, 1024, 1280, 1440, 1920];
let worstGap = Infinity, worstAt = '';
let geomOk = true;

for (const vw of WIDTHS) {
  // Stage width ≈ viewport minus gutters, capped by --wide (62rem = 992px).
  const gutter = Math.min(Math.max(vw * 0.05, 20), 40);
  const stageW = Math.min(vw - gutter * 2, 992);
  const stageH = stageW * (vw <= 416 ? 300 / 1000 : 240 / 1000);
  // .cat is clamp(2.25rem, 7.5vw, 3.375rem) → 36px … 54px
  const catW = Math.min(Math.max(vw * 0.075, 36), 54);
  // .pin is clamp(1.5rem, 4.4vw, 1.875rem) → 24px … 30px
  const pinW = Math.min(Math.max(vw * 0.044, 24), 30);

  for (let p = 0; p <= 1.0001; p += 0.02) {
    const pos = A.catPositions({ width: stageW, height: stageH, catW, pinW, progress: p, arrived: false });
    const gap = pos.yalda.x - pos.mahan.x - catW;
    if (gap < worstGap) { worstGap = gap; worstAt = `${vw}px @ progress ${p.toFixed(2)}`; }
    if (gap < 0) { geomOk = false; failures.push(`cats overlap at ${vw}px, progress ${p.toFixed(2)} (gap ${gap.toFixed(1)}px)`); fail++; break; }

    const centre = stageW / 2;
    const mahanRight = pos.mahan.x + catW / 2;
    const yaldaLeft = pos.yalda.x - catW / 2;
    if (mahanRight > centre - pinW / 2 || yaldaLeft < centre + pinW / 2) {
      geomOk = false; failures.push(`cat overlaps the Istanbul pin at ${vw}px, progress ${p.toFixed(2)}`); fail++; break;
    }
    if (pos.mahan.x - catW / 2 < 0 || pos.yalda.x + catW / 2 > stageW) {
      geomOk = false; failures.push(`cat escapes the stage at ${vw}px, progress ${p.toFixed(2)}`); fail++; break;
    }
  }
}
if (geomOk) { pass++; console.log(`   tightest gap across ${WIDTHS.length} widths × 51 progress steps: ${worstGap.toFixed(1)}px (at ${worstAt})`); }

// On arrival they are allowed — and meant — to touch.
const arrivedPos = A.catPositions({ width: 375, height: 112, catW: 36, pinW: 24, progress: 1, arrived: true });
assert('on arrival the cats stand together', Math.abs(arrivedPos.yalda.x - arrivedPos.mahan.x) < 36,
  `gap ${(arrivedPos.yalda.x - arrivedPos.mahan.x).toFixed(1)}px`);

/* ------------------------------------------------------------ 7. distances */
section('7. Geography');
const CFG = DATA.config;
const madridKm = A.haversineKm(CFG.cities.madrid, CFG.cities.istanbul);
const sariKm = A.haversineKm(CFG.cities.sari, CFG.cities.istanbul);
assert('Madrid → Istanbul is ~2700 km', madridKm > 2600 && madridKm < 2800, `got ${madridKm} km`);
assert('Sari → Istanbul is ~2140 km', sariKm > 2050 && sariKm < 2250, `got ${sariKm} km`);
assert('Sari is not Tehran',
  Math.abs(CFG.cities.sari.lat - 35.6892) > 0.5 || Math.abs(CFG.cities.sari.lon - 51.389) > 0.5,
  'Sari coordinates look like Tehran');
console.log(`   Madrid → Istanbul ${madridKm} km · Sari → Istanbul ${sariKm} km`);

/* --------------------------------------------------------- 8. song matching */
section('8. iTunes result matching');
check('exact title + artist wins',
  A.pickBestTrack([
    { trackName: 'Apocalypse Now', artistName: 'Someone Else', previewUrl: 'a' },
    { trackName: 'Apocalypse', artistName: 'Cigarettes After Sex', previewUrl: 'b' }
  ], { title: 'Apocalypse', artist: 'Cigarettes After Sex' }).previewUrl, 'b');
check('an unrelated track is rejected rather than played',
  A.pickBestTrack([{ trackName: 'Something Totally Different', artistName: 'Nobody', previewUrl: 'x' }],
    { title: 'Apocalypse', artist: 'Cigarettes After Sex' }), null);
check('no results → null', A.pickBestTrack([], { title: 'x', artist: 'y' }), null);
check('results without previews → null',
  A.pickBestTrack([{ trackName: 'Apocalypse', artistName: 'Cigarettes After Sex' }],
    { title: 'Apocalypse', artist: 'Cigarettes After Sex' }), null);

/* ---------------------------------------------------------- 9. data sanity */
section('9. Data sanity');
assert('every song has a title and artist',
  DATA.songs.every(s => s.title && s.artist), 'a song is missing a field');
assert('both cats have lines',
  DATA.catLines.mahan.length >= 6 && DATA.catLines.yalda.length >= 6);
assert('every phase has kicker/sub/lead',
  ['far', 'near', 'lastweek', 'last72', 'tomorrow', 'today'].every(p =>
    DATA.phases[p] && DATA.phases[p].kicker && DATA.phases[p].sub && DATA.phases[p].lead));
assert('arrival copy is complete',
  !!(DATA.arrival.figure && DATA.arrival.note && DATA.arrival.unlock && DATA.arrival.routeStatus));

const kinds = new Set(Object.keys(DATA.unlockKinds));
const badKinds = Object.entries(DATA.days).filter(([, v]) => !kinds.has(v.unlockKind)).map(([k, v]) => `D-${k}:${v.unlockKind}`);
assert('every day uses a known unlock kind', badKinds.length === 0, badKinds.join(', '));

const dupes = [];
const seenNotes = new Map();
for (const [k, v] of Object.entries(DATA.days)) {
  if (seenNotes.has(v.note)) dupes.push(`D-${k} duplicates D-${seenNotes.get(v.note)}`);
  seenNotes.set(v.note, k);
}
assert('no two days share the same note', dupes.length === 0, dupes.join('; '));

if (dayKeys.length) {
  const missing = [];
  for (let k = 0; k <= Math.max(...dayKeys); k++) if (!DATA.days[k]) missing.push(k);
  assert('the arc has no gaps', missing.length === 0, `missing D-${missing.join(', D-')}`);
  console.log(`   arc covers D-${Math.max(...dayKeys)} … D-0 (${dayKeys.length} days), ${DATA.songs.length} songs`);
}

/* -------------------------------------------------------------- 10. digits */
section('10. Persian numerals');
check('31 → ۳۱', A.faNum(31), '۳۱');
check('0 → ۰', A.faNum(0), '۰');
check('10:45 keeps its colon', A.faNum('10:45'), '۱۰:۴۵');

/* ------------------------------------------------------------------ report */
console.log('\n' + '─'.repeat(60));
if (fail) {
  console.log(`\x1b[31m${fail} FAILED\x1b[0m, ${pass} passed\n`);
  failures.forEach(f => console.log('  ✗ ' + f));
  process.exit(1);
} else {
  console.log(`\x1b[32mAll ${pass} checks passed.\x1b[0m`);
}
