'use strict';

const CONFIG = {
  meetingAt: '2026-10-14T10:45:00+03:00',
  contentStart: '2026-09-13T00:00:00+03:00',
  meetingTimezone: 'Europe/Istanbul',
  arrivalLabel: '14 OCT 2026 · 10:45 · IST',
  cities: {
    madrid: { name: 'Madrid', lat: 40.4168, lon: -3.7038, timezone: 'Europe/Madrid' },
    sari: { name: 'Sari', lat: 36.5659, lon: 53.0586, timezone: 'Asia/Tehran' },
    istanbul: { name: 'Istanbul', lat: 41.0082, lon: 28.9784, timezone: 'Europe/Istanbul' }
  }
};

const DAILY_MESSAGES = [
  'از امروز، هر روز فقط یک کار دارد: من را یک قدم به تو نزدیک‌تر کند.',
  'فاصله هنوز هست؛ ولی مقصدش دیگر معلوم است: استانبول، تو، و بالاخره سلام.',
  'یلدا، بعضی روزها را فقط به خاطر روزی که قرار است تمام شوند تحمل می‌کنیم.',
  'من از مادرید می‌آیم، تو از ساری؛ انگار دنیا وسط استانبول قرار گذاشته ما را برساند به هم.',
  'امروز هم یک روز کمتر تا خنده‌ای که دلم برایش خیلی تنگ شده.',
  'اگر صبر واحد داشت، این چند هفته احتمالاً رکورد جهانی می‌شد.',
  'استانبول این بار برای من شهر نیست؛ نقطه‌ای روی نقشه است که تو آنجایی.',
  'دلتنگی وقتی اسم داشته باشد، تحملش هم سخت‌تر است. اسم این یکی یلداست.',
  'یک روز نزدیک‌تر. یک بهانه کمتر برای غر زدن به فاصله.',
  'فکر می‌کنم حتی گربه‌های استانبول هم خبر دارند یک قرار مهم در راه است.',
  'امروز سهم من از تو همین فکر است: خیلی زود می‌بینمت.',
  'تقویم دارد کار خودش را می‌کند؛ من فقط زیادی آهسته بودنش را نقد می‌کنم.',
  'بعضی مقصدها فرودگاه نیستند. یک نفرند.',
  'هر بار این عدد کوچک‌تر می‌شود، استانبول برایم واقعی‌تر می‌شود.',
  'امروز هم جای تو اینجا خالی است؛ خوشبختانه نه برای خیلی طولانی.',
  'فاصله فعلاً روی نقشه بزرگ است؛ در ذهن من خیلی وقت است تمام شده.',
  'اگر می‌شد یک روز را fast-forward کرد، احتمالاً کل این ماه را رد می‌کردم.',
  'برای دیدنت برنامه‌ریزی کرده‌ایم؛ برای ذوقش هیچ برنامه‌ای ندارم.',
  'این روزها یک ویژگی مشترک دارند: همه‌شان دارند تمام می‌شوند تا برسم به تو.',
  'نمی‌دانم اولین جمله‌ای که وقتی ببینمت می‌گویم چیست؛ احتمالاً مغزم چند ثانیه از کار می‌افتد.',
  'امروز: کمی کار، کمی زندگی، مقدار غیرمنطقی فکر کردن به یلدا.',
  'هر چه نزدیک‌تر می‌شویم، «بالاخره» معنی بهتری پیدا می‌کند.',
  'فکر خوب امروز: یک صبح خیلی نزدیک، هر دویمان در یک شهر بیدار می‌شویم.',
  'ساری، مادرید، استانبول. سه اسم ساده که این ماه برای من داستان شده‌اند.',
  'فقط خواستم یادآوری کنم: هنوز هم خیلی دلم برایت تنگ شده. گزارش روزانه تمام.',
  'داریم وارد بخشی از شمارش می‌شویم که صبر کردن رسماً غیرمنطقی است.',
  'تقریباً می‌توانم لحظه‌ای را تصور کنم که دیگر لازم نیست بگویم «تا دیدار».',
  'چمدان‌ها هنوز شاید بسته نشده باشند، ولی ذهن من مدت‌هاست راه افتاده.',
  'خیلی نزدیک شده‌ایم به روزی که این سایت دیگر کارش تمام می‌شود.',
  'یک خواب کمتر تا استانبول. یک خواب کمتر تا تو.',
  'فردا دیگر «به‌زودی» نیست. فرداست.',
  'بالاخره. امروز دیگر روزشمار نیست؛ روز دیدن توست.'
];

