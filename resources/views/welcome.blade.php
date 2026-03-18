<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="./img/logo/design3Color_x512.png" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>PRUEBAS - Hospital San Serafin</title>

    @if (app()->environment('local'))
        @viteReactRefresh
        @vite(['frontend/src/js/App.tsx'])
    @else
        <!-- Archivos compilados para producciÃ³n -->
        @php
            $manifestPath = public_path('build/manifest.json');
            if (file_exists($manifestPath)) {
                $manifest = json_decode(file_get_contents($manifestPath), true);
                $appEntry = $manifest['frontend/src/js/App.tsx'] ?? null;
                $appJs = $appEntry['file'] ?? null;
                $appCss = isset($appEntry['css']) && is_array($appEntry['css']) ? $appEntry['css'][0] : null;
            } else {
                $appJs = null;
                $appCss = null;
            }
        @endphp
        
        @if($appCss && file_exists(public_path('build/' . $appCss)))
            <link rel="stylesheet" href="{{ asset('build/' . $appCss) }}">
        @endif
        
        @if($appJs && file_exists(public_path('build/' . $appJs)))
            <script type="module" src="{{ asset('build/' . $appJs) }}"></script>
        @else
            <p style="color: red; text-align: center; padding: 20px; font-size: 26px;">
                Error: Los archivos compilados no se encontraron. Por favor ejecuta: <code>pnpm run build</code>
            </p>
        @endif
    @endif
</head>

<body>
    <div id="root"></div>
</body>

</html>s