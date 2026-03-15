<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

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
}
