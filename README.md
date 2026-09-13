# تا یلدا

A small private countdown site, from Madrid and Sari to one morning in Istanbul.

**Target:** Yalda's arrival in Istanbul — **14 October 2026, 10:45 (Europe/Istanbul)**.

---

## Editing it

Everything personal lives in **`data.js`**. You never need to open `app.js`.

```js
config.meetingAt      // the arrival instant — move this and everything follows
config.journeyStartsAt// when the two cats set off along the route
config.cities         // names, coordinates, timezones
config.flight         // IKA → IST, passenger name (no booking data, keep it that way)
days                  // the daily arc, keyed by DAYS REMAINING
evergreen             // used only if the date moves further out than the arc
arrival               // what the page becomes once she has landed
songs                 // the mixtape
catLines              // what each cat says when you tap it
phases                // how the page talks at each stage
fallbacks             // what shows when an API is down
```

### The days are keyed by *days remaining*, not by date

`days[7]` is what she sees when there are seven days left; `days[0]` is the
morning of the flight. So if the date ever moves, the whole emotional arc slides
with it and nothing has to be rewritten. Days beyond the longest key fall back to
`evergreen`, picked by a hash of the date so it stays put all day instead of
changing on every refresh.

A day unlocks once its date arrives and stays open afterwards.

### Changing the date

Edit `config.meetingAt` and `config.journeyStartsAt`. The countdown, the phase
copy, the cats' positions, the arrival stamp and the ticket all read from them —
nothing else is hardcoded.

---

## Running it

It is static. Any file server works:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

### Tests

```bash
node tools/test-phases.js       # 73 checks: timezone maths, every phase
                                # boundary, unlock gating, cat geometry,
                                # song matching, data sanity

NODE_PATH=$(npm root -g) node tools/qa.js [--shots]
                                # drives the real page in Chromium at every
                                # breakpoint and every stage of the countdown;
                                # also tests both APIs dead and localStorage
                                # blocked. --shots writes screenshots.
```

`test-phases.js` simulates 30 days out, T-7, T-72h, tomorrow, the final hour,
the exact moment of arrival and afterwards, and checks the Istanbul midnight
boundary specifically.

---

## What it uses

| | |
|---|---|
| Weather + sunrise/sunset | [Open-Meteo](https://open-meteo.com) — free, no key, no account |
| 30-second song previews | iTunes Search API — free, no key |
| Fonts | Vazirmatn, DM Mono, Instrument Serif — all OFL, **self-hosted** in `assets/fonts/` |

No backend, no build step, no framework, no analytics, no trackers, no API keys.

The fonts are bundled rather than loaded from Google Fonts on purpose:
`fonts.googleapis.com` is slow or unreachable from parts of Iran, and the page
must not depend on it.

Both APIs degrade gracefully — if either is down the page still looks finished
and says so in Persian. This is covered by the QA suite.

### The handwritten font

`IRANSans Handwritten` is proprietary and is **not** bundled. It is already first
in the `--fa-display` stack, so if you own a licence:

1. drop your file at `assets/fonts/IRANSansHandwritten.woff2`
2. uncomment the `@font-face` block at the top of `styles.css`

Until then the display face is Vazirmatn 300, which the design is tuned for — it
does not look broken without it.

---

## Privacy — read this bit

**This repository is public.** That was a deliberate choice: GitHub Pages is not
offered for private repositories on the Free plan, and making the repo public
was the route taken to get the site online.

So, plainly:

- Anyone can read this code, the full git history, and **all 32 daily messages**.
- The published site is served to anyone on the internet.
- The address is guessable — it is built from the account and repo name.
- `noindex, nofollow, noarchive` and `robots.txt` only ask well-behaved search
  engines to stay away. They are not access control.

**Write `data.js` as though a stranger will read it, because one can.** Keep out
anything you would not want seen: no booking reference, no e-ticket number, no
passport or payment details, no phone numbers, no addresses. The `flight` block
in `data.js` holds only the airport codes, the city names and the arrival time,
and there is a comment there saying to keep it that way.

The history was checked before the repo was made public: no credentials, no
email addresses, no phone numbers, and no photos or documents have ever been
committed.

If you later want the messages genuinely private, move the site to Cloudflare
Pages with Cloudflare Access (free, 50 users) and make this repository private
again — see Hosting below.

## Hosting: GitHub Pages is not available for this repo

Settings → Pages shows **"Upgrade or make this repository public to enable
Pages"**. There is no source selector at all. On the Free plan, GitHub Pages is
not offered for *private* repositories, so the workflow in
`.github/workflows/pages.yml` cannot succeed as things stand — it is left in
place and correct for whenever Pages does become available.

(The earlier `Get Pages site failed … Not Found` and then
`Create Pages site failed. Resource not accessible by integration` were both
this same cause: there is no Pages site to create, and the Actions token cannot
create one.)

Three ways forward, ranked for **this** project:

| | Cost | Repo stays private? | Site actually private? |
|---|---|---|---|
| **Cloudflare Pages + Cloudflare Access** | free | yes | **yes** — up to 50 users |
| GitHub Pro | ~$4/mo | yes | no — public URL |
| Make the repo public | free | **no** | no |

**1. Cloudflare Pages — recommended.** Free, deploys straight from the private
repo, and it is the only free option that genuinely restricts who can open the
page. Connect the repo, then:

```
build command    : bash tools/build-site.sh
output directory : _site
```

Then add a Cloudflare Access application over the site (Zero Trust dashboard →
Access → Applications) with an Allow policy for your two email addresses and
"email one-time PIN" as the login method. Zero Trust's free tier covers 50
users. There is no one-click "site password" toggle — it is an identity check —
but the session persists, so it is not a login every day.

**2. GitHub Pro (~$4/month).** Keeps everything on GitHub and the repo private,
and the existing workflow starts working immediately. But the *site* is still
served to anyone on the internet: privately-published Pages needs GitHub
Enterprise, which that same settings page says outright.

**3. Make the repository public.** Free and Pages works, but the code *and the
full git history* go public — which means all 32 personal messages. For this
project that is the worst of the three.

Netlify is deliberately not recommended: its site password protection is a Pro
feature (~$19/month) on accounts created after September 2025, so its free tier
would leave the page open to anyone.

`https://mremadian75.github.io/ta-yalda/` returns **404** and will keep doing so
until one of the above is done.

