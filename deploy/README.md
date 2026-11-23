# Deploying to GoDaddy (Web Hosting Starter, cPanel)

The site runs on PHP 8.3 + MariaDB on a shared cPanel account. There is no
Node on the host: front-end assets are built locally and uploaded.

## Layout on the host

| Path | What |
|---|---|
| `~/a3clinic` | The application (this repo's `laravel` branch), its `.env` and `storage/` |
| `~/public_html` | The web root: `index.php` + `.htaccess` from `deploy/public_html/`, the files from `public/`, Vite `build/`, and `uploads/` (admin uploads, never overwritten by a deploy) |
| `~/backups` | Nightly database dumps and uploads archives (14 kept) |

`bootstrap/app.php` points Laravel's public path at `~/public_html` when it
finds `~/public_html/index.php`, so `public_path()` (uploads, watermarking)
resolves to the web root on the host and to `public/` everywhere else.

## Deploying

```bash
deploy/deploy.sh
```

Requires SSH key access (`~/.ssh/a3clinic.pem`) and a clean, committed tree.
It builds assets, uploads the committed code, runs `composer install`,
publishes `public/` into the web root, migrates, seeds (idempotent: fills
only unsaved content sections and creates the admin once), and caches
config/routes/views.

## One-time setup (already done)

- Database `l2i8w8nye4gs_a3clinic`, user `l2i8w8nye4gs_web` (cPanel → MySQL).
- `~/a3clinic/.env` with production settings (mode 600). After HTTPS is
  live, `SESSION_SECURE_COOKIE=true`.
- Cron (cPanel → Cron Jobs): `* * * * * cd ~/a3clinic && php artisan schedule:run >/dev/null 2>&1`

## Content sync from the old AWS site

```bash
deploy/sync-from-aws.sh           # replace all content with the AWS copy (before go-live)
deploy/sync-from-aws.sh --merge   # only add AWS bookings/enquiries missing here (after go-live)
```

Both copy new uploads too (never deleting any). Under the hood this is
`php artisan content:import <dump> [--merge]` with a data-only `mysqldump`
of the old database.
