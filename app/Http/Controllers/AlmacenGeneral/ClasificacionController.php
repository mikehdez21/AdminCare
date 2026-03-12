<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\AlmacenGeneral\Clasificaciones;


class ClasificacionController extends Controller
{
    // Obtener todas las clasificaciones
    public function index()
    {

        $response = ["success" => false, "data" => [], "message" => ""];


        try {

            $clasificaciones = Clasificaciones::all([
                'id_clasificacion',
                'nombre_clasificacion',
                'cuenta_contable',
                'estatus_activo',
                'created_at',
                'updated_at'

            ]);


            if ($clasificaciones->isEmpty()) {
                $response['message'] = 'No se encontraron clasificaciones.';
            } else {
                $response['success'] = true;
                $response['data'] = $clasificaciones;
            }
        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener las clasificaciones: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }


    // Crear una nueva clasificación
    public function store(Request $request)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        $validator = Validator::make($request->all(), [
            'nombre_clasificacion' => 'required|string|max:255',

        ]);

        if ($validator->fails()) {
            return response()->json(["error" => $validator->errors()], 422);
        }

        try {
            $input = $request->all();

            $clasificaciones = Clasificaciones::create($input);

            $response["success"] = true;
            $response['message'] = 'Clasificación registrada exitosamente!';
            $response['data'] = $clasificaciones;
        } catch (\Exception $e) {
            $response['message'] = 'Error al crear la clasificación: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Actualizar una clasificación existente
    public function update(Request $request, $id)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $clasificaciones = Clasificaciones::findOrFail($id);
            $clasificaciones->update($request->all());

            $response['success'] = true;
            $response['message'] = 'Clasificación actualizada exitosamente.';
            $response['data'] = $clasificaciones;
        } catch (\Exception $e) {
            $response['message'] = 'Error al actualizar la clasificación: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar un proveedor
    public function destroy($id)
    {
        $response = ["success" => false, "message" => ""];

        try {
            Clasificaciones::destroy($id);
            $response['success'] = true;
            $response['message'] = 'Clasificación eliminada exitosamente.';
            return response()->json($response, 200);
        } catch (\Exception $e) {
            $response['message'] = 'Error al eliminar la clasificación: ' . $e->getMessage();
            return response()->json($response, 500);
        }
    }
}
