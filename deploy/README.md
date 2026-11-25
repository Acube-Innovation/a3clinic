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

## Claude connector (edit content from Claude Code)

The site exposes an MCP server at `https://drrijishealthcare.com/mcp` and an
upload endpoint `POST /api/media`, both protected by personal access tokens.
Every connector edit is logged in `content_changes` and can be undone with the
`revert_change` tool.

```bash
# on the server: create a token for a person (shown once)
ssh -i ~/.ssh/a3clinic.pem l2i8w8nye4gs@118.139.181.133 'cd ~/a3clinic && php artisan connector:token ratheesh'
#   --list to see tokens, --revoke to remove a person's tokens

# on your machine: put the token in your shell profile
export A3CLINIC_TOKEN='<token>'
```

The repo's `.mcp.json` registers the connector as `a3clinic-site` for Claude
Code opened in this repo (approve it on first use; check with `/mcp`). To use
it from any folder instead:

```bash
claude mcp add --scope user --transport http a3clinic-site https://drrijishealthcare.com/mcp \
  --header "Authorization: Bearer $A3CLINIC_TOKEN"
```

The `site-content` skill (`.claude/skills/site-content/SKILL.md`) tells
Claude how to upload local files and which fields hold images and videos.
Limits: images 10 MB, videos 30 MB (GoDaddy upload limit); longer videos go on
YouTube.
