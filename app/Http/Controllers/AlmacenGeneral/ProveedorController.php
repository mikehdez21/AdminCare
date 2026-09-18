<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Concerns\Paginable;
use App\Http\Controllers\Controller;
use App\Models\AlmacenGeneral\Proveedores;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Exceptions\DemoQuotaExceeded;
use App\Services\DemoQuotaService;

class ProveedorController extends Controller
{
    use Paginable;

    // Obtener todos los proveedores
    public function index(Request $request)
    {

        $response = ['success' => false, 'data' => [], 'message' => ''];

        try {
            $resultado = $this->paginar(
                $request,
                Proveedores::query()
                    ->select([
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
                        'updated_at',
                    ])
                    ->orderBy('id_proveedor', 'asc'),
                ['nombre_proveedor', 'id_proveedor']
            );

            $items = $resultado['items'];

            if ($items->isEmpty()) {
                $response['message'] = 'No se encontraron proveedores.';
            } else {
                $response['success'] = true;
                $response['data'] = $items;
            }

            // En modo paginado se incluye siempre el meta y success=true
            if ($resultado['meta'] !== null) {
                $response['success'] = true;
                $response['meta'] = $resultado['meta'];
            }
        } catch (\Exception $e) {
            report($e);
            $response['message'] = 'No fue posible obtener los proveedores.';
        }

        return response()->json($response, 200);
    }

    // Crear un nuevo proveedor (antes: createProveedor)
    public function store(Request $request, DemoQuotaService $quota)
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
            'id_tipo_facturacion' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $input = $request->all();

            // Si sitioWeb está vacío o no fue enviado, asigna "No especificado"
            if (empty($input['sitioWeb'])) {
                $input['sitioWeb'] = 'No especificado';
            }

            $proveedor = DB::transaction(function () use ($input, $quota) {
                $quota->assertCanAdd(1);
                return Proveedores::create($input);
            });

            return response()->json([
                'success' => true,
                'message' => 'Proveedor registrado exitosamente!',
                'data' => $proveedor,
            ], 201);
        } catch (DemoQuotaExceeded $e) {
            return response()->json([
                'success' => false, 'code' => 'DEMO_QUOTA_EXCEEDED',
                'message' => 'La demo permite como máximo 100 unidades de negocio.',
                'used' => $e->used, 'requested' => $e->requested, 'limit' => $e->limit,
            ], 422);
        } catch (QueryException $e) {
            return response()->json([
                'success' => false,
                'message' => 'No fue posible guardar el proveedor.',
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'No fue posible guardar el proveedor.',
            ], 500);
        }
    }

    // Actualizar un proveedor existente
    public function update(Request $request, $id)
    {
        $response = ['success' => false, 'message' => '', 'data' => []];

        try {
            $proveedor = Proveedores::findOrFail($id);
            $proveedor->update($request->all());

            $response['success'] = true;
            $response['message'] = 'Proveedor actualizado exitosamente.';
            $response['data'] = $proveedor;
        } catch (\Exception $e) {
            report($e);
            $response['message'] = 'No fue posible actualizar el proveedor.';
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar un proveedor
    public function destroy($id)
    {
        $response = ['success' => false, 'message' => ''];

        try {
            Proveedores::destroy($id);
            $response['success'] = true;
            $response['message'] = 'Proveedor eliminado exitosamente.';

            return response()->json($response, 200);
        } catch (\Exception $e) {
            report($e);
            $response['message'] = 'No fue posible eliminar el proveedor.';

            return response()->json($response, 500);
        }
    }
}
