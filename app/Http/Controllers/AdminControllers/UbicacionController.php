<?php

namespace App\Http\Controllers\AdminControllers;


use App\Models\Ubicacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;

class UbicacionController extends Controller
{

    // Obtener Todos los Ubicaciones
    public function index()
    {
        $response = ["success" => false, "data" => [], "message" => ""];


        try {

            $ubicaciones = Ubicacion::all([
                'id_ubicacion',
                'nombre_ubicacion',
                'descripcion_ubicacion',
                'estatus_activo',
                'created_at',
                'updated_at'
            ]);


            if ($ubicaciones->isEmpty()) {
                $response['message'] = 'No se encontraron ubicaciones.';
            } else {
                $response['success'] = true;
                $response['data'] = $ubicaciones;
            }
        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener los ubicaciones: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }


    /// STORE (crear Ubicaciones)
    public function store(Request $request)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        $validator = Validator::make($request->all(), [
            'nombre_ubicacion' => 'required|string|max:255',
            'descripcion_ubicacion' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(["error" => $validator->errors()], 422);
        }

        try {

            $input = $request->all();

            // Crear la ubicacion con los datos del request
            $ubicacion = Ubicacion::create($input);


            $response["success"] = true;
            $response['message'] = 'Ubicación registrada exitosamente!';
            $response['data'] = $ubicacion;
        } catch (\Exception $e) {
            $response['message'] = 'Error al crear la ubicación: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Obtener una ubicación por ID     
    public function show($id_ubicacion) {}

    // Actualizar Ubicación
    public function update(Request $request, $id_ubicacion)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $ubicacion = Ubicacion::findOrFail($id_ubicacion);
            $ubicacion->update($request->all());

            $response['success'] = true;
            $response['message'] = 'Ubicación actualizada exitosamente.';
            $response['data'] = $ubicacion;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            $response['message'] = 'Ubicación no encontrada.';
        } catch (\Illuminate\Validation\ValidationException $e) {
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            $response['message'] = 'Error al actualizar la ubicación: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar una Ubicación
    public function destroy($id_ubicacion)
    {
        $response = ["success" => false, "message" => ""];

        try {
            Ubicacion::findOrFail($id_ubicacion)->delete();
            $response['success'] = true;
            $response['message'] = 'Ubicación eliminada exitosamente.';
        } catch (\Exception $e) {
            $response['message'] = 'Error al eliminar la ubicación: ' . $e->getMessage();
        }


        return response()->json($response, $response['success'] ? 200 : 500);
    }
}
