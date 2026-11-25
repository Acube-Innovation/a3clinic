<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Instructions;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;

#[Name("Dr. Riji's Health Care website")]
#[Version('1.0.0')]
#[Instructions(<<<'TXT'
Edits the LIVE website https://drrijishealthcare.com (a homeopathy clinic). Every write is visible to visitors immediately.
Workflow: list_content → get_content → update_record / update_section / create_record. Read before you write, and send list fields complete.
Media: files on the user's computer are uploaded with
  curl -sS -H "Authorization: Bearer $A3CLINIC_TOKEN" -F file=@<path> [-F watermark=1] https://drrijishealthcare.com/api/media
which returns {"path": "/uploads/…"}; public URLs can use upload_media_from_url. Then put the path into content.
Videos: YouTube link, or an uploaded MP4/WebM (≤30 MB; longer videos should go on YouTube).
Medical copy: no cure claims or guaranteed outcomes; patient before/after photos need consent and watermark=true; never name patients.
Mistakes: list_changes + revert_change undo any connector edit.
TXT)]
class SiteServer extends Server
{
    protected array $tools = [
        Tools\ListContent::class,
        Tools\GetContent::class,
        Tools\UpdateRecord::class,
        Tools\CreateRecord::class,
        Tools\UpdateSection::class,
        Tools\UploadMediaFromUrl::class,
        Tools\ListMedia::class,
        Tools\ListChanges::class,
        Tools\RevertChange::class,
    ];
}
