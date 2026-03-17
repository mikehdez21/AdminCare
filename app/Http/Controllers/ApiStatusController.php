<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ApiStatusController extends Controller
{
    public function index()
    {
        // Generar la respuesta JSON para indicar que la API está funcionando
        $data = [
            'success' => true,
            'message' => 'La API Railway funciona correctamente.',
            'status_code' => Response::HTTP_OK,
        ];
        try {
            // Aquí podrías agregar lógica adicional que pueda lanzar excepciones
        } catch (\Exception $e) {
            $data = [
            'success' => false,
            'message' => 'Ocurrió un error: ' . $e->getMessage(),
            'status_code' => Response::HTTP_INTERNAL_SERVER_ERROR,
            ];
            return response()->json($data, Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        // Retornar la respuesta con código HTTP 200
        return response()->json($data, Response::HTTP_OK);
    }

    public function dbStatus()
    {
        try {
            // Fuerza apertura de conexión y valida consulta mínima.
            DB::connection()->getPdo();
            DB::select('SELECT 1');

            return response()->json([
                'success' => true,
                'message' => 'Conexión a base de datos OK.',
                'status_code' => Response::HTTP_OK,
            ], Response::HTTP_OK);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de conexión a base de datos.',
                'status_code' => Response::HTTP_INTERNAL_SERVER_ERROR,
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