const UNLOCK_MESSAGES = [
  'قانون روز اول: حق نداری روزشمار را هی refresh کنی که سریع‌تر شود. امتحان کردم، نمی‌شود.',
  'یک اعتراف کوچک: ساختن این صفحه بهانه خوبی بود که بیشتر از معمول به تو فکر کنم.',
  'اگر یک گربه بین ساری و مادرید مسئول رساندن پیام بود، احتمالاً وسط راه خوابش می‌برد.',
  'یکی از چیزهایی که دلم براش تنگ شده: آن لحظه‌ای که یک چیز بامزه می‌گویی و خودت قبل از من می‌خندی.',
  'ماموریت امروز: یک آهنگ بگذار که اگر الان کنار هم بودیم دوست داشتی با هم گوش کنیم.',
  'من رسماً اعلام می‌کنم هر کیلومتر فاصله‌ای که مانده، زیادی است.',
  'یک یادداشت برای یلدای آینده: اگر این را بعداً می‌خوانی، احتمالاً من بالاخره موفق شدم صبر کنم.',
  'امروز گربه گفت: «ایشان زیادی درباره شما حرف می‌زند.» من تکذیب می‌کنم.',
  'چیز کوچکی که منتظرشم: راه رفتن بدون اینکه مجبور باشیم همزمان به ساعت و اینترنت فکر کنیم.',
  'سؤال امروز: اولین غذایی که استانبول با هم می‌خوریم چی باشد؟',
  'اگر دلتنگی calorie می‌سوزاند، من الان ورزشکار حرفه‌ای بودم.',
  'امروز فقط یادت باشد: کسی چند هزار کیلومتر آن‌طرف‌تر برای دیدنت خیلی خوشحال است.',
  'چیز ساده‌ای که دلم می‌خواهد: یک قهوه، یک میز، تو، و هیچ عجله‌ای.',
  'گربه‌ی سمت ساری امروز نیم قدم جلو آمد. من می‌گویم تقلب نکرده.',
  'نصف جذابیت سفر این است که آخرش تویی.',
  'سؤال امروز: اگر یک روز کامل در استانبول هیچ برنامه‌ای نداشته باشیم، دوست داری چه کار کنیم؟',
  'یک reminder دوستانه: لبخندت را برای ۱۴ اکتبر رزرو کرده‌ام.',
  'همه‌ی این عددها آخرش به یک چیز ختم می‌شوند: سلام یلدا.',
  'امروز دلم برای صدایت بیشتر از دیروز تنگ شده. ممکن است فردا گزارش جدید داشته باشیم.',
  'اگر گربه‌ها پاسپورت داشتند، احتمالاً یکی را می‌فرستادم زودتر دنبالت.',
  'یک چیزی که دوست دارم: با تو لحظه‌های معمولی هم معمولی نمی‌مانند.',
  'سؤال امروز: اولین عکسی که با هم در استانبول می‌گیریم کجا باشد؟',
  'نزدیک شدن تاریخ یک مشکل دارد: زمان ناگهان کندتر به نظر می‌رسد.',
  'خبر فوری: شاخص «دلم برات تنگ شده» همچنان در وضعیت قرمز است.',
  'یک قول ساده: وقتی رسیدیم، حداقل چند ساعت اول به روزشمار نگاه نمی‌کنم.',
  'چیز مورد انتظار امروز: اینکه اسم Istanbul دیگر روی کارت پرواز نباشد؛ جلوی چشممان باشد.',
  'فقط چند روز دیگر تا جایی که این فاصله تبدیل می‌شود به یک خاطره.',
  'اگر امروز دیدی عدد خیلی کم شده، نگران نباش. این دقیقاً برنامه بود.',
  'چمدان ذهنی من بسته شده. نسخه واقعی احتمالاً دقیقه نود.',
  'گربه گزارش داده میزان هیجان از سطح استاندارد عبور کرده.',
  'فردا؟ نه، واقعاً دارد نزدیک می‌شود.',
  'آخرین unlock: بیا بقیه‌اش را دیگر آنلاین زندگی نکنیم. ببینمت.'
];

const SECRET_MESSAGES = [
  'psst… خیلی بیشتر از چیزی که نشان می‌دهد ذوق دارد.',
  'گربه می‌گوید: «یلدا، ایشان صبر کردن بلد نیست.»',
  'گزارش محرمانه: احتمال بغل طولانی در استانبول بسیار بالاست.',
  'این گربه رسماً طرفدار تیم Yalda است.',
  'اطلاعیه: فاصله غیرقانونی است؛ پرونده در دست بررسی.',
  'می‌خواستم راز بزرگی لو بدهم، ولی ماهان گفت هنوز زوده.',
  'طبق داده‌های کاملاً علمی من: امروز هم دوستت دارد.',
  'اگر دوباره کلیک کنی شاید اطلاعات طبقه‌بندی‌شده بیشتری پیدا کنی.',
  'گربه می‌گوید: «۱۴ اکتبر را خالی نگه دار. ظاهراً برنامه مهمی داری.»',
  'Cat approval: 100%. Human patience: 12%.'
];

const SONGS = [
  ['Apocalypse', 'Cigarettes After Sex'],
  ['Nothing’s Gonna Hurt You Baby', 'Cigarettes After Sex'],
  ['About You', 'The 1975'],
  ['Glue Song', 'beabadoobee'],
  ['My Love Mine All Mine', 'Mitski'],
  ['Sunsetz', 'Cigarettes After Sex'],
  ['Sweet', 'Cigarettes After Sex'],
  ['Video Games', 'Lana Del Rey'],
  ['Young And Beautiful', 'Lana Del Rey'],
  ['Cariño', 'The Marías'],
  ['No One Noticed', 'The Marías'],
  ['I Wanna Be Yours', 'Arctic Monkeys'],
  ['Baby I’m Yours', 'Arctic Monkeys'],
  ['Lover, You Should’ve Come Over', 'Jeff Buckley'],
  ['Mystery of Love', 'Sufjan Stevens'],
  ['Space Song', 'Beach House'],
  ['Fade Into You', 'Mazzy Star'],
  ['Until I Found You', 'Stephen Sanchez'],
  ['Here With Me', 'd4vd'],
  ['Yellow', 'Coldplay'],
  ['Sparks', 'Coldplay'],
  ['Best Part', 'Daniel Caesar'],
  ['Like Real People Do', 'Hozier'],
  ['Work Song', 'Hozier'],
  ['Turning Page', 'Sleeping At Last'],
  ['The Night We Met', 'Lord Huron'],
  ['Just the Two of Us', 'Grover Washington, Jr.'],
  ['La Vie En Rose', 'Daniela Andrade'],
  ['Sea of Love', 'Cat Power'],
  ['Bloom', 'The Paper Kites'],
  ['Can’t Help Falling in Love', 'Elvis Presley'],
  ['Home', 'Edward Sharpe & The Magnetic Zeros'],
  ['Daylight', 'David Kushner']
];

const WEATHER_CODES = {
  0: ['Clear', '☀'], 1: ['Mostly clear', '☀'], 2: ['Partly cloudy', '◐'], 3: ['Cloudy', '☁'],
  45: ['Fog', '≋'], 48: ['Fog', '≋'], 51: ['Drizzle', '☂'], 53: ['Drizzle', '☂'], 55: ['Drizzle', '☂'],
  56: ['Freezing drizzle', '☂'], 57: ['Freezing drizzle', '☂'], 61: ['Rain', '☂'], 63: ['Rain', '☂'], 65: ['Heavy rain', '☂'],
  66: ['Freezing rain', '☂'], 67: ['Freezing rain', '☂'], 71: ['Snow', '❄'], 73: ['Snow', '❄'], 75: ['Heavy snow', '❄'],
  77: ['Snow grains', '❄'], 80: ['Showers', '☂'], 81: ['Showers', '☂'], 82: ['Heavy showers', '☂'],
  85: ['Snow showers', '❄'], 86: ['Snow showers', '❄'], 95: ['Thunderstorm', 'ϟ'], 96: ['Storm + hail', 'ϟ'], 99: ['Storm + hail', 'ϟ']
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const meetingTs = new Date(CONFIG.meetingAt).getTime();
const contentStartTs = new Date(CONFIG.contentStart).getTime();
const DAY = 86400000;

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function getIstanbulDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CONFIG.meetingTimezone,
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const obj = Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
  return { year: +obj.year, month: +obj.month, day: +obj.day };
}

function daySerialInIstanbul(date = new Date()) {
  const p = getIstanbulDateParts(date);
  return Date.UTC(p.year, p.month - 1, p.day) / DAY;
}

function contentDayIndex() {
  const start = getIstanbulDateParts(new Date(contentStartTs));
  const startSerial = Date.UTC(start.year, start.month - 1, start.day) / DAY;
  return Math.max(0, Math.floor(daySerialInIstanbul() - startSerial));
}

