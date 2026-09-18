<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>AdminCare</title>

    @if (app()->environment('local'))
        @viteReactRefresh
        @vite(['src/js/App.tsx'])
    @else
        <!-- Archivos compilados para produccion -->
        @php
            $manifestPath = public_path('build/manifest.json');
            if (file_exists($manifestPath)) {
                $manifest = json_decode(file_get_contents($manifestPath), true);
                $appEntry = $manifest['src/js/App.tsx'] ?? null;
                $appJs = $appEntry['file'] ?? null;
                $appCss = isset($appEntry['css']) && is_array($appEntry['css']) ? $appEntry['css'][0] : null;
            } else {
                $appJs = null;
                $appCss = null;
            }
            $appJsPath = $appJs && str_starts_with($appJs, 'build/') ? $appJs : ($appJs ? 'build/' . $appJs : null);
            $appCssPath = $appCss && str_starts_with($appCss, 'build/') ? $appCss : ($appCss ? 'build/' . $appCss : null);
        @endphp
        
        @if($appCssPath && file_exists(public_path($appCssPath)))
            <link rel="stylesheet" href="{{ asset($appCssPath) }}">
        @endif
        
        @if($appJsPath && file_exists(public_path($appJsPath)))
            <script type="module" src="{{ asset($appJsPath) }}"></script>
        @else
            <p style="color: red; text-align: center; padding: 20px; font-size: 26px;">
                    Error: Los archivos compilados no se encontraron. Ejecuta el build de <code>frontend</code>.
            </p>
        @endif
    @endif
</head>

<body>
    <div id="root"></div>
</body>

</html>
