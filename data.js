/* ============================================================================
   تا یلدا
   متن ها و چیزهای شخصی این فایل اینجاست.
   ========================================================================== */

var TA_YALDA = {
  config: {
    meetingAt: '2026-10-14T10:45:00+03:00',
    journeyStartsAt: '2026-09-13T00:00:00+03:00',
    timezone: 'Europe/Istanbul',

    cities: {
      madrid:   { name: 'Madrid',   lat: 40.4168, lon: -3.7038, timezone: 'Europe/Madrid' },
      sari:     { name: 'Sari',     lat: 36.5633, lon: 53.0601, timezone: 'Asia/Tehran' },
      istanbul: { name: 'Istanbul', lat: 41.0082, lon: 28.9784, timezone: 'Europe/Istanbul' }
    },

    catCity: { mahan: 'madrid', yalda: 'sari' },

    songSearch: {
      label: 'پیداش کن',
      url: 'https://duckduckgo.com/?q={q}'
    },

    flight: {
      passenger: 'یلدا',
      fromCode: 'IKA',
      fromCity: 'Tehran',
      toCode: 'IST',
      toCity: 'Istanbul'
    }
  },

  signature: 'ماهان ❤️',

  phases: {
    far: {
      kicker: 'تا وقتی بالاخره ببینمت',
      sub: 'خیلی خیلی خوشحالم قراره همو ببینیم ❤️',
      lead: 'تا دیدنت'
    },
    near: {
      kicker: 'داره نزدیک میشه وروجک',
      sub: 'هر روز که کم میشه من بیشتر ذوق می‌کنم.',
      lead: 'تا دیدنت'
    },
    lastweek: {
      kicker: 'یه هفتههههه ❤️',
      sub: 'از اینجا به بعد دیگه رسماً صبر ندارم.',
      lead: 'تا دیدنت'
    },
    last72: {
      kicker: 'سه روز',
      sub: 'یلداااا دیگه واقعاً چیزی نمونده.',
      lead: 'تا دیدنت'
    },
    tomorrow: {
      kicker: 'فردا',
      sub: 'فردا می‌بینمت خانوم زیبا ❤️',
      lead: 'تا فردا'
    },
    today: {
      kicker: 'امروز',
      sub: 'امروز می‌بینمت یلدا. بالاخره.',
      lead: 'تا دیدنت',
      leadFinalHour: 'دیگه فقط یه کم مونده'
    }
  },

  arrival: {
    figure: 'اومدی ❤️',
    countdownLead: 'بالاخره دیدمت',
    announce: 'یلدا رسید.',
    routeStatus: 'بالاخره کنار هم',
    note: 'خب کوچولوی من، دیگه لازم نیست این صفحه چیزی بشمره. خودت اینجایی ❤️',
    unlock: 'بقیه‌ش دیگه توی سایت نیست. بقیه‌ش رو با هم می‌سازیم.',
    unlockKind: 'promise'
  },

  unlockKinds: {
    note: 'از من به تو',
    confession: 'یه چیزی که باید بدونی',
    question: 'یه سوال کوچولو',
    memory: 'یه چیزی که یادم مونده',
    plan: 'وقتی دیدمت',
    cat: 'گربه خبر آورده',
    challenge: 'برای امروز',
    joke: 'یه چیز الکی',
    promise: 'قول من'
  },

  fallbacks: {
    weather: 'هوا جوابمون رو نداد 😌',
    songLoading: 'یه لحظه صبر کن…',
    songStillLoading: 'هنوز داره پیداش می‌کنه…',
    songNoPreview: '',
    songBlocked: 'یه بار دیگه بزن کوچولو.',
    songCopied: 'اسمش کپی شد ❤️',
    songCopyFailed: 'اسمش رو از بالا کپی کن.'
  },

  catLines: {
    mahan: [
      'من گربه ماهانم. از صبح چند بار گفته یلدا رو دوست دارم. منم فهمیدم دیگه.',
      'خبر فوری: خیلی دلتنگته.',
      'فکر می‌کنه خیلی خونسرده. نیست.',
      'اگه دیدی زیاد ذوق کرده تعجب نکن. چند هفته‌ست همین وضعه.',
      'امروز هم گفت «چیزی نمونده». من دیگه جواب نمی‌دم.',
      'یه عالمه بغل برات کنار گذاشته. من شمردم.',
      'گفته وقتی ببینتت اول عادی رفتار می‌کنه. من باور نکردم.',
      'از من خواست بگم خیلی خیلی دوستت داره. گفتم خودت بگو.',
      'من فقط یه گربه‌ام ولی این یکی خیلی واضحه. عاشقته.',
      'صبرش خیلی کم شده. لطفاً زودتر برس.',
      'وروجک، این طرف اوضاع تحت کنترل نیست 😌',
      'خلاصه گزارش: هنوز دوستت داره. خیلی هم زیاد.'
    ],
    yalda: [
      'خانوم زیبا، اینجا همه طرف توئن.',
      'من گربه یلدام و رسماً می‌گم خیلی نازی.',
      'این یکی رو فقط خودت ببین: خیلی خیلی دوستت داره.',
      'اگه امروز خسته‌ای، بیا یه کم اینجا بمون.',
      'منم منتظرم برسی استانبول. البته بیشتر برای بغل بعدش.',
      'کوچولوی من، یه نفر اون طرف خیلی ذوق داره.',
      'هر بار میای این صفحه یعنی یه روز نزدیک‌تری ❤️',
      'گفت بهت نگم، ولی از الان دلش برای لحظه دیدنت رفته.',
      'اگه گربه‌ها می‌تونستن بلیت بگیرن منم میومدم.',
      'یلدااا، فقط خواستم اسمت رو صدا کنم.',
      'یه بغل خیلی طولانی توی راهه.',
      'این پیام رسمی نیست. فقط دوستت داریم.'
    ]
  },

  evergreen: [
    {
      note: 'یلدا من خیلی خیلی خوشحالم قراره همو ببینیم. هر بار بهش فکر می‌کنم ناخودآگاه لبخند می‌زنم ❤️',
      unlock: 'این صفحه رو ساختم که هر روز یه چیز کوچیک از من داشته باشی تا برسم بهت.',
      unlockKind: 'note'
    },
    {
      note: 'دوست دارم خانوم زیبا. یه عالمه.',
      unlock: 'امروز فقط اینو بدون که خیلی خوشحالم تو رو دارم.',
      unlockKind: 'confession'
    },
    {
      note: 'چقدر خوبه که هستی یلدا. واقعاً حس خوبیه که می‌تونم راحت باهات حرف بزنم.',
      unlock: 'مرسی که انقدر خانومی و انقدر منو می‌فهمی ❤️',
      unlockKind: 'note'
    },
    {
      note: 'دوست دارم وروجک.',
      unlock: 'یه بغل خیلی طولانی از الان رزرو کردم. قابل لغو نیست.',
      unlockKind: 'promise'
    },
    {
      note: 'کوچولوی من، هر روز یه کم نزدیک‌تر.',
      unlock: 'یه عالمه بوس و بغل طلب داری. آماده باش 😌',
      unlockKind: 'joke'
    }
  ],

  days: {
    31: {
      note: 'یلدا من خیلی خیلی خوشحالم قراره همو ببینیم. جدی هنوز هر بار بهش فکر می‌کنم یه لبخند احمقانه میاد رو صورتم ❤️',
      unlock: 'این صفحه رو ساختم که هر روز یه چیز کوچیک از من داشته باشی تا برسم بهت. همین.',
      unlockKind: 'note'
    },
    30: {
      note: 'دوست دارم خانوم زیبا. یه عالمه هم دوست دارم.',
      unlock: 'امروز فقط خواستم بهت بگم کلی به خودم افتخار می‌کنم که تو رو دارم.',
      unlockKind: 'confession'
    },
    29: {
      note: 'وروجک من، خیلی مونده به نظرت؟ برای من انگار هم خیلی مونده هم اصلاً هیچی نمونده.',
      unlock: 'یه بغل خیلی طولانی از الان رزرو کردم. قابل لغو هم نیست.',
      unlockKind: 'promise'
    },
    28: {
      note: 'یلدا، چقدر خوبه که هستی. واقعاً حس خوبیه که می‌تونم راحت باهات حرف بزنم و خودم باشم.',
      unlock: 'ممنونم که انقدر خانومی و انقدر منو می‌فهمی و همراهی می‌کنی ❤️',
      unlockKind: 'note'
    },
    27: {
      note: 'کوچولوی من، امروز فقط دلم خواست بنویسم دوست دارم. بدون هیچ دلیل اضافه‌ای.',
      unlock: 'اگه امروز یه ذره خسته یا بی‌حوصله‌ای، سهم من اینه که دوستت داشته باشم تا خودت دوباره حالت خوب شه.',
      unlockKind: 'note'
    },
    26: {
      note: 'زیبای من، من هنوز نفهمیدم چجوری قراره وقتی ببینمت عادی رفتار کنم.',
      unlock: 'احتمال زیاد چند ثانیه اول فقط نگاهت می‌کنم و هیچی نمی‌گم. از الان گفتم فکر نکنی هنگ کردم.',
      unlockKind: 'confession'
    },
    25: {
      note: 'فرشته کوچولوی من، خیلی خیلی خوشحالم قراره بالاخره توی یه شهر باشیم.',
      unlock: 'یه عالمه حرف دارم که تایپ کردنشون اصلاً مثل گفتنشون نیست.',
      unlockKind: 'note'
    },
    24: {
      note: 'بعضی وقتا وسط روز یهو یادم میفته ماه بعد می‌بینمت و کل مودم عوض میشه.',
      unlock: 'یه بوس بدهکاری. تعدادش رو بعداً اعلام می‌کنم 😌',
      unlockKind: 'joke'
    },
    23: {
      note: 'یلدا تو خیلی قشنگی. اینو می‌دونی. ولی چیزی که من بیشتر دوست دارم اخلاق خوبت، طرز فکرت و مهربونیت هست.',
      unlock: 'واقعاً از اینکه انقدر همراهی و درکم می‌کنی ممنونم ❤️',
      unlockKind: 'confession'
    },
    22: {
      note: 'دوست دارم وروجک. خیلی.',
      unlock: 'امروز هیچ حرف عمیقی ندارم. فقط دلم برات تنگ شده.',
      unlockKind: 'note'
    },
    21: {
      note: 'من تو رو فقط برای قشنگ بودنت دوست ندارم. خیلی چیزای کوچیک توی رفتارت هست که هر بار بیشتر دلم می‌بره.',
      unlock: 'یکی از چیزایی که خیلی دوست دارم اینه که می‌تونم باهات راحت حرف بزنم. این برای من خیلی با ارزشه.',
      unlockKind: 'confession'
    },
    20: {
      note: 'خانوم زیبا، فکر اینکه تو از ساری راه میفتی و من از مادرید و آخرش استانبول همدیگه رو می‌بینیم خیلی قشنگه.',
      unlock: 'از الان می‌دونم روز دیدنت خیلی خیلی خوب میشه، حتی اگه هیچ پلنی نداشته باشیم.',
      unlockKind: 'plan'
    },
    19: {
      note: 'دوست دارم کوچولوی من ❤️',
      unlock: 'فقط همین. بعضی روزا واقعاً بیشتر از این لازم نیست.',
      unlockKind: 'note'
    },
    18: {
      note: 'یلدا، تو خیلی مهربونی. خیلی بیشتر از چیزی که شاید خودت حواست باشه.',
      unlock: 'من خیلی حواسم به چیزایی که برای من می‌کنی و جوری که کنارمی هست. هیچکدومش برام عادی نیست.',
      unlockKind: 'confession'
    },
    17: {
      note: 'هرچی نزدیک‌تر میشیم بیشتر ذوق می‌کنم. فکر می‌کردم برعکسش آروم‌تر میشم. نشدم.',
      unlock: 'احتمالاً تا اون روز صد بار دیگه هم میگم خیلی خوشحالم قراره ببینمت.',
      unlockKind: 'joke'
    },
    16: {
      note: 'دوست دارم یه عالمه خانوم زیبا.',
      unlock: 'و بله، هنوزم از گفتنش خسته نشدم.',
      unlockKind: 'note'
    },
    15: {
      note: 'نصف راه رو رد کردیم کوچولو. الان دیگه واقعاً داره نزدیک میشه.',
      unlock: 'یه چیزی رو از الان بدون. وقتی ببینمت فکر نکن خیلی راحت میذارم از بغلم در بری.',
      unlockKind: 'promise'
    },
    14: {
      note: 'دو هفته. فقط دو هفته تا اینکه دیگه لازم نباشه فقط توی گوشی ببینمت.',
      unlock: 'من برای دیدنت خیلی ذوق دارم. از اون ذوقایی که آدم سعی می‌کنه عادی باشه و اصلاً موفق نمیشه.',
      unlockKind: 'confession'
    },
    13: {
      note: 'یلداااا 😌❤️',
      unlock: 'امروز فقط خواستم اسمت رو صدا کنم. همین.',
      unlockKind: 'joke'
    },
    12: {
      note: 'چقدر خوبه که تو رو دارم. جدی میگم. خیلی وقتا بهش فکر می‌کنم و کلی به خودم افتخار می‌کنم.',
      unlock: 'مرسی که هستی کوچولوی من.',
      unlockKind: 'note'
    },
    11: {
      note: 'زیباترین و قشنگ‌ترین و مهربون‌ترین خانوم من.',
      unlock: 'می‌دونم خیلی تعریف کردم ولی خب تقصیر خودته.',
      unlockKind: 'joke'
    },
    10: {
      note: 'ده روز. یعنی دیگه عددش دو رقمی هم به زور مونده.',
      unlock: 'من از الان دارم اون لحظه‌ای که می‌بینمت رو توی سرم هزار مدل تصور می‌کنم.',
      unlockKind: 'confession'
    },
    9: {
      note: 'دوست دارم فرشته کوچولوی من.',
      unlock: 'اگه الان پیشم بودی احتمالاً فقط می‌کشیدمت بغلم و یه مدت هیچی نمی‌گفتم.',
      unlockKind: 'confession'
    },
    8: {
      note: 'یلدا، خیلی دوست دارم که انقدر همراهی و می‌تونم باهات حرف بزنم. واقعاً حس خوبی بهم میدی.',
      unlock: 'این یکی از چیزاییه که شاید کم بگم ولی خیلی برام مهمه.',
      unlockKind: 'note'
    },
    7: {
      note: 'یه هفتههههه. فقط یه هفته وروجک ❤️',
      unlock: 'از اینجا به بعد من دیگه مسئول رفتار عادی خودم نیستم 😌',
      unlockKind: 'joke'
    },
    6: {
      note: 'خانوم زیبا، شش روز دیگه می‌بینمت. این جمله خیلی خوبه.',
      unlock: 'یه عالمه بغل و بوس طلب دارم. آماده باش.',
      unlockKind: 'promise'
    },
    5: {
      note: 'پنج روز. من رسماً دیگه صبر ندارم.',
      unlock: 'اگه روز دیدنت زیادی محکم بغلت کردم اعتراض وارد نیست.',
      unlockKind: 'joke'
    },
    4: {
      note: 'چهار روز مونده کوچولو. فقط چهار تا خواب.',
      unlock: 'فکر کنم اولین چیزی که میگم یه چیز کاملاً معمولی و احمقانه باشه چون مغزم کار نمی‌کنه.',
      unlockKind: 'confession'
    },
    3: {
      note: 'سه روز. یلدااا سه روز 😭❤️',
      unlock: 'خیلی خیلی خوشحالم. همینو احتمالاً امروز ده بار دیگه هم میگم.',
      unlockKind: 'note'
    },
    2: {
      note: 'پس فردا می‌بینمت. نوشتنش هم عجیبه.',
      unlock: 'هرچی می‌خواستم توی چت بگم دارم نگه می‌دارم که رو در رو بهت بگم.',
      unlockKind: 'promise'
    },
    1: {
      note: 'فردا. بالاخره فردا می‌بینمت خانوم زیبا ❤️',
      unlock: 'امشب زود بخواب کوچولو. فردا یه عالمه کار باهات دارم. از بغل کردن شروع میشه 😌',
      unlockKind: 'promise'
    },
    0: {
      note: 'امروز می‌بینمت یلدا. خیلی خیلی دوست دارم. راه بیفت بیا که دیگه واقعاً صبر ندارم ❤️',
      unlock: 'وقتی رسیدی فقط بیا بیرون. من اونجام.',
      unlockKind: 'promise'
    }
  },

  songs: [
    { title: 'Man Toro Mikham', artist: 'Kamran & Hooman', why: 'برای روزی که دیگه فقط اسمش رو نمی‌گم. خودت جلوی منی ❤️' },
    { title: "Can't Help Falling in Love", artist: 'Elvis Presley', why: 'کلیشه‌ایه؟ شاید. ولی خیلی خوبه.' },
    { title: 'Mast Didanet', artist: 'Epicure & Bobby Salar & Amin Aminem', why: 'این یکی رو خودم حتماً می‌خواستم توی لیست‌مون باشه.' },
    { title: 'I Wanna Be Yours', artist: 'Arctic Monkeys', why: 'اسمش خودش همه چی رو گفته.' },
    { title: 'Masalei Ni (Ft Kamal Raja)', artist: 'TM Bax', why: 'یه کم ریتم، یه کم حال خوب، یه کم خودمون.' },
    { title: 'Best Part', artist: 'Daniel Caesar feat. H.E.R.', why: 'این یکی خیلی ساده‌ست و خیلی قشنگ.' },
    { title: 'About You', artist: 'The 1975', why: 'برای وقتایی که یهو وسط روز میای توی ذهنم.' },
    { title: "Nothing's Gonna Hurt You Baby", artist: 'Cigarettes After Sex', why: 'آرومه. از اونایی که باید شب گوش داد.' },
    { title: 'Glue Song', artist: 'beabadoobee', why: 'دو دقیقه حال خوب خالص.' },
    { title: 'Yellow', artist: 'Coldplay', why: 'قدیمیه ولی هنوز قشنگه. مثل بعضی حس‌ها.' },
    { title: 'Video Games', artist: 'Lana Del Rey', why: 'برای یه شب آروم و طولانی.' },
    { title: 'Until I Found You', artist: 'Stephen Sanchez', why: 'این یکی رو برای خود عنوانش هم که شده باید می‌ذاشتم.' },
    { title: 'Heavenly', artist: 'Cigarettes After Sex', why: 'وقتی اسمش رو می‌خونی می‌فهمی چرا اینجاست.' },
    { title: 'Cariño', artist: 'The Marías', why: 'یه سلام کوچیک از مادرید.' },
    { title: 'Like Real People Do', artist: 'Hozier', why: 'ساده و نزدیک و خیلی دوست‌داشتنی.' },
    { title: 'My Love Mine All Mine', artist: 'Mitski', why: 'اسمش زیادی دقیق بود که نذارمش.' },
    { title: 'Sea of Love', artist: 'Cat Power', why: 'گربه‌ها این یکی رو تأیید کردن.' },
    { title: 'Apocalypse', artist: 'Cigarettes After Sex', why: 'برای شبایی که دلم بیشتر برات تنگ میشه.' },
    { title: 'No One Noticed', artist: 'The Marías', why: 'یه آهنگ برای وقتی که حرف زیادی لازم نیست.' },
    { title: 'Fade Into You', artist: 'Mazzy Star', why: 'خیلی آروم، خیلی نزدیک.' },
    { title: 'Sunsetz', artist: 'Cigarettes After Sex', why: 'برای غروب هر کدوم از سه تا شهر.' },
    { title: 'Thinkin Bout You', artist: 'Frank Ocean', why: 'واضحه دیگه 😌' },
    { title: 'Lover Is a Day', artist: 'Cuco', why: 'یه آهنگ گرم برای روزایی که دلتنگی قاطی ذوق میشه.' },
    { title: 'Bloom', artist: 'The Paper Kites', why: 'برای قدم زدن دونفره بدون اینکه عجله داشته باشیم.' },
    { title: 'Kiss Me', artist: 'Sixpence None the Richer', why: 'برای یه حال قدیمی و خیلی شیرین.' },
    { title: 'Sparks', artist: 'Coldplay', why: 'آروم گوشش کن.' },
    { title: 'Die For You', artist: 'The Weeknd', why: 'یه کم دراماتیکه. اشکال نداره.' },
    { title: 'Dusk Till Dawn', artist: 'ZAYN feat. Sia', why: 'برای مسیرهای طولانی تا رسیدن.' },
    { title: 'Behet Ghol Midam', artist: 'Mohsen Yeganeh', why: 'یه آهنگ فارسی که جاش توی این لیست بود.' },
    { title: 'Mano To', artist: 'Googoosh', why: 'من و تو. ساده‌تر از این نداریم.' },
    { title: 'Ey Joonam', artist: 'Sami Beigi', why: 'یه کم انرژی بیشتر برای روزای نزدیک‌تر.' },
    { title: 'Stressed Out', artist: 'Twenty One Pilots', why: 'این یکی از آهنگاییه که خودم آوردم اینجا. شروع خوبی برای این روزشماره.' }
  ]
};

