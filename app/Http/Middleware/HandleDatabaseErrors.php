<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;

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
            // Capturar errores específicos de base de datos
            $errorCode = $e->getCode();
            $errorMessage = $e->getMessage();
            
            // Log del error para debugging
            Log::error('Database error in middleware: ' . $errorMessage);
            
            // Verificar si es un error de tabla no encontrada
            if ($errorCode == '42P01' || $errorCode == '1146' || 
                strpos($errorMessage, 'no existe la relación') !== false || 
                strpos($errorMessage, "doesn't exist") !== false ||
                strpos($errorMessage, 'sessions') !== false) {
                
                // Si es una solicitud AJAX/API, devolver JSON
                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Error en base de datos. Contacta a Sistemas.'
                    ], 500);
                }
                
                // Si no es API, redirigir o mostrar vista de error
                return response()->view('errors.database', [
                    'message' => 'Error en base de datos. Contacta a Sistemas.'
                ], 500);
            }
            
            // Otros errores de base de datos
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de conexión a la base de datos. Intenta más tarde.'
                ], 500);
            }
            
            return response()->view('errors.database', [
                'message' => 'Error de conexión a la base de datos. Intenta más tarde.'
            ], 500);
            
        } catch (\Exception $e) {
            // Capturar cualquier otro error
            Log::error('General error in middleware: ' . $e->getMessage());
            
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error interno del servidor. Contacta a Sistemas.'
                ], 500);
            }
            
            return response()->view('errors.500', [
                'message' => 'Error interno del servidor. Contacta a Sistemas.'
            ], 500);
        }
    }
}