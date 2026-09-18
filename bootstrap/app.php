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
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use App\Http\Middleware\HandleDatabaseErrors;
use App\Exceptions\DemoQuotaExceeded;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;



return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
        ]);

        $middleware->api(append: [
            HandleDatabaseErrors::class, // Manejar errores de base de datos ANTES de las sesiones
            EnsureFrontendRequestsAreStateful::class, // Necesario para autenticación en frontend
            StartSession::class, // Para manejar sesiones
            SubstituteBindings::class, // Sustituir bindings de rutas
            EncryptCookies::class, // Encriptar cookies
            ShareErrorsFromSession::class, // Compartir errores desde la sesión
        ]);

        $middleware->web(append: [
            HandleDatabaseErrors::class, // Manejar errores de base de datos ANTES de las sesiones
            EnsureFrontendRequestsAreStateful::class, // Necesario para autenticación en frontend
            EncryptCookies::class, // Encriptar cookies
            ShareErrorsFromSession::class, // Compartir errores desde la sesión
            VerifyCsrfToken::class, // Verificación CSRF (Depende de la lógica de tu API)
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->dontReport(QueryException::class);

        // The public QR endpoint keeps Laravel's 60/minute throttle, but its
        // rate-limit response must use the same API envelope as 200/404.
        // Scope this to the named route so other endpoints retain Laravel's
        // default throttling response.
        $exceptions->render(function (ThrottleRequestsException $e, $request) {
            if (! $request->routeIs('public.qraf.resolve')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
                'data' => null,
            ], 429, $e->getHeaders());
        });

        $exceptions->render(function (DemoQuotaExceeded $e, $request) {
            return response()->json([
                'success' => false,
                'code' => 'DEMO_QUOTA_EXCEEDED',
                'message' => 'La demo permite como máximo 100 unidades de negocio.',
                'used' => $e->used,
                'requested' => $e->requested,
                'limit' => $e->limit,
            ], 422);
        });

        // Manejar excepciones de base de datos a nivel global
        $exceptions->render(function (QueryException $e, $request) {
            $errorCode = $e->getCode();
            $errorId = (string) Str::uuid();

            Log::error('Global database exception', [
                'error_id' => $errorId,
                'exception' => get_class($e),
                'path' => $request->path(),
                'method' => $request->method(),
                'code' => (string) $errorCode,
            ]);

            // Verificar si es un error de tabla no encontrada
            if (
                $errorCode == '42P01' || $errorCode == '1146' ||
                in_array((string) $errorCode, ['42P01', '1146', '23000'], true)
            ) {

                // Si es una solicitud específica de API, devolver JSON
                if ($request->is('api/*')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Error en base de datos. Contacta a Sistemas.',
                        'error_id' => $errorId,
                    ], 500);
                }

                // Si es solicitud AJAX (desde frontend React), devolver JSON
                if ($request->expectsJson() || $request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Error en base de datos. Contacta a Sistemas.',
                        'error_id' => $errorId,
                    ], 500);
                }

                // Para navegadores normales, servir la aplicación React
                // que luego manejará el error via API
                return response()->view('welcome');
            }

            // Otros errores de base de datos
            if ($request->is('api/*') || $request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de conexión a la base de datos. Intenta más tarde.',
                    'error_id' => $errorId,
                ], 500);
            }

            // Para navegadores, servir la aplicación React
            return response()->view('welcome');
        });
    })->create();
