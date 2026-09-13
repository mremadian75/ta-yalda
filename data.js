/* ============================================================================
   تا یلدا — همه‌ی چیزهایی که ممکنه بخوای عوض کنی، این‌جاست.
   ----------------------------------------------------------------------------
   EVERYTHING personal lives in this one file. You never need to open app.js.

   HOW THE DAYS WORK
   -----------------
   `days` is keyed by HOW MANY DAYS ARE LEFT, not by date. So `days[7]` is the
   message shown when there are 7 days to go, and `days[0]` is the morning of
   the meeting itself. If you ever move `meetingAt`, the whole emotional arc
   slides with it automatically — you don't have to rewrite anything.

   A day is "unlocked" once its date arrives, and stays open forever after.
   Days further out than the longest key fall back to the `evergreen` pool,
   picked by the date so it stays the same all day rather than changing on
   every refresh.

   TO EDIT ONE DAY  →  find its number in `days` and change `note` / `unlock`.
   TO ADD A SONG    →  append to `songs`.
   TO ADD CAT LINES →  append to `catLines.mahan` or `catLines.yalda`.
   ========================================================================== */

var TA_YALDA = {

  /* ======================================================================
     CONFIG — the facts
     ====================================================================== */
  config: {
    // Yalda lands in Istanbul. +03:00 is Istanbul year-round (Türkiye has had
    // no daylight saving since 2016), so this instant is unambiguous.
    meetingAt: '2026-10-14T10:45:00+03:00',

    // When the cats set off. Only used to position them along the route.
    journeyStartsAt: '2026-09-13T00:00:00+03:00',

    // Every "which day is it" decision is made on Istanbul's calendar.
    timezone: 'Europe/Istanbul',

    cities: {
      madrid:   { name: 'Madrid',   lat: 40.4168, lon: -3.7038,  timezone: 'Europe/Madrid' },
      sari:     { name: 'Sari',     lat: 36.5633, lon: 53.0601,  timezone: 'Asia/Tehran' },
      istanbul: { name: 'Istanbul', lat: 41.0082, lon: 28.9784,  timezone: 'Europe/Istanbul' }
    },

    // Which city each cat lives in — drives its sleep/weather state.
    catCity: { mahan: 'madrid', yalda: 'sari' },

    // Where the "find this song" link goes.
    //
    // NOT Spotify or Apple Music: both are unavailable from Iran, which would
    // make the link dead for the one person this site is for. A plain web
    // search works from everywhere. {q} is replaced with "title artist".
    // Swap in whatever you two actually use.
    songSearch: {
      label: 'جست‌وجوی آهنگ',
      url: 'https://duckduckgo.com/?q={q}'
    },

    // The public half of the trip. Nothing here identifies a booking: no PNR,
    // no ticket number, no document details. Keep it that way.
    flight: {
      passenger: 'یلدا',
      fromCode: 'IKA',
      fromCity: 'Tehran',
      toCode: 'IST',
      toCity: 'Istanbul'
    }
  },

  signature: '— ماهان',

  /* ======================================================================
     PHASE COPY — how the page talks as the date gets closer
     ====================================================================== */
  phases: {
    far: {
      kicker: 'روزشمارِ رسیدن به تو',
      sub: 'دو شهر، دو مسیر، یک قرار.',
      lead: 'تا رسیدنت به استانبول'
    },
    near: {
      kicker: 'روزشمارِ رسیدن به تو',
      sub: 'دیگر از آن ماه‌هایی نیست که باید بشماری‌شان. حالا فقط روز است.',
      lead: 'تا رسیدنت به استانبول'
    },
    lastweek: {
      kicker: 'فقط یک هفته',
      sub: 'از این‌جا به بعد دیگر هر روز حساب می‌شود.',
      lead: 'تا استانبول'
    },
    last72: {
      kicker: 'دیگر تقریباً رسیدیم',
      sub: 'چیزی نمانده. واقعاً چیزی نمانده.',
      lead: 'تا استانبول'
    },
    tomorrow: {
      kicker: 'فردا',
      sub: 'فردا دیگر «به‌زودی» نیست.',
      lead: 'تا فردا صبح'
    },
    today: {
      kicker: 'امروز',
      sub: 'امروز همان روزی است که این صفحه برایش ساخته شد.',
      lead: 'تا فرود',
      leadFinalHour: 'الان دیگر دارد نزدیک می‌شود'
    }
  },

  /* ======================================================================
     ARRIVAL — what the page becomes when the countdown ends
     ====================================================================== */
  arrival: {
    figure: 'سلام یلدا',
    countdownLead: 'رسیدی.',
    announce: 'یلدا به استانبول رسیده است.',
    routeStatus: 'همین‌جا',
    note: 'خب. دیگر لازم نیست چیزی بشماریم.',
    unlock: 'این آخرین چیزی است که این صفحه می‌خواست بگوید: بقیه‌اش را دیگر آنلاین زندگی نکنیم. برویم.',
    unlockKind: 'promise'
  },

  /* ======================================================================
     LABELS for the daily unlock
     ====================================================================== */
  unlockKinds: {
    note:       'یادداشت',
    confession: 'یک اعتراف',
    question:   'یک سؤال',
    memory:     'یک خاطره',
    plan:       'یک نقشه',
    cat:        'گزارشِ گربه',
    challenge:  'مأموریت امروز',
    joke:       'یک چرت‌وپرت',
    promise:    'یک قول'
  },

  /* ======================================================================
     FALLBACKS — shown when the internet does not cooperate
     ====================================================================== */
  fallbacks: {
    weather: 'هوا فعلاً قایم شده',
    songLoading: 'دارم پیدایش می‌کنم…',
    songStillLoading: 'چند لحظه — هنوز دارم پیدایش می‌کنم.',
    songNoPreview: '',
    songBlocked: 'مرورگر اجازه پخش نداد. یک بار دیگر بزن.',
    songCopied: 'کپی شد.',
    songCopyFailed: 'کپی نشد — دستی انتخابش کن.'
  },

  /* ======================================================================
     CAT LINES — tap a cat, it tells you something
     Two bags, two voices. Each gets shuffled and dealt so lines don't repeat
     until the bag is empty.
     ====================================================================== */
  catLines: {
    // ماهان's cat — deadpan, reports on him like a disappointed colleague
    mahan: [
      'گزارش می‌دهم: صاحبم امروز سه بار این صفحه را باز کرده. هنوز صبح است.',
      'یواشکی بگم؟ خیلی دلتنگته.',
      'رسماً اعلام می‌کنم بلد نیست صبر کند. تمام.',
      'دیشب داشت بلند بلند فکر می‌کرد استانبول چه شکلی است. من خوابیدم.',
      'یک بار گفت «زیاد فکر نمی‌کنم بهش». من همان‌جا بودم. دروغ بود.',
      'وضعیت فعلی: سالم، سرحال، بی‌قرار.',
      'چمدانش را هنوز نبسته ولی سه بار چک کرده پاسپورتش کجاست.',
      'از من پرسید «به‌نظرت زود می‌رسد؟» من گربه‌ام. ولی گفتم آره.',
      'یک لیست دارد از کارهایی که در استانبول بکنید. لیست دراز است.',
      'بهش گفتم آرام باش. نگاهم کرد. آرام نشد.',
      'امروز وسط کارش زد این صفحه را باز کرد. من دیدم.',
      'خلاصه‌ی گزارش امروز: همان دیروز، فقط یک روز کمتر.'
    ],
    // یلدا's cat — cheeky, on her side, slightly conspiratorial
    yalda: [
      'من طرف توام. همیشه.',
      'این یکی را فقط خودت باید می‌دیدی.',
      'فکر کنم من هم دارم روزها را می‌شمرم. با دست نمی‌شود، پنجه دارم.',
      'اگر بپرسد کی بیشتر دلش تنگ شده، بگو تو. من تأییدت می‌کنم.',
      'شنیدم قرار است برویم استانبول. «ما» را با خوش‌بینی گفتم.',
      'یک چیزی بگویم نگویی به کسی؟ فکر کنم خیلی خاصی.',
      'بعضی روزها سخت‌ترند. امروز اگر یکی از آن‌هاست، این پیام برای همان است.',
      'من گربه‌ام و حسودی‌ام می‌شود؛ ولی این یکی را قبول دارم.',
      'اگر گربه‌ها پاسپورت داشتند، من زودتر می‌رسیدم آن‌جا.',
      'گفت نگویم بهت. نگفتم. فقط اشاره کردم.',
      'خبر موثق: آن‌طرف هم دقیقاً همین‌قدر بی‌تاب است.',
      'هر وقت خواستی دوباره بزن. من حرف زیاد دارم.'
    ]
  },

  /* ======================================================================
     EVERGREEN — used only if the meeting is further away than the written
     arc below (i.e. you moved the date). Stable per calendar day.
     ====================================================================== */
  evergreen: [
    { note: 'هنوز خیلی مانده، ولی مقصد که معلوم است، راه کوتاه‌تر حس می‌شود.',
      unlock: 'یک سؤال بی‌مقدمه: اگر همین الان می‌شد یک جای دنیا باشی، کجا؟ (جواب «استانبول» امتیاز اضافه ندارد.)',
      unlockKind: 'question' },
    { note: 'امروز هم یک روز کمتر. همین. گزارش تمام.',
      unlock: 'اعتراف: ساختن این صفحه بهانه‌ی خوبی بود که بیشتر از معمول به تو فکر کنم.',
      unlockKind: 'confession' },
    { note: 'بعضی مقصدها فرودگاه نیستند؛ یک نفرند.',
      unlock: 'گربه گزارش داده اوضاع تحت کنترل است. گربه دروغ می‌گوید.',
      unlockKind: 'cat' },
    { note: 'فاصله روی نقشه بزرگ است. در ذهن من خیلی وقت است تمام شده.',
      unlock: 'مأموریت امروز: یک آهنگ بگذار که اگر کنار هم بودیم با هم گوش می‌دادیم.',
      unlockKind: 'challenge' },
    { note: 'قرار است یک روز برسد که این صفحه دیگر کاری برای انجام دادن نداشته باشد.',
      unlock: 'یک قول: وقتی رسیدیم، چند ساعت اول اصلاً به ساعت نگاه نمی‌کنم.',
      unlockKind: 'promise' }
  ],

  /* ======================================================================
     THE ARC — one entry per day, keyed by days remaining.
     Filled in below by `days`.
     ====================================================================== */
  days: {},

  /* ======================================================================
     SONGS — a mixtape, not a playlist widget.
     Rotates by days remaining. Persian + international.
     `why` is optional; it is the one line that makes it a mixtape.
     ====================================================================== */
  songs: [
    { title: 'Apocalypse', artist: 'Cigarettes After Sex', why: 'برای شب‌هایی که ساعتِ اینجا و آنجا قاطی می‌شود.' },
    { title: 'Divooneh', artist: 'Chaartaar', why: 'این یکی را باید بلند گوش داد.' },
    { title: 'My Love Mine All Mine', artist: 'Mitski', why: 'کوتاه است و دقیقاً همان چیزی را می‌گوید که باید.' },
    { title: 'Mano To', artist: 'Googoosh', why: 'چون بعضی چیزها را قدیمی‌ترها بهتر گفته‌اند.' },
    { title: 'About You', artist: 'The 1975', why: 'سه دقیقه‌ی آخرش را از دست نده.' },
    { title: 'Rozaneh', artist: 'Pallett', why: 'برای صبح‌هایی که حوصله‌ی حرف زدن نیست.' },
    { title: 'Space Song', artist: 'Beach House', why: 'اسمش را بی‌دلیل نگذاشته‌اند.' },
    { title: 'Chatr Khis', artist: 'Hamed Homayoun', why: 'اگر ساری امروز بارانی است، این را بگذار.' },
    { title: 'Fade Into You', artist: 'Mazzy Star', why: 'قدیمی، کند، درست.' },
    { title: 'Cheshme Man', artist: 'Dariush', why: 'یک آهنگ که پدرهایمان هم بلدند.' },
    { title: 'Glue Song', artist: 'beabadoobee', why: 'دو دقیقه شادی خالص.' },
    { title: 'Behet Ghol Midam', artist: 'Mohsen Yeganeh', why: 'اسمش را که دیدم، فکر کردم مناسب است.' },
    { title: 'Cariño', artist: 'The Marías', why: 'از مادرید سلام.' },
    { title: 'Mosafer', artist: 'Kaveh Yaghmaei', why: 'برای کسی که دارد سفر می‌کند.' },
    { title: 'The Night We Met', artist: 'Lord Huron', why: 'یک بار گوش کن، بعد دوباره.' },
    { title: 'Delbar', artist: 'Damahi', why: 'این یکی حال آدم را خوب می‌کند.' },
    { title: 'Like Real People Do', artist: 'Hozier', why: 'ساده‌ترین آهنگ این لیست.' },
    { title: 'Nafas', artist: 'Shadmehr Aghili', why: 'بی‌دلیل. فقط دوستش دارم.' },
    { title: 'Until I Found You', artist: 'Stephen Sanchez', why: 'کمی قدیمی‌صدا، عمداً.' },
    { title: 'Blue Flowers', artist: 'Marjan Farsad', why: 'آبی، آرام، مال خودمان.' },
    { title: 'I Wanna Be Yours', artist: 'Arctic Monkeys', why: 'شعرش را قبلاً هم خوانده بودی احتمالاً.' },
    { title: 'Zendegi Bedoone To', artist: 'Sirvan Khosravi', why: 'عنوانش کمی گنده است، خود آهنگ نه.' },
    { title: 'Sunsetz', artist: 'Cigarettes After Sex', why: 'برای غروب — هر کدام از سه تا شهر.' },
    { title: 'Vahdat', artist: 'Farhad Mehrad', why: 'صدایی که هیچ‌وقت کهنه نمی‌شود.' },
    { title: 'Best Part', artist: 'Daniel Caesar', why: 'برای وقتی که حالت خوب است.' },
    { title: 'Shabzadeh', artist: 'Ebi', why: 'اگر بیداری و نباید باشی.' },
    { title: 'Video Games', artist: 'Lana Del Rey', why: 'یک کلاسیک کوچک.' },
    { title: 'Chera Rafti', artist: 'Homayoun Shajarian', why: 'این یکی جدی است. آماده باش.' },
    { title: 'Bloom', artist: 'The Paper Kites', why: 'برای راه رفتن.' },
    { title: 'Sea of Love', artist: 'Cat Power', why: 'اسم خواننده‌اش را ببین. گربه‌ها موافق‌اند.' },
    { title: "Can't Help Falling in Love", artist: 'Elvis Presley', why: 'می‌دانم. ولی جایش این‌جا بود.' },
    { title: 'Daylight', artist: 'David Kushner', why: 'برای آخرین روزها.' }
  ]
};

// Exposed the same way in a browser (classic script) and in the Node test
// harness, without depending on globalThis.
if (typeof window !== 'undefined') window.TA_YALDA = TA_YALDA;
else if (typeof global !== 'undefined') global.TA_YALDA = TA_YALDA;
if (typeof module !== 'undefined' && module.exports) module.exports = TA_YALDA;
