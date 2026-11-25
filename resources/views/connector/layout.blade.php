<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>@yield('title') · Dr. Riji's Health Care</title>
    <style>
        :root { --teal: #044b4d; --teal-50: #eef6f5; --olive: #6f8a2c; --ink: #1d2b2c; --muted: #5b6b6c; --line: #dfe7e6; }
        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100vh; font: 16px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: var(--ink); background: #f4f7f7; display: grid; place-items: center; padding: 24px 16px; }
        .card { width: 100%; max-width: 520px; background: #fff; border: 1px solid var(--line); border-radius: 24px; padding: 32px 28px; box-shadow: 0 10px 40px rgba(4, 75, 77, .08); }
        .brand { display: flex; align-items: center; gap: 10px; color: var(--teal); font-weight: 700; margin-bottom: 22px; }
        .brand span { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 10px; background: var(--teal); color: #fff; font-size: 15px; }
        h1 { font: 600 26px/1.2 Georgia, "Times New Roman", serif; color: var(--teal); margin: 0 0 10px; }
        p { margin: 0 0 14px; color: var(--muted); }
        ul { margin: 0 0 18px; padding-left: 20px; color: var(--ink); }
        li { margin-bottom: 6px; }
        .btn { display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 999px; padding: 12px 22px; font: 600 15px system-ui, sans-serif; cursor: pointer; text-decoration: none; }
        .btn-primary { background: var(--teal); color: #fff; }
        .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--line); }
        .row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
        .note { font-size: 13px; background: var(--teal-50); border-radius: 12px; padding: 10px 12px; color: var(--teal); }
        .muted { font-size: 13px; color: var(--muted); }
        @yield('styles')
    </style>
</head>
<body>
    <main class="card">
        <div class="brand"><span>R</span> Dr. Riji's Health Care</div>
        @yield('content')
    </main>
    @yield('scripts')
</body>
</html>
