# تا یلدا

A small private countdown microsite for Mahan + Yalda.

**Countdown target:** Yalda's scheduled arrival in Istanbul — **14 October 2026, 10:45 (Europe/Istanbul)**.

## Included
- Live countdown to Istanbul arrival
- Madrid → Istanbul ← Sari route with two interactive cats
- 32 Persian daily messages from 13 Sep through 14 Oct
- Daily unlockable notes stored locally in the browser
- Daily song rotation + 30-second preview when iTunes provides one
- Live clocks for Madrid, Sari, and Istanbul
- Live weather + sunset via Open-Meteo (no API key)
- Cat-secret Easter eggs
- Final-week, final-24-hours, and arrival states
- Responsive layout, keyboard focus states, and reduced-motion support
- GitHub Pages deployment workflow

## Privacy
The site intentionally does **not** show the booking reference or e-ticket number.

The page contains `noindex,nofollow` and `robots.txt` blocks crawlers, but any public Pages URL can still be opened by someone who has the link.

## Optional Persian handwritten font
The stylesheet looks for:

`assets/IRANSansHandwritten.woff2`

Add your own licensed copy there if desired. Without it, the site falls back to Vazirmatn.

## GitHub Pages
The repo contains `.github/workflows/pages.yml` using GitHub's official Pages actions.

One-time setting if Pages is not enabled yet:

**Settings → Pages → Build and deployment → Source → GitHub Actions**

After that, every push to `main` republishes automatically.
