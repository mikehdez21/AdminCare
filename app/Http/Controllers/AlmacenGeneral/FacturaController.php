<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AlmacenGeneral\FacturaAF;

class FacturaController extends Controller
{
    // Obtener todas las facturas
    public function index()
    {
        $response = ["success" => false, "data" => [], "message" => ""];

        try {
            $facturas = FacturaAF::all();

            if ($facturas->isEmpty()) {
                $response['message'] = 'No se encontraron facturas.';
            } else {
                $response['success'] = true;
                $response['data'] = $facturas;
            }
        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener las facturas: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }

    // Crear una nueva factura
    public function store(Request $request)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $validatedData = $request->validate([
                'id_proveedor' => 'required|integer',
                'num_factura' => 'required|string|max:255',
                'id_tipo_factura' => 'required|integer',
                'fecha_fac_emision' => 'required|date',
                'fecha_fac_recepcion' => 'required|date',
                'id_forma_pago' => 'nullable|integer',
                'id_tipo_moneda' => 'nullable|integer',
                'observaciones_factura' => 'nullable|string',
                'subtotal_factura' => 'required|numeric',
                'descuento_factura' => 'nullable|numeric',
                'flete_factura' => 'nullable|numeric',
                'iva_factura' => 'required|numeric',
                'total_factura' => 'required|numeric',
            ]);

            $factura = FacturaAF::create($validatedData);

            $response['success'] = true;
            $response['message'] = 'Factura creada exitosamente.';
            $response['data'] = $factura;
        } catch (\Illuminate\Validation\ValidationException $e) {
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            $response['message'] = 'Error al crear la factura: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Actualizar una factura
    public function update(Request $request, $id)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $factura = FacturaAF::findOrFail($id);

            $validatedData = $request->validate([
                'id_proveedor' => 'required|integer',
                'num_factura' => 'required|string|max:255',
                'id_tipo_factura' => 'required|integer',
                'fecha_fac_emision' => 'required|date',
                'fecha_fac_recepcion' => 'required|date',
                'id_forma_pago' => 'nullable|integer',
                'id_tipo_moneda' => 'nullable|integer',
                'observaciones_factura' => 'nullable|string',
                'subtotal_factura' => 'required|numeric',
                'descuento_factura' => 'nullable|numeric',
                'flete_factura' => 'nullable|numeric',
                'iva_factura' => 'required|numeric',
                'total_factura' => 'required|numeric',
            ]);

            $factura->update($validatedData);

            $response['success'] = true;
            $response['message'] = 'Factura actualizada exitosamente.';
            $response['data'] = $factura;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            $response['message'] = 'Factura no encontrada.';
        } catch (\Illuminate\Validation\ValidationException $e) {
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            $response['message'] = 'Error al actualizar la factura: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar una factura
    public function destroy($id)
    {
        $response = ["success" => false, "message" => ""];

        try {
            FacturaAF::findOrFail($id)->delete();
            $response['success'] = true;
            $response['message'] = 'Factura eliminada exitosamente.';
        } catch (\Exception $e) {
            $response['message'] = 'Error al eliminar la factura: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Obtener una factura por ID
    public function show($id)
    {
        try {
            $factura = FacturaAF::findOrFail($id);

            return response()->json($factura, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Factura no encontrada: ' . $e->getMessage()], 404);
        }
    }
    
    /*

    // Subir un archivo adjunto de una factura
    public function subirAdjunto(Request $request, $idFactura)
    {
        $request->validate([
            'archivo' => 'required|file|max:10240', // Máximo 10MB
            'descripcion' => 'nullable|string|max:255',
        ]);

        $factura = FacturaAF::findOrFail($idFactura);
        $adjunto = $factura->agregarAdjunto($request->file('archivo'), $request->descripcion);

        return response()->json([
            'success' => true,
            'message' => 'Archivo subido exitosamente',
            'data' => $adjunto,
        ]);
    }
        */
}
