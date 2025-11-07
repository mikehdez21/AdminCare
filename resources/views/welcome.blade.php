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
    @vite(['resources/js/App.tsx'])
    @else
    <!-- Incluye el archivo CSS compilado -->
    <link rel="stylesheet" href="{{ asset('build/assets/App-D1liSI8E.css') }}">
    <!-- Incluye el archivo JS compilado -->
    <script type="module" src="{{ asset('build/assets/App-ChwiVoqt.js') }}"></script>
    @endif
</head>

<body>
    <div id="root"></div>
</body>

</html>