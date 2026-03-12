<?php

namespace App\Http\Controllers\AlmacenGeneral;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use App\Models\AlmacenGeneral\Proveedores;
use Illuminate\Support\Facades\DB;


class ProveedorController extends Controller
{
    // Obtener todos los proveedores
    public function index()
    {

        $response = ["success" => false, "data" => [], "message" => ""];


        try {

            $proveedores = Proveedores::all([
                'id_proveedor',
                'nombre_proveedor',
                'razon_social',
                'email_proveedor',
                'telefono_proveedor',
                'sitioWeb',
                'rfc',
                'id_tipo_moneda',
                'id_tipo_proveedor',
                'id_forma_pago',
                'id_tipo_regimen',
                'id_tipo_descuento',
                'id_tipo_facturacion',
                'estatus_activo',
                'created_at',
                'updated_at'
            ]);


            if ($proveedores->isEmpty()) {
                $response['message'] = 'No se encontraron proveedores.';
            } else {
                $response['success'] = true;
                $response['data'] = $proveedores;
            }
        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener los proveedores: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }

    // Crear un nuevo proveedor (antes: createProveedor)
    public function store(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'nombre_proveedor' => 'required|string|max:255',
            'razon_social' => 'required|string',
            'email_proveedor' => 'required|email',
            'telefono_proveedor' => 'nullable|string',
            'sitioWeb' => 'nullable|string',
            'rfc' => 'required|string',
            'estatus_activo' => 'boolean',

            // Datos de Tablas Relacionadas 
            'id_tipo_moneda' => 'required|integer',
            'id_tipo_proveedor' => 'required|integer',
            'id_forma_pago' => 'required|integer',
            'id_tipo_regimen' => 'required|integer',
            'id_tipo_descuento' => 'required|integer',
            'id_tipo_facturacion' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "message" => "Errores de validación",
                "errors" => $validator->errors()
            ], 422);
        }

        try {
            $input = $request->all();

            // Si sitioWeb está vacío o no fue enviado, asigna "No especificado"
            if (empty($input['sitioWeb'])) {
                $input['sitioWeb'] = 'No especificado';
            }

            // Crear proveedor
            $proveedor = Proveedores::create($input);

            return response()->json([
                "success" => true,
                "message" => "Proveedor registrado exitosamente!",
                "data" => $proveedor
            ], 201);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                "success" => false,
                "message" => "Error de base de datos: " . $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                "success" => false,
                "message" => "Error inesperado: " . $e->getMessage()
            ], 500);
        }
    }

    // Actualizar un proveedor existente
    public function update(Request $request, $id)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $proveedor = Proveedores::findOrFail($id);
            $proveedor->update($request->all());

            $response['success'] = true;
            $response['message'] = 'Proveedor actualizado exitosamente.';
            $response['data'] = $proveedor;
        } catch (\Exception $e) {
            $response['message'] = 'Error al actualizar el proveedor: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar un proveedor
    public function destroy($id)
    {
        $response = ["success" => false, "message" => ""];

        try {
            Proveedores::destroy($id);
            $response['success'] = true;
            $response['message'] = 'Proveedor eliminado exitosamente.';
            return response()->json($response, 200);
        } catch (\Exception $e) {
            $response['message'] = 'Error al eliminar el proveedor: ' . $e->getMessage();
            return response()->json($response, 500);
        }
    }
}
