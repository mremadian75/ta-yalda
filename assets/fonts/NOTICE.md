# Bundled fonts

All fonts here are licensed under the SIL Open Font License 1.1 (see `OFL.txt`)
and are self-hosted on purpose: the site must not depend on fonts.googleapis.com,
which can be slow or unreachable from Iran.

| File | Family | Source |
|---|---|---|
| `vazirmatn-arabic.woff2`, `vazirmatn-latin.woff2` | Vazirmatn (variable, 200–800) | https://github.com/rastikerdar/vazirmatn |
| `dmmono-400-latin.woff2`, `dmmono-500-latin.woff2` | DM Mono | https://github.com/googlefonts/dm-mono |
| `instrumentserif-latin.woff2` | Instrument Serif | https://github.com/Instrument/instrument-serif |

Copyright 2015 The Vazirmatn Project Authors.
Copyright 2020 The DM Mono Project Authors.
Copyright 2023 The Instrument Serif Project Authors.

## IRANSans Handwritten

`styles.css` declares an `@font-face` for `IRANSansHandwritten` pointing at
`assets/fonts/IRANSansHandwritten.woff2` (and `.woff`). That font is **proprietary
and is deliberately not bundled here.** If you own a licence, drop your file in
this folder under that name and every display line upgrades automatically. Until
then the display face falls back to Vazirmatn at a light weight, which is what the
current design is tuned for — the page does not look broken without it.
