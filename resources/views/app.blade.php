<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full antialiased" data-scroll-behavior="smooth">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#044B4D">
        <link rel="icon" href="/favicon.ico">

        <title inertia>{{ $seo['fullTitle'] ?? config('app.name') }}</title>

        @isset($seo)
            <meta name="description" content="{{ $seo['description'] }}">
            <meta name="application-name" content="{{ \App\Support\Seo::SITE_NAME }}">
            <meta name="author" content="Dr. Riji Rasheed">
            <meta name="creator" content="{{ \App\Support\Seo::SITE_NAME }}">
            <meta name="robots" content="{{ $seo['robots'] }}">
            <link rel="canonical" href="{{ $seo['canonical'] }}">
            @foreach ($seo['alternates'] as $hreflang => $href)
                <link rel="alternate" hreflang="{{ $hreflang }}" href="{{ $href }}">
            @endforeach
            <meta property="og:title" content="{{ $seo['title'] }}">
            <meta property="og:description" content="{{ $seo['description'] }}">
            <meta property="og:site_name" content="{{ \App\Support\Seo::SITE_NAME }}">
            @foreach ($seo['og'] as $property => $content)
                <meta property="{{ $property === 'published_time' ? 'article:published_time' : "og:{$property}" }}" content="{{ $content }}">
            @endforeach
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="630">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="{{ $seo['title'] }}">
            <meta name="twitter:description" content="{{ $seo['description'] }}">
            <meta name="twitter:image" content="{{ $seo['og']['image'] }}">
        @endisset

        @foreach ($schema ?? [] as $node)
            <script type="application/ld+json">{!! json_encode($node, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) !!}</script>
        @endforeach

        {{-- Scroll-reveal wrappers render at opacity:0 and animate in with JS; content must never depend on that. --}}
        <noscript><style>[data-reveal]{opacity:1!important;transform:none!important}</style></noscript>

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="flex min-h-full flex-col bg-white">
        @inertia
    </body>
</html>