function setDailyMessage() {
  const idx = clamp(contentDayIndex(), 0, DAILY_MESSAGES.length - 1);
  $('#daily-message').textContent = DAILY_MESSAGES[idx];
  $('#day-index').textContent = `DAY ${String(idx + 1).padStart(2, '0')}`;
}

function updateCountdown() {
  const now = Date.now();
  const delta = meetingTs - now;

  if (delta <= 0) {
    document.body.classList.add('arrived');
    $('#days').textContent = '00';
    $('#hours').textContent = '00';
    $('#minutes').textContent = '00';
    $('#seconds').textContent = '00';
    $('.countdown-label').textContent = 'بالاخره رسیدی 🤍';
    $('#hero-sub').textContent = 'دیگر قرار نیست به سمت یک شهر برویم؛ بالاخره در یک شهر هستیم.';
    $('#route-progress-label').textContent = 'رسیدیم.';
    return;
  }

  const days = Math.floor(delta / DAY);
  const hours = Math.floor((delta % DAY) / 3600000);
  const minutes = Math.floor((delta % 3600000) / 60000);
  const seconds = Math.floor((delta % 60000) / 1000);

  $('#days').textContent = String(days).padStart(2, '0');
  $('#hours').textContent = String(hours).padStart(2, '0');
  $('#minutes').textContent = String(minutes).padStart(2, '0');
  $('#seconds').textContent = String(seconds).padStart(2, '0');

  document.body.classList.toggle('final-week', delta <= 7 * DAY);
  document.body.classList.toggle('final-day', delta <= DAY);

  if (delta <= DAY) {
    $('.countdown-label').textContent = 'فردا دیگر «به‌زودی» نیست.';
    $('#hero-sub').textContent = 'از مادرید و ساری، تا فردایی که بالاخره استانبول می‌شود.';
  } else if (delta <= 7 * DAY) {
    $('.countdown-label').textContent = 'دیگر واقعاً نزدیکیم.';
  }
}

function haversine(a, b) {
  const R = 6371;
  const rad = d => d * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const lat1 = rad(a.lat), lat2 = rad(b.lat);
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2)**2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

function updateRoute() {
  const total = meetingTs - contentStartTs;
  const elapsed = Date.now() - contentStartTs;
  const ratio = clamp(elapsed / total, 0, 1);
  const p = 4 + ratio * 42;
  document.documentElement.style.setProperty('--mahan-progress', `${p}%`);
  document.documentElement.style.setProperty('--yalda-progress', `${p}%`);

  const madridKm = haversine(CONFIG.cities.madrid, CONFIG.cities.istanbul);
  const sariKm = haversine(CONFIG.cities.sari, CONFIG.cities.istanbul);
  $('#route-madrid-distance').textContent = `Madrid → Istanbul · ${madridKm.toLocaleString('en-US')} km`;
  $('#route-sari-distance').textContent = `Sari → Istanbul · ${sariKm.toLocaleString('en-US')} km`;

  const daysLeft = Math.max(0, Math.ceil((meetingTs - Date.now()) / DAY));
  $('#route-progress-label').textContent = daysLeft === 0 ? 'رسیدیم.' : `${daysLeft.toLocaleString('fa-IR')} روز مانده`;
}

function cityClockTick() {
  $$('.city-card').forEach(card => {
    const key = card.dataset.city;
    const tz = CONFIG.cities[key].timezone;
    const time = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    }).format(new Date());
    $('[data-time]', card).textContent = time;
  });
}