/* ظاهر و متن های ثابت صفحه هم شخصی میشن، بدون اینکه منطق روزشمار دست بخوره. */
if (typeof document !== 'undefined') {
  (function () {
    var theme = document.createElement('link');
    theme.rel = 'stylesheet';
    theme.href = 'theme.css?v=3';
    document.head.appendChild(theme);

    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', '#1b1224');

    function text(selector, value) {
      var el = document.querySelector(selector);
      if (el) el.textContent = value;
    }

    function personalizePage() {
      document.body.classList.add('personal-theme');
      text('.route-foot', 'دو تا مسیر جدا، آخرش می‌رسن به هم ❤️');
      text('.cities .section-note', 'من اینجام، تو اونجایی، استانبول وسطش منتظرمونه.');
      text('.flight .section-title', 'اون روزی که بالاخره می‌بینمت');
      text('.flight .section-note', '۱۴ اکتبر، ۱۰:۴۵. این ساعت رو از حفظ شدم.');
      text('.foot-line', 'دوست دارم کوچولوی من ❤️');
      text('.song .section-note', 'چیزی که امروز دلم خواست باهات گوش بدم');
      text('.city[data-city="istanbul"] .city-role', 'WE MEET HERE');
      text('[data-song-copy]', 'اسمش رو بردار');

      if (!document.querySelector('.love-orbit')) {
        var orbit = document.createElement('div');
        orbit.className = 'love-orbit';
        orbit.setAttribute('aria-hidden', 'true');
        orbit.innerHTML = '<i></i><i></i><i></i><i></i>';
        document.body.insertBefore(orbit, document.body.firstChild);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', personalizePage);
    } else {
      personalizePage();
    }
  })();
}

if (typeof window !== 'undefined') window.TA_YALDA = TA_YALDA;
else if (typeof global !== 'undefined') global.TA_YALDA = TA_YALDA;
if (typeof module !== 'undefined' && module.exports) module.exports = TA_YALDA;
