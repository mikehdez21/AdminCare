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
            'message' => 'La API está funcionando correctamente.',
            'status_code' => Response::HTTP_OK,
        ];

        // Retornar la respuesta con código HTTP 200
        return response()->json($data, Response::HTTP_OK);
    }
}
