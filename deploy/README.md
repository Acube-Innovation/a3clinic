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

## Claude connector (edit content from Claude)

The site exposes an MCP server at `https://drrijishealthcare.com/mcp`, an
upload endpoint `POST /api/media`, and one-time upload pages (`/upload/…`).
Auth is Laravel Passport. Every connector edit is logged in `content_changes`
and can be undone with the `revert_change` tool.

**One-time server setup (done):** `php artisan passport:keys` created
`~/a3clinic/storage/oauth-{private,public}.key` (deploys never touch
`storage/`). If they are ever lost, regenerate them; every token and claude.ai
connection then has to be issued again.

### claude.ai, Claude desktop and mobile (OAuth sign-in)

Settings → Connectors → **Add custom connector** → URL
`https://drrijishealthcare.com/mcp` → Connect → sign in with the `/admin`
account → **Allow**. Only Claude redirect addresses may register as OAuth
clients (`config/mcp.php`). Files attached to a chat can't reach the site, so
Claude hands out an upload link (`create_upload_link`, valid 30 minutes) and
reads the uploaded paths back with `get_uploads`.

### Claude Code (personal token)

```bash
# on the server: create a token for a person (shown once)
ssh -i ~/.ssh/a3clinic.pem l2i8w8nye4gs@118.139.181.133 'cd ~/a3clinic && php artisan connector:token ratheesh'
#   --list to see tokens and OAuth connections, --revoke to remove a person's tokens

# on your machine, inside the repo: register it privately (stored in ~/.claude.json)
claude mcp add --scope local --transport http a3clinic-site https://drrijishealthcare.com/mcp \
  --header "Authorization: Bearer <token>"
```

The repo's `.mcp.json` also registers `a3clinic-site` using `${A3CLINIC_TOKEN}`
for anyone who prefers an environment variable (it must be set before VS Code
starts). Claude Code can also skip the token and sign in through the browser
like claude.ai: remove the header and use `/mcp` → Authenticate.

The `site-content` skill (`.claude/skills/site-content/SKILL.md`) tells
Claude how to upload local files and which fields hold images and videos.
Limits: images 10 MB, videos 30 MB (GoDaddy upload limit); longer videos go on
YouTube.
