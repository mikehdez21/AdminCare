<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\HandleDatabaseErrors;
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
        // Configuracion oficial de Sanctum SPA para rutas API stateful.
        $middleware->statefulApi();

        $middleware->api(prepend: [
            HandleDatabaseErrors::class,
        ]);

        $middleware->web(prepend: [
            HandleDatabaseErrors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Manejar excepciones de base de datos a nivel global
        $exceptions->render(function (\Illuminate\Database\QueryException $e, $request) {
            $errorId = (string) Str::uuid();
            $isDebug = (bool) config('app.debug');
            $errorCode = $e->getCode();
            $errorMessage = $e->getMessage();
            
            // Log del error para debugging
            Log::error('Global database exception', [
                'error_id' => $errorId,
                'code' => $errorCode,
                'message' => $errorMessage,
                'path' => $request->path(),
                'method' => $request->method(),
            ]);

            $payload = [
                'success' => false,
                'message' => 'Error en base de datos. Contacta a Sistemas. Ref: ' . $errorId,
                'error_id' => $errorId,
                'error_code' => (string) $errorCode,
            ];

            if ($isDebug) {
                $payload['details'] = $errorMessage;
            }
            
            // Verificar si es un error de tabla no encontrada
            if ($errorCode == '42P01' || $errorCode == '1146' || 
                strpos($errorMessage, 'no existe la relación') !== false || 
                strpos($errorMessage, "doesn't exist") !== false ||
                strpos($errorMessage, 'sessions') !== false) {
                
                // Si es una solicitud específica de API, devolver JSON
                if ($request->is('api/*')) {
                    return response()->json($payload, 500);
                }
                
                // Si es solicitud AJAX (desde frontend React), devolver JSON
                if ($request->expectsJson() || $request->ajax()) {
                    return response()->json($payload, 500);
                }
                
                // Para navegadores normales, servir la aplicación React
                // que luego manejará el error via API
                return response()->view('welcome');
            }
            
            // Otros errores de base de datos
            if ($request->is('api/*') || $request->expectsJson() || $request->ajax()) {
                return response()->json($payload, 500);
            }
            
            // Para navegadores, servir la aplicación React
            return response()->view('welcome');
        });
    })->create();
