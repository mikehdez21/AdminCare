<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use App\Models\AlmacenGeneral\MetodoDepreciacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MetodoDepreciacionController extends Controller
{
    // Obtener todos los métodos de depreciación
    public function index()
    {
        $response = ["success" => false, "data" => [], "message" => ""];

        try {
            $metodos = MetodoDepreciacion::where('activo', true)->get([
                'id_metodo_depreciacion',
                'nombre_metodo',
                'descripcion_metodo',
                'formula',
                'tasa_default',
                'activo',
                'created_at',
                'updated_at'
            ]);

            if ($metodos->isEmpty()) {
                $response['message'] = 'No se encontraron métodos de depreciación.';
            } else {
                $response['success'] = true;
                $response['data'] = $metodos;
            }
        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener los métodos de depreciación: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }

    // POST: Crear nuevo método
    public function store(Request $request)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        $validator = Validator::make($request->all(), [
            'nombre_metodo' => 'required|string|max:255',
            'descripcion_metodo' => 'nullable|string',
            'formula' => 'nullable|string',
            'tasa_default' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(["error" => $validator->errors()], 422);
        }

        try {
            $input = $request->all();
            $metodo = MetodoDepreciacion::create($input);

            $response['success'] = true;
            $response['message'] = 'Método de depreciación registrado exitosamente!';
            $response['data'] = $metodo;
        } catch (\Exception $e) {
            $response['message'] = 'Error al crear el método de depreciación: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Actualizar método
    public function update(Request $request, $id)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $metodo = MetodoDepreciacion::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'descripcion_metodo' => 'nullable|string',
                'tasa_default' => 'nullable|numeric',
                'activo' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(["error" => $validator->errors()], 422);
            }

            $metodo->update($request->all());

            $response['success'] = true;
            $response['message'] = 'Método de depreciación actualizado exitosamente.';
            $response['data'] = $metodo;
        } catch (\Exception $e) {
            $response['message'] = 'Error al actualizar el método de depreciación: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar un método de depreciación
    public function destroy($id)
    {
        $response = ["success" => false, "message" => ""];

        try {
            MetodoDepreciacion::destroy($id);
            $response['success'] = true;
            $response['message'] = 'Método de depreciación eliminado exitosamente.';
            return response()->json($response, 200);
        } catch (\Exception $e) {
            $response['message'] = 'Error al eliminar el método de depreciación: ' . $e->getMessage();
            return response()->json($response, 500);
        }
    }
}
