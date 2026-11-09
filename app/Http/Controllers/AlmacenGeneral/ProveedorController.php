<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Concerns\Paginable;
use App\Http\Controllers\Controller;
use App\Models\AlmacenGeneral\Proveedores;
use App\Support\SchemaTable;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Exceptions\DemoQuotaExceeded;
use App\Services\DemoQuotaService;

class ProveedorController extends Controller
{
    use Paginable;

    private function filtroId(string $expresion): callable
    {
        return function ($query, string $valor) use ($expresion): void {
            if (ctype_digit($valor)) {
                $query->where($expresion, (int) $valor);
            }
        };
    }

    // Obtener todos los proveedores
    public function index(Request $request)
    {

        $response = ['success' => false, 'data' => [], 'message' => ''];

        try {
            $p = SchemaTable::almacen('tableAF_Proveedores');
            $tm = SchemaTable::almacen('tableRef_TiposMonedas');
            $tp = SchemaTable::almacen('tableRef_TiposProveedor');
            $fp = SchemaTable::almacen('tableRef_FormasPago');
            $rf = SchemaTable::almacen('tableRef_RegimenFiscales');
            $dp = SchemaTable::almacen('tableRef_DescuentoProveedor');
            $tf = SchemaTable::almacen('tableRef_TiposFacturacion');

            $resultado = $this->paginar(
                $request,
                Proveedores::query()
                    ->from($p.' as p')
                    ->leftJoin($tm.' as tm', 'tm.id_tipomoneda', '=', 'p.id_tipo_moneda')
                    ->leftJoin($tp.' as tp', 'tp.id_tipoproveedor', '=', 'p.id_tipo_proveedor')
                    ->leftJoin($fp.' as fp', 'fp.id_formapago', '=', 'p.id_forma_pago')
                    ->leftJoin($rf.' as rf', 'rf.id_regimenfiscal', '=', 'p.id_tipo_regimen')
                    ->leftJoin($dp.' as dp', 'dp.id_descuento_proveedor', '=', 'p.id_tipo_descuento')
                    ->leftJoin($tf.' as tf', 'tf.id_tipofacturacion', '=', 'p.id_tipo_facturacion')
                    ->select([
                        'p.id_proveedor',
                        'p.nombre_proveedor',
                        'p.razon_social',
                        'p.email_proveedor',
                        'p.telefono_proveedor',
                        'p.sitioWeb',
                        'p.rfc',
                        'p.id_tipo_moneda',
                        'p.id_tipo_proveedor',
                        'p.id_forma_pago',
                        'p.id_tipo_regimen',
                        'p.id_tipo_descuento',
                        'p.id_tipo_facturacion',
                        'p.estatus_activo',
                        'p.created_at',
                        'p.updated_at',
                    ]),
                ['nombre_proveedor', 'id_proveedor'],
                10,
                [
                    'orden' => [
                        'id' => '"p"."id_proveedor"',
                        'nombre' => 'LOWER("p"."nombre_proveedor")',
                        'razon_social' => 'LOWER("p"."razon_social")',
                        'email' => 'LOWER("p"."email_proveedor")',
                        'telefono' => 'LOWER("p"."telefono_proveedor")',
                        'sitio_web' => 'LOWER("p"."sitioWeb")',
                        'rfc' => 'LOWER("p"."rfc")',
                        'estatus' => '"p"."estatus_activo"',
                        'moneda' => 'LOWER("tm"."descripcion_tipomoneda")',
                        'tipo_proveedor' => 'LOWER("tp"."descripcion_tipoproveedor")',
                        'forma_pago' => 'LOWER("fp"."descripcion_formaspago")',
                        'regimen' => 'LOWER("rf"."descripcion_regimenfiscal")',
                        'descuento' => 'LOWER("dp"."descripcion_descuentoproveedor")',
                        'facturacion' => 'LOWER("tf"."descripcion_tipofacturacion")',
                        'creado' => '"p"."created_at"',
                        'modificado' => '"p"."updated_at"',
                    ],
                    'orden_default' => ['id', 'asc'],
                    'filtros' => [
                        'id' => ['tipo' => 'texto', 'expresion' => '"p"."id_proveedor"'],
                        'nombre' => ['tipo' => 'texto', 'expresion' => '"p"."nombre_proveedor"'],
                        'razon_social' => ['tipo' => 'texto', 'expresion' => '"p"."razon_social"'],
                        'email' => ['tipo' => 'texto', 'expresion' => '"p"."email_proveedor"'],
                        'telefono' => ['tipo' => 'texto', 'expresion' => '"p"."telefono_proveedor"'],
                        'sitio_web' => ['tipo' => 'texto', 'expresion' => '"p"."sitioWeb"'],
                        'rfc' => ['tipo' => 'texto', 'expresion' => '"p"."rfc"'],
                        'estatus' => ['tipo' => 'booleano', 'expresion' => 'p.estatus_activo'],
                        'moneda' => [
                            'tipo' => 'callback',
                            'expresion' => 'p.id_tipo_moneda',
                            'callback' => $this->filtroId('p.id_tipo_moneda'),
                        ],
                        'tipo_proveedor' => [
                            'tipo' => 'callback',
                            'expresion' => 'p.id_tipo_proveedor',
                            'callback' => $this->filtroId('p.id_tipo_proveedor'),
                        ],
                        'forma_pago' => [
                            'tipo' => 'callback',
                            'expresion' => 'p.id_forma_pago',
                            'callback' => $this->filtroId('p.id_forma_pago'),
                        ],
                        'regimen' => [
                            'tipo' => 'callback',
                            'expresion' => 'p.id_tipo_regimen',
                            'callback' => $this->filtroId('p.id_tipo_regimen'),
                        ],
                        'descuento' => [
                            'tipo' => 'callback',
                            'expresion' => 'p.id_tipo_descuento',
                            'callback' => $this->filtroId('p.id_tipo_descuento'),
                        ],
                        'facturacion' => [
                            'tipo' => 'callback',
                            'expresion' => 'p.id_tipo_facturacion',
                            'callback' => $this->filtroId('p.id_tipo_facturacion'),
                        ],
                        'creado' => ['tipo' => 'fecha', 'expresion' => 'p.created_at'],
                        'modificado' => ['tipo' => 'fecha', 'expresion' => 'p.updated_at'],
                    ],
                ]
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
