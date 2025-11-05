<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AlmacenGeneral\ActivosFijos;

class ActivosFijosController extends Controller
{
    // Obtener todas los activos fijos
    public function index()
    {
        $response = ["success" => false, "data" => [], "message" => ""];

        try {
            $activos = ActivosFijos::all();

            if ($activos->isEmpty()) {
                $response['message'] = 'No se encontraron activos fijos.';
            } else {
                $response['success'] = true;
                $response['data'] = $activos;
            }
        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener los activos fijos: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }

    // Crear un nuevo activo fijo
    public function store(Request $request)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $validatedData = $request->validate([
                'codigo_unico' => 'required|string|max:255|unique:almacengeneral.tableAF_ActivosFijos,codigo_unico',
                'id_clasificacion' => 'required|integer',
                'nombre_af' => 'required|string|max:255',
                'descripcion_af' => 'nullable|string',
                'fecha_adquisicion_af' => 'required|date',
                'costo_adquisicion_af' => 'required|numeric',
                'vida_util_meses' => 'nullable|integer',
                'valor_residual' => 'nullable|numeric',
                'id_estado_af' => 'required|integer',
            ]);

            $activo = ActivosFijos::create($validatedData);

            $response['success'] = true;
            $response['message'] = 'Activo fijo creado exitosamente.';
            $response['data'] = $activo;
        } catch (\Illuminate\Validation\ValidationException $e) {
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            $response['message'] = 'Error al crear el activo fijo: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Actualizar un activo fijo
    public function update(Request $request, $id)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $activo = ActivosFijos::findOrFail($id);

            $validatedData = $request->validate([
                'codigo_unico' => 'required|string|max:255|unique:almacengeneral.tableAF_ActivosFijos,codigo_unico,' . $id . ',id_activo_fijo',
                'id_clasificacion' => 'required|integer',
                'nombre_af' => 'required|string|max:255',
                'descripcion_af' => 'nullable|string',
                'fecha_adquisicion_af' => 'required|date',
                'costo_adquisicion_af' => 'required|numeric',
                'vida_util_meses' => 'nullable|integer',
                'valor_residual' => 'nullable|numeric',
                'id_estado_af' => 'required|integer',
            ]);

            $activo->update($validatedData);

            $response['success'] = true;
            $response['message'] = 'Activo fijo actualizado exitosamente.';
            $response['data'] = $activo;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            $response['message'] = 'Activo fijo no encontrado.';
        } catch (\Illuminate\Validation\ValidationException $e) {
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            $response['message'] = 'Error al actualizar el activo fijo: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar un activo fijo
    public function destroy($id)
    {
        $response = ["success" => false, "message" => ""];

        try {
            ActivosFijos::findOrFail($id)->delete();
            $response['success'] = true;
            $response['message'] = 'Activo fijo eliminado exitosamente.';
        } catch (\Exception $e) {
            $response['message'] = 'Error al eliminar el activo fijo: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Obtener un activo fijo por ID
    public function show($id)
    {
        try {
            $activo = ActivosFijos::findOrFail($id);

            return response()->json($activo, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Activo fijo no encontrado: ' . $e->getMessage()], 404);
        }
    }

    /*
    // Obtener los archivos de un activo fijo
    public function obtenerArchivos($idActivo)
    {
        $activo = ActivosFijos::findOrFail($idActivo);
        $archivos = $activo->archivosActivos();

        return response()->json([
            'success' => true,
            'data' => $archivos,
        ]);
    }
    */

}