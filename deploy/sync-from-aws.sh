#!/usr/bin/env bash
#
# Copy content from the old AWS Lightsail site to GoDaddy (via this machine).
#
#   deploy/sync-from-aws.sh           replace ALL content with the AWS copy, and
#                                     copy any new uploads (use before go-live)
#   deploy/sync-from-aws.sh --merge   only add AWS bookings/enquiries GoDaddy
#                                     lacks, plus new uploads (use after go-live)
#
set -euo pipefail

AWS="${AWS_HOST:-ubuntu@43.204.95.198}"
AWS_KEY="${AWS_KEY:-$HOME/.ssh/a3clinic.pem}"
GD="${DEPLOY_HOST:-l2i8w8nye4gs@118.139.181.133}"
GD_KEY="${DEPLOY_KEY:-$HOME/.ssh/a3clinic.pem}"
MODE="${1:-}"

AWS_SSH="ssh -i $AWS_KEY -o BatchMode=yes"
GD_SSH="ssh -i $GD_KEY -o IdentitiesOnly=yes -o BatchMode=yes"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "==> Dumping the AWS database"
TABLES=""
[[ "$MODE" == "--merge" ]] && TABLES="appointments appointment_files enquiries"
$AWS_SSH "$AWS" "sudo mysqldump --no-create-info --complete-insert --skip-extended-insert --skip-triggers \
    --single-transaction --ignore-table=a3clinic.documents a3clinic $TABLES" > "$WORK/dump.sql"
echo "    $(grep -c '^INSERT' "$WORK/dump.sql") rows"

echo "==> Copying new uploads (existing files are never deleted)"
mkdir -p "$WORK/uploads"
rsync -az -e "$AWS_SSH" "$AWS:/home/ubuntu/a3clinic/public/uploads/" "$WORK/uploads/"
rsync -az --ignore-existing -e "$GD_SSH" "$WORK/uploads/" "$GD:public_html/uploads/"

echo "==> Importing on GoDaddy"
rsync -az -e "$GD_SSH" "$WORK/dump.sql" "$GD:a3clinic/storage/app/private/sync.sql"
$GD_SSH "$GD" "cd ~/a3clinic && php artisan content:import storage/app/private/sync.sql $MODE && \
    { [[ '$MODE' == '--merge' ]] || php artisan db:seed --force --no-interaction >/dev/null; } && \
    rm storage/app/private/sync.sql && php artisan optimize >/dev/null"
