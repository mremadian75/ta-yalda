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

The repository is **private**, and nothing in it contains a booking reference,
e-ticket number, passport data or payment details. Please keep it that way.

The page sends `noindex, nofollow, noarchive, noimageindex` and `robots.txt`
disallows everything.

**That is not privacy, and the URL is not a secret either.** `noindex` only asks
well-behaved crawlers to stay away. More importantly: a GitHub Pages site is
served unauthenticated to the whole internet even when the repository behind it
is private — repo visibility does not propagate to the published page, and
access-controlled Pages requires GitHub Enterprise Cloud.

And the address is not secret: it is derived mechanically from the account and
repository name (`mremadian75` + `ta-yalda` → `mremadian75.github.io/ta-yalda/`),
so it can be guessed, not just leaked.

Practically: write the daily messages as though a stranger *could* read them.
Nothing in `data.js` should be something you would mind being seen. If you want
the site genuinely private, it needs a host that supports password protection
(Netlify and Cloudflare Pages both do on free tiers) rather than GitHub Pages.

---

## Deployment

`.github/workflows/pages.yml` deploys on every push to `main`, using GitHub's
official Pages actions. It assembles a clean `_site/` folder first, so only the
page itself is published — not this README or `tools/`.

Note it triggers on **`main`**. Work on a feature branch does not deploy until
it is merged.

The previous deploy failed at `actions/configure-pages` with *"Get Pages site
failed … Not Found"*. That was not a broken action version — Pages had simply
never been created for this repository, and the step only *reads* the config
unless you tell it otherwise. It now runs with `enablement: true`, so the
workflow creates the Pages site itself.

**One caveat that is out of the workflow's hands:** GitHub Pages on a *private*
repository requires a paid plan (Pro, Team or Enterprise). On the Free plan the
step will still fail, and the options are to upgrade, to make the repository
public, or to host the folder somewhere else — it is plain static files, so
Netlify or Cloudflare Pages would serve it from the private repo just as well.
