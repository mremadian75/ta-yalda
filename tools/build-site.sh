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

# The source stays modular for easier editing. The deployed bundle gets the
# newest visual polish and daily media layer without changing the stable app
# architecture.
cat personal-polish.css >> _site/theme.css
cat v7-handwritten-cats.css >> _site/theme.css
cat daily-media.js >> _site/app.js
cat site-enhancements.js >> _site/app.js
cat v7-cats.js >> _site/app.js

# Bust older cached assets on phones that already opened the site.
sed -i -E 's/theme\.css\?v=[0-9]+/theme.css?v=7/g' _site/data.js
sed -i 's#app.js</script>#app.js?v=7</script>#g' _site/index.html

# Fail loudly rather than shipping a page that 404s on its own config/theme/media.
for f in index.html styles.css theme.css app.js data.js favicon.svg \
         assets/fonts/vazirmatn-arabic.woff2 assets/fonts/vazirmatn-latin.woff2 \
         assets/loops/01.mp4 assets/loops/02.mp4 assets/loops/03.mp4 assets/loops/04.mp4 \
         assets/loops/05.mp4 assets/loops/06.mp4 assets/loops/07.mp4 assets/loops/08.mp4 \
         assets/loops/09.mp4 assets/loops/10.mp4 assets/loops/11.mp4 assets/loops/12.mp4; do
  [ -s "_site/$f" ] || { echo "::error::missing from _site: $f" >&2; exit 1; }
done

node --check _site/app.js

echo "Publishing:"
find _site -type f | sort
