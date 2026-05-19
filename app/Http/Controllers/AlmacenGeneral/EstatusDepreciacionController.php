<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\AlmacenGeneral\EstatusDepreciacionAF;

class EstatusDepreciacionController extends Controller
{
    // Obtener todos los estatus de depreciación
    public function index()
    {
        $response = ["success" => false, "data" => [], "message" => ""];

        try {
            $estatus = EstatusDepreciacionAF::all([
                'id_estatus_depreciacion',
                'descripcion_estatus_depreciacion',
                'created_at',
                'updated_at'
            ]);

            if ($estatus->isEmpty()) {
                $response['message'] = 'No se encontraron estatus de depreciación.';
            } else {
                $response['success'] = true;
                $response['data'] = $estatus;
            }
        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener los estatus de depreciación: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }

    // Crear un nuevo estatus de depreciación
    public function store(Request $request)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        $validator = Validator::make($request->all(), [
            'descripcion_estatus_depreciacion' => 'required|string|max:255|unique:almacengeneral.tableRef_EstatusDepreciacionAF,descripcion_estatus_depreciacion',
        ]);

        if ($validator->fails()) {
            return response()->json(["error" => $validator->errors()], 422);
        }

        try {
            $input = $request->all();
            $estatus = EstatusDepreciacionAF::create($input);

            $response['success'] = true;
            $response['message'] = 'Estatus de depreciación registrado exitosamente!';
            $response['data'] = $estatus;
        } catch (\Exception $e) {
            $response['message'] = 'Error al crear el estatus de depreciación: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Actualizar un estatus de depreciación existente
    public function update(Request $request, $id)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $estatus = EstatusDepreciacionAF::findOrFail($id);
            $estatus->update($request->all());

            $response['success'] = true;
            $response['message'] = 'Estatus de depreciación actualizado exitosamente.';
            $response['data'] = $estatus;
        } catch (\Exception $e) {
            $response['message'] = 'Error al actualizar el estatus de depreciación: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar un estatus de depreciación
    public function destroy($id)
    {
        $response = ["success" => false, "message" => ""];

        try {
            EstatusDepreciacionAF::destroy($id);
            $response['success'] = true;
            $response['message'] = 'Estatus de depreciación eliminado exitosamente.';
            return response()->json($response, 200);
        } catch (\Exception $e) {
            $response['message'] = 'Error al eliminar el estatus de depreciación: ' . $e->getMessage();
            return response()->json($response, 500);
        }
    }
}
