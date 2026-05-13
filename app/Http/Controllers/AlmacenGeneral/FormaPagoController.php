<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\AlmacenGeneral\FormaPago;

class FormaPagoController extends Controller
{
    // Obtener todas las formas de pago
    public function index()
    {
        $response = ["success" => false, "data" => [], "message" => ""];

        try {
            $formasPago = FormaPago::all([
                'id_formapago',
                'descripcion_formaspago',
                'created_at',
                'updated_at'
            ]);

            if ($formasPago->isEmpty()) {
                $response['message'] = 'No se encontraron formas de pago.';
            } else {
                $response['success'] = true;
                $response['data'] = $formasPago;
            }
        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener las formas de pago: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }

    // Crear una nueva forma de pago
    public function store(Request $request)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        $validator = Validator::make($request->all(), [
            'descripcion_formaspago' => 'required|string|max:255|unique:almacengeneral.tableRef_FormasPago',
        ]);

        if ($validator->fails()) {
            return response()->json(["error" => $validator->errors()], 422);
        }

        try {
            $input = $request->all();
            $formaPago = FormaPago::create($input);

            $response['success'] = true;
            $response['message'] = 'Forma de pago registrada exitosamente!';
            $response['data'] = $formaPago;
        } catch (\Exception $e) {
            $response['message'] = 'Error al crear la forma de pago: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Actualizar una forma de pago existente
    public function update(Request $request, $id)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $formaPago = FormaPago::findOrFail($id);
            $formaPago->update($request->all());

            $response['success'] = true;
            $response['message'] = 'Forma de pago actualizada exitosamente.';
            $response['data'] = $formaPago;
        } catch (\Exception $e) {
            $response['message'] = 'Error al actualizar la forma de pago: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar una forma de pago
    public function destroy($id)
    {
        $response = ["success" => false, "message" => ""];

        try {
            FormaPago::destroy($id);
            $response['success'] = true;
            $response['message'] = 'Forma de pago eliminada exitosamente.';
            return response()->json($response, 200);
        } catch (\Exception $e) {
            $response['message'] = 'Error al eliminar la forma de pago: ' . $e->getMessage();
            return response()->json($response, 500);
        }
    }
}
