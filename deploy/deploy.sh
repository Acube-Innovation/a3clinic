#!/usr/bin/env bash
#
# Deploy the committed `laravel` branch to the GoDaddy host.
#
#   deploy/deploy.sh            build, upload, install, migrate, publish
#
# Ships exactly what is committed (git archive of HEAD), so uncommitted
# local changes never reach the server. Layout on the host (README.md):
#   ~/a3clinic      the application (this repo), with its .env and storage/
#   ~/public_html   the web root: public/ files, build assets, uploads/
#
set -euo pipefail

HOST="${DEPLOY_HOST:-l2i8w8nye4gs@118.139.181.133}"
KEY="${DEPLOY_KEY:-$HOME/.ssh/a3clinic.pem}"
APP_DIR="a3clinic"
WEB_DIR="public_html"

REPO="$(cd "$(dirname "$0")/.." && pwd)"
SSH=(ssh -i "$KEY" -o IdentitiesOnly=yes -o BatchMode=yes)
remote() { "${SSH[@]}" "$HOST" "$@"; }

cd "$REPO"
if [[ -n "$(git status --porcelain)" ]]; then
    echo "Uncommitted changes — commit them first (deploys ship HEAD only)." >&2
    exit 1
fi

echo "==> Building front-end assets"
npm run build >/dev/null

echo "==> Staging $(git rev-parse --short HEAD)"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
git archive HEAD | tar -x -C "$STAGE"
cp -r public/build "$STAGE/public/build"
git rev-parse HEAD > "$STAGE/REVISION"

echo "==> Uploading application to ~/$APP_DIR"
rsync -az --delete -e "${SSH[*]}" \
    --exclude '/.env' --exclude '/storage/' --exclude '/vendor/' --exclude '/bootstrap/cache/*.php' \
    "$STAGE/" "$HOST:$APP_DIR/"

echo "==> Installing, migrating and publishing on the server"
remote bash -s <<EOF
set -euo pipefail
cd ~/$APP_DIR
mkdir -p storage/app/private storage/app/public storage/framework/{cache/data,sessions,views} storage/logs bootstrap/cache
mkdir -p ~/$WEB_DIR/uploads

composer install --no-dev --optimize-autoloader --no-interaction --no-progress --quiet

# Web root: public files and fresh build assets; uploads are never touched.
rsync -a --exclude '/index.php' --exclude '/.htaccess' --exclude '/uploads/' --exclude '/build/' public/ ~/$WEB_DIR/
rsync -a --delete public/build/ ~/$WEB_DIR/build/
cp deploy/public_html/index.php deploy/public_html/.htaccess ~/$WEB_DIR/

php artisan migrate --force --no-interaction
php artisan db:seed --force --no-interaction
php artisan optimize
php artisan filament:optimize >/dev/null
chmod 600 .env
echo "Deployed \$(cut -c1-7 REVISION)"
EOF