async function fetchWeatherFor(key) {
  const city = CONFIG.cities[key];
  const card = $(`.city-card[data-city="${key}"]`);
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', city.lat);
  url.searchParams.set('longitude', city.lon);
  url.searchParams.set('current', 'temperature_2m,weather_code');
  url.searchParams.set('daily', 'sunset');
  url.searchParams.set('timezone', city.timezone);
  url.searchParams.set('forecast_days', '1');

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Weather ${res.status}`);
    const data = await res.json();
    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weather_code;
    const [label, glyph] = WEATHER_CODES[code] || ['Weather', '·'];
    const sunset = data.daily?.sunset?.[0]?.split('T')?.[1]?.slice(0, 5) || '--:--';
    $('[data-temp]', card).textContent = `${temp}°`;
    $('[data-condition]', card).textContent = label;
    $('[data-weather-icon]', card).textContent = glyph;
    $('[data-sunset]', card).textContent = `Sunset ${sunset}`;
  } catch (err) {
    $('[data-condition]', card).textContent = 'Weather unavailable';
    $('[data-weather-icon]', card).textContent = '·';
    $('[data-sunset]', card).textContent = 'Sunset --:--';
  }
}

function setupUnlocks() {
  const grid = $('#unlock-grid');
  const dialog = $('#unlock-dialog');
  const todayIndex = contentDayIndex();
  const total = UNLOCK_MESSAGES.length;
  const opened = new Set(JSON.parse(localStorage.getItem('taYaldaOpened') || '[]'));

  grid.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'unlock';
    btn.disabled = i > todayIndex;
    btn.setAttribute('aria-label', i > todayIndex ? `روز ${i + 1} هنوز قفل است` : `باز کردن پیام روز ${i + 1}`);
    btn.innerHTML = `<span class="paw" aria-hidden="true">${i > todayIndex ? '○' : '♡'}</span><span class="n">${String(i + 1).padStart(2,'0')}</span>`;
    if (i === todayIndex) btn.classList.add('is-today');
    if (opened.has(i)) btn.classList.add('is-opened');
    btn.addEventListener('click', () => {
      opened.add(i);
      localStorage.setItem('taYaldaOpened', JSON.stringify([...opened]));
      btn.classList.add('is-opened');
      $('#dialog-day').textContent = `DAY ${String(i + 1).padStart(2,'0')}`;
      $('#dialog-message').textContent = UNLOCK_MESSAGES[i];
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else showToast(UNLOCK_MESSAGES[i]);
    });
    grid.appendChild(btn);
  }

  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    if (e.target === dialog) dialog.close();
  });
}

let toastTimer;
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4200);
}

function setupCatSecrets() {
  let secretCursor = Math.floor(Math.random() * SECRET_MESSAGES.length);
  const reveal = () => {
    const msg = SECRET_MESSAGES[secretCursor % SECRET_MESSAGES.length];
    secretCursor += 1;
    $('#cat-secret').textContent = msg;
    showToast(msg);
  };
  $('#cat-secret-button').addEventListener('click', reveal);
  $('#cat-mahan').addEventListener('click', reveal);
  $('#cat-yalda').addEventListener('click', reveal);
}

async function setupSong() {
  const idx = clamp(contentDayIndex(), 0, SONGS.length - 1);
  const [title, artist] = SONGS[idx];
  $('#song-title').textContent = title;
  $('#song-artist').textContent = artist;
  $('#spotify-link').href = `https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`)}`;

  const audio = $('#song-preview');
  const btn = $('#preview-button');
  const status = $('#song-status');
  let previewUrl = null;

  try {
    const term = encodeURIComponent(`${title} ${artist}`);
    const res = await fetch(`https://itunes.apple.com/search?term=${term}&media=music&entity=song&limit=6`);
    if (!res.ok) throw new Error('No preview');
    const data = await res.json();
    const best = data.results.find(r => r.previewUrl && r.trackName?.toLowerCase().includes(title.toLowerCase().slice(0, 8))) || data.results.find(r => r.previewUrl);
    previewUrl = best?.previewUrl || null;
  } catch (_) {
    previewUrl = null;
  }

  if (!previewUrl) {
    status.textContent = 'Preview پیدا نشد؛ آهنگ را از لینک Spotify باز کن.';
    btn.disabled = true;
    btn.textContent = 'Preview unavailable';
    return;
  }

  audio.src = previewUrl;
  status.textContent = 'یک تکه کوتاه برای امروز.';
  btn.addEventListener('click', async () => {
    try {
      if (audio.paused) {
        await audio.play();
        btn.textContent = 'توقف';
      } else {
        audio.pause();
        btn.textContent = '۳۰ ثانیه گوش بده';
      }
    } catch (_) {
      status.textContent = 'مرورگر اجازه پخش نداد؛ دوباره کلیک کن یا Spotify را باز کن.';
    }
  });
  audio.addEventListener('ended', () => { btn.textContent = 'دوباره گوش بده'; });
}

function init() {
  $('#footer-year').textContent = new Date().getFullYear();
  setDailyMessage();
  updateCountdown();
  updateRoute();
  cityClockTick();
  setupUnlocks();
  setupCatSecrets();
  setupSong();
  Object.keys(CONFIG.cities).forEach(fetchWeatherFor);

  setInterval(updateCountdown, 1000);
  setInterval(cityClockTick, 1000);
  setInterval(updateRoute, 60 * 1000);
  setInterval(() => Object.keys(CONFIG.cities).forEach(fetchWeatherFor), 30 * 60 * 1000);
}

document.addEventListener('DOMContentLoaded', init);
