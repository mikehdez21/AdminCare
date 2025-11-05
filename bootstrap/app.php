<?php

use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;



return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(append: [
            EnsureFrontendRequestsAreStateful::class, // Necesario para autenticación en frontend
            StartSession::class, // Para manejar sesiones
            SubstituteBindings::class, // Sustituir bindings de rutas
            EncryptCookies::class, // Encriptar cookies
            ShareErrorsFromSession::class, // Compartir errores desde la sesión
        ]);

        $middleware->web(append: [
            EnsureFrontendRequestsAreStateful::class, // Necesario para autenticación en frontend
            EncryptCookies::class, // Encriptar cookies
            ShareErrorsFromSession::class, // Compartir errores desde la sesión
            VerifyCsrfToken::class, // Verificación CSRF (Depende de la lógica de tu API)
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
