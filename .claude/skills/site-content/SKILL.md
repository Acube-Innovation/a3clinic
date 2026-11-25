---
name: site-content
description: Update the live drrijishealthcare.com website through the a3clinic-site connector: upload images and videos from this computer, change text on conditions, products, blog posts, testimonials, FAQs, doctor/clinic info and the home-page videos. Use whenever the user asks to change, add or remove content, photos or videos on the clinic website.
---

# Editing the live clinic website

The `a3clinic-site` MCP connector edits **https://drrijishealthcare.com** directly. Every write is live for visitors at once, and every write can be undone.

Needs the env var `A3CLINIC_TOKEN` (ask the user if `echo ${A3CLINIC_TOKEN:+set}` prints nothing; tokens come from `php artisan connector:token <name>` on the server).

## Workflow

1. `list_content` → find the section / slug.
2. `get_content` → read the current record or section. **Always read before writing.**
3. Upload media if needed (below), then write:
   - `update_record` for one condition, product or blog post (send only the fields that change; list fields must be sent complete).
   - `create_record` for a new one (`category` required).
   - `update_section` for testimonials, faqs, gallery, videos (send the **complete** list as `items`) or doctor, clinic, consultation (send changed keys as `fields`).
4. Give the user the page URL to check (from `list_content`).
5. If something is wrong: `list_changes` then `revert_change`.

## Uploading files from this computer

```bash
curl -sS -H "Authorization: Bearer $A3CLINIC_TOKEN" \
  -F file=@"/path/to/photo.jpg" \
  https://drrijishealthcare.com/api/media
# → {"path":"/uploads/<uuid>.jpg","type":"image","bytes":…,"url":"https://…"}
```

- Add `-F watermark=1` for **patient before/after photos** (bakes in the clinic watermark).
- Images: JPEG, PNG or WebP, up to 10 MB (wider than 2000 px is scaled down).
- Videos: MP4 or WebM, up to **30 MB**. Larger videos → upload to the clinic's YouTube channel and use the YouTube link instead. If `ffmpeg` is available locally and the user agrees, a large MP4 can be compressed first: `ffmpeg -i in.mp4 -vf "scale=-2:720" -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 96k -movflags +faststart out.mp4`.
- A file already online: `upload_media_from_url` (public https URL).
- No token / curl not possible (or the user is on a phone): `create_upload_link` gives a 30-minute upload page; send the user the link, then `get_uploads` with its id.
- Then put the returned `path` into content.

## Where images and videos go

| Content | Field |
|---|---|
| Condition | `heroImage` (page header), `introImage` (beside intro), `video`, `results[]` = `{before, after, label, note}` (watermarked) |
| Product | `image`, `video` |
| Blog post | `image` (cover); body blocks `{"type":"paragraph"|"heading"|"callout","text":…}`, `{"type":"list","items":[…]}`, `{"type":"video","text":"<YouTube link or /uploads/videos/….mp4>"}` |
| Home page videos | section `videos`: `[{"title":…, "video":…}]` (section hidden when empty) |
| About page photos | section `gallery`: `[{"image":…, "label":…}]` |

Video values: a YouTube link (any form: watch, youtu.be, shorts) or `/uploads/videos/<file>.mp4`.

## Rules for medical content

- No cure claims, no guaranteed outcomes; keep wording indicative ("may help", "typically").
- Patient photos/videos only with written consent; never name patients; before/after photos always `watermark=1`.
- Products: prices are in **paise** (₹450 → `45000`); keep the `caution` text intact.
- Confirm with the user before deleting items (removing them from a list) or making bulk changes.
