<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\AlmacenGeneral\EstatusActivosFijos;

class EstatusAFController extends Controller
{
    // Obtener todos los estatus de activos fijos
    public function index()
    {
        $response = ["success" => false, "data" => [], "message" => ""];

        try {
            $estatus = EstatusActivosFijos::all([
                'id_estatusaf',
                'descripcion_estatusaf',
                'created_at',
                'updated_at'
            ]);

            if ($estatus->isEmpty()) {
                $response['message'] = 'No se encontraron estatus de activos fijos.';
            } else {
                $response['success'] = true;
                $response['data'] = $estatus;
            }
        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener los estatus de activos fijos: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }

    // Crear un nuevo estatus de activos fijos
    public function store(Request $request)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        $validator = Validator::make($request->all(), [
            'descripcion_estatusaf' => 'required|string|max:255|unique:almacengeneral.tableRef_EstatusAF,descripcion_estatusaf',
        ]);

        if ($validator->fails()) {
            return response()->json(["error" => $validator->errors()], 422);
        }

        try {
            $input = $request->all();
            $estatus = EstatusActivosFijos::create($input);

            $response['success'] = true;
            $response['message'] = 'Estatus de activos fijos registrado exitosamente!';
            $response['data'] = $estatus;
        } catch (\Exception $e) {
            $response['message'] = 'Error al crear el estatus de activos fijos: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Actualizar un estatus de activos fijos existente
    public function update(Request $request, $id)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $estatus = EstatusActivosFijos::findOrFail($id);
            $estatus->update($request->all());

            $response['success'] = true;
            $response['message'] = 'Estatus de activos fijos actualizado exitosamente.';
            $response['data'] = $estatus;
        } catch (\Exception $e) {
            $response['message'] = 'Error al actualizar el estatus de activos fijos: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar un estatus de activos fijos
    public function destroy($id)
    {
        $response = ["success" => false, "message" => ""];

        try {
            EstatusActivosFijos::destroy($id);
            $response['success'] = true;
            $response['message'] = 'Estatus de activos fijos eliminado exitosamente.';
            return response()->json($response, 200);
        } catch (\Exception $e) {
            $response['message'] = 'Error al eliminar el estatus de activos fijos: ' . $e->getMessage();
            return response()->json($response, 500);
        }
    }
}
