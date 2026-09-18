<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\AlmacenGeneral\TiposFactura;

class TiposFacturaController extends Controller
{
    // Obtener todos los tipos de factura
    public function index()
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $tipos = TiposFactura::all([
                'id_tipofacturaaf',
                'nombre_tipofactura',
                'descripcion_tipofactura',
                'created_at',
                'updated_at'
            ]);

            if ($tipos->isEmpty()) {
                $response['message'] = 'No se encontraron tipos de factura.';
            } else {
                $response['success'] = true;
                $response['data'] = $tipos;
            }
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible obtener los tipos de factura.', $e);
        }

        return response()->json($response, 200);
    }

    // Crear un nuevo tipo de factura
    public function store(Request $request)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        $validator = Validator::make($request->all(), [
            'nombre_tipofactura' => 'required|string|max:255',
            'descripcion_tipofactura' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Los datos del tipo de factura no son válidos.',
                'data' => ['errors' => $validator->errors()],
            ], 422);
        }

        try {
            $tipo = TiposFactura::create($validator->validated());

            $response['success'] = true;
            $response['message'] = 'Tipo de factura registrado exitosamente!';
            $response['data'] = $tipo;
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible crear el tipo de factura.', $e);
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Obtener un tipo de factura por ID.
    public function show($id)
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Tipo de factura encontrado.',
                'data' => TiposFactura::findOrFail($id),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'No fue posible obtener el tipo de factura.',
                'data' => [],
            ], 404);
        }
    }

    // Actualizar un tipo de factura existente
    public function update(Request $request, $id)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $validator = Validator::make($request->all(), [
                'nombre_tipofactura' => 'sometimes|required|string|max:255',
                'descripcion_tipofactura' => 'nullable|string|max:255',
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Los datos del tipo de factura no son válidos.',
                    'data' => ['errors' => $validator->errors()],
                ], 422);
            }

            $tipo = TiposFactura::findOrFail($id);
            $tipo->update($validator->validated());

            $response['success'] = true;
            $response['message'] = 'Tipo de factura actualizado exitosamente.';
            $response['data'] = $tipo;
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible actualizar el tipo de factura.', $e);
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar un tipo de factura
    public function destroy($id)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $tipo = TiposFactura::findOrFail($id);
            $tipo->delete();
            $response['success'] = true;
            $response['message'] = 'Tipo de factura eliminado exitosamente.';
            $response['data'] = ['id_tipofacturaaf' => (int) $id];
            return response()->json($response, 200);
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible eliminar el tipo de factura.', $e);
            return response()->json($response, 500);
        }
    }
}
