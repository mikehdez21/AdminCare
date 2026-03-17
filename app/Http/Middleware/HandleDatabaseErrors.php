<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class HandleDatabaseErrors
{
    /**
     * Handle an incoming request and catch database errors.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            return $next($request);
        } catch (QueryException $e) {
            $errorId = (string) Str::uuid();
            $isDebug = (bool) config('app.debug');

            // Capturar errores específicos de base de datos
            $errorCode = $e->getCode();
            $errorMessage = $e->getMessage();
            
            // Log del error para debugging
            Log::error('Database error in middleware', [
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
                
                // Si es una solicitud AJAX/API, devolver JSON
                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json($payload, 500);
                }
                
                // Si no es API, redirigir o mostrar vista de error
                return response()->view('errors.database', [
                    'message' => $payload['message']
                ], 500);
            }
            
            // Otros errores de base de datos
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json($payload, 500);
            }
            
            return response()->view('errors.database', [
                'message' => $payload['message']
            ], 500);
            
        } catch (\Exception $e) {
            $errorId = (string) Str::uuid();
            $isDebug = (bool) config('app.debug');

            // Capturar cualquier otro error
            Log::error('General error in middleware', [
                'error_id' => $errorId,
                'message' => $e->getMessage(),
                'path' => $request->path(),
                'method' => $request->method(),
            ]);

            $payload = [
                'success' => false,
                'message' => 'Error interno del servidor. Contacta a Sistemas. Ref: ' . $errorId,
                'error_id' => $errorId,
            ];

            if ($isDebug) {
                $payload['details'] = $e->getMessage();
            }
            
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json($payload, 500);
            }
            
            return response()->view('errors.500', [
                'message' => $payload['message']
            ], 500);
        }
    }
}