@extends('connector.layout')

@section('title', 'Upload photos & videos')

@section('styles')
    .drop { display: block; border: 2px dashed #b9cfcd; border-radius: 18px; padding: 28px 16px; text-align: center; cursor: pointer; background: #fafcfc; margin: 6px 0 16px; }
    .drop:hover, .drop.over { border-color: var(--teal); background: var(--teal-50); }
    .drop strong { display: block; color: var(--teal); font-size: 17px; margin-bottom: 4px; }
    .drop input { display: none; }
    .file { border: 1px solid var(--line); border-radius: 14px; padding: 10px 12px; margin-bottom: 8px; font-size: 14px; }
    .file .top { display: flex; justify-content: space-between; gap: 10px; }
    .file .name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bar { height: 6px; border-radius: 6px; background: #e6eeee; margin-top: 8px; overflow: hidden; }
    .bar i { display: block; height: 100%; width: 0; background: var(--olive); transition: width .2s; }
    .ok { color: var(--olive); font-weight: 600; }
    .err { color: #b42318; font-weight: 600; }
    .done { display: none; margin-top: 14px; }
@endsection

@section('content')
    @if (! $link->isOpen())
        <h1>This upload link has expired</h1>
        <p>Upload links work for {{ \App\Models\UploadLink::LIFETIME_MINUTES }} minutes. Go back to Claude and ask for a new one.</p>
    @else
        <h1>Upload photos &amp; videos</h1>
        <p>Files you upload here go to drrijishealthcare.com for Claude to place on the site.
            @if ($link->purpose) <br><strong>For:</strong> {{ $link->purpose }} @endif
        </p>
        @if ($link->watermark)
            <p class="note">Photos uploaded here get the clinic watermark added automatically (before/after photos).</p>
        @endif

        <label class="drop" id="drop">
            <strong>Choose files</strong>
            <span class="muted">or drop them here · photos JPG/PNG/WebP up to 10 MB · videos MP4/WebM up to 30 MB</span>
            <input type="file" id="files" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/webm">
        </label>

        <div id="list"></div>

        <div class="done note" id="done">All done. Go back to Claude and say <strong>“uploaded”</strong>; Claude will place the files.</div>
        <p class="muted" style="margin-top:14px">This link expires at {{ $link->expires_at->timezone('Asia/Kolkata')->format('g:i A') }} (IST).</p>
    @endif
@endsection

@section('scripts')
    @if ($link->isOpen())
    <script>
        const uploadUrl = @json($link->uploadUrl());
        const csrf = @json(csrf_token());
        const list = document.getElementById('list');
        const drop = document.getElementById('drop');
        let pending = 0;

        function row(file) {
            const el = document.createElement('div');
            el.className = 'file';
            el.innerHTML = '<div class="top"><span class="name"></span><span class="status muted">waiting…</span></div><div class="bar"><i></i></div>';
            el.querySelector('.name').textContent = file.name + ' · ' + (file.size / 1048576).toFixed(1) + ' MB';
            list.appendChild(el);
            return el;
        }

        function upload(file) {
            const el = row(file), status = el.querySelector('.status'), bar = el.querySelector('.bar i');
            const body = new FormData();
            body.append('file', file);
            const xhr = new XMLHttpRequest();
            xhr.open('POST', uploadUrl);
            xhr.setRequestHeader('X-CSRF-TOKEN', csrf);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.upload.onprogress = (e) => { if (e.lengthComputable) { bar.style.width = (e.loaded / e.total * 100) + '%'; status.textContent = Math.round(e.loaded / e.total * 100) + '%'; } };
            xhr.onload = () => {
                let msg = 'Upload failed';
                try { msg = JSON.parse(xhr.responseText).message || msg; } catch (e) {}
                if (xhr.status === 201) { status.className = 'status ok'; status.textContent = 'Uploaded ✓'; bar.style.width = '100%'; }
                else { status.className = 'status err'; status.textContent = xhr.status === 413 ? 'Too large' : msg; }
                if (--pending === 0) document.getElementById('done').style.display = 'block';
            };
            xhr.onerror = () => { status.className = 'status err'; status.textContent = 'Network error, try again'; if (--pending === 0) document.getElementById('done').style.display = 'block'; };
            pending++;
            xhr.send(body);
        }

        document.getElementById('files').addEventListener('change', (e) => { [...e.target.files].forEach(upload); e.target.value = ''; });
        ['dragover', 'dragenter'].forEach(t => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); }));
        ['dragleave', 'drop'].forEach(t => drop.addEventListener(t, () => drop.classList.remove('over')));
        drop.addEventListener('drop', (e) => { e.preventDefault(); [...e.dataTransfer.files].forEach(upload); });
    </script>
    @endif
@endsection
