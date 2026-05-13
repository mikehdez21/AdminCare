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
        $response = ["success" => false, "data" => [], "message" => ""];

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
            $response['message'] = 'Error al obtener los tipos de factura: ' . $e->getMessage();
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
            return response()->json(["error" => $validator->errors()], 422);
        }

        try {
            $input = $request->all();
            $tipo = TiposFactura::create($input);

            $response['success'] = true;
            $response['message'] = 'Tipo de factura registrado exitosamente!';
            $response['data'] = $tipo;
        } catch (\Exception $e) {
            $response['message'] = 'Error al crear el tipo de factura: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Actualizar un tipo de factura existente
    public function update(Request $request, $id)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $tipo = TiposFactura::findOrFail($id);
            $tipo->update($request->all());

            $response['success'] = true;
            $response['message'] = 'Tipo de factura actualizado exitosamente.';
            $response['data'] = $tipo;
        } catch (\Exception $e) {
            $response['message'] = 'Error al actualizar el tipo de factura: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar un tipo de factura
    public function destroy($id)
    {
        $response = ["success" => false, "message" => ""];

        try {
            TiposFactura::destroy($id);
            $response['success'] = true;
            $response['message'] = 'Tipo de factura eliminado exitosamente.';
            return response()->json($response, 200);
        } catch (\Exception $e) {
            $response['message'] = 'Error al eliminar el tipo de factura: ' . $e->getMessage();
            return response()->json($response, 500);
        }
    }
}
