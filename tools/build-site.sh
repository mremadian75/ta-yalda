#!/usr/bin/env bash
#
# Assemble the publishable site into _site/.
#
# Used by .github/workflows/pages.yml, and by any other static host:
#   Cloudflare Pages / Netlify / Vercel
#     build command    : bash tools/build-site.sh
#     output directory : _site
#
# Publishing _site rather than the repository root keeps README.md, tools/ and
# the test fixtures off the public site.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf _site
mkdir -p _site

cp index.html styles.css theme.css app.js data.js favicon.svg robots.txt _site/
cp -R assets _site/assets

# Fail loudly here rather than shipping a page that 404s on its own config/theme.
for f in index.html styles.css theme.css app.js data.js favicon.svg \
         assets/fonts/vazirmatn-arabic.woff2 assets/fonts/vazirmatn-latin.woff2; do
  [ -s "_site/$f" ] || { echo "::error::missing from _site: $f" >&2; exit 1; }
done

echo "Publishing:"
find _site -type f | sort
