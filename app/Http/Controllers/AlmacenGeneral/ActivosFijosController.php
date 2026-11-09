<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Concerns\Paginable;
use App\Http\Controllers\Controller;
use App\Models\AlmacenGeneral\ActivosFijos;
use App\Models\AlmacenGeneral\Clasificaciones;
use App\Support\SchemaTable;
// MODELS - FILTROS ACTIVOS FIJOS
use App\Models\Departamento;
use App\Models\Empleado;
use App\Models\Ubicacion;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use App\Exceptions\DemoQuotaExceeded;
use App\Services\DemoQuotaService;

class ActivosFijosController extends Controller
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

    /**
     * Config de orden/filtros compartida por todas las variantes del listado.
     */
    private function configTablaActivos(): array
    {
        $base = SchemaTable::almacenQuoted('tableAF_ActivosFijos');
        $tabla = SchemaTable::almacen('tableAF_ActivosFijos');
        $estatus = SchemaTable::almacenQuoted('tableRef_EstatusAF');
        $clasificaciones = SchemaTable::almacenQuoted('tableRef_ClasificacionesAF');
        $sinClasificar = 'sin_clasificacion';

        return [
            'orden' => [
                'id' => $base.'."id_activo_fijo"',
                'codigo_unico' => 'LOWER('.$base.'."codigo_unico")',
                'lote' => 'LOWER('.$base.'."codigo_lote")',
                'nombre' => 'LOWER('.$base.'."nombre_af")',
                'descripcion' => 'LOWER('.$base.'."descripcion_af")',
                'modelo' => 'LOWER('.$base.'."modelo_af")',
                'marca' => 'LOWER('.$base.'."marca_af")',
                'serie' => 'LOWER('.$base.'."numero_serie_af")',
                'costo' => $base.'."costo_unitario_af"',
                'propio' => $base.'."af_propio"',
                'menor' => $base.'."af_menor"',
                'estado' => '(SELECT LOWER(est."descripcion_estatusaf") FROM '.$estatus.' est WHERE est."id_estatusaf" = '.$base.'."id_estado_af" LIMIT 1)',
                'clasificacion' => '(SELECT LOWER(clas."nombre_clasificacion") FROM '.$clasificaciones.' clas WHERE clas."id_clasificacion" = '.$base.'."id_clasificacion" LIMIT 1)',
                'fecha_registro' => $base.'."fecha_registro_af"',
                'depreciacion' => 'CASE WHEN '.$base.'."af_propio" = false THEN 2 WHEN '.$base.'."depreciacion_aplicada" = true THEN 0 ELSE 1 END',
                'observaciones' => 'LOWER('.$base.'."observaciones_af")',
                'creado' => $base.'."created_at"',
                'modificado' => $base.'."updated_at"',
            ],
            'orden_default' => ['id', 'asc'],
            'filtros' => [
                'id' => ['tipo' => 'texto', 'expresion' => $base.'."id_activo_fijo"'],
                'codigo_unico' => ['tipo' => 'texto', 'expresion' => $base.'."codigo_unico"'],
                'lote' => ['tipo' => 'texto', 'expresion' => $base.'."codigo_lote"'],
                'nombre' => ['tipo' => 'texto', 'expresion' => $base.'."nombre_af"'],
                'descripcion' => ['tipo' => 'texto', 'expresion' => $base.'."descripcion_af"'],
                'modelo' => ['tipo' => 'texto', 'expresion' => $base.'."modelo_af"'],
                'marca' => ['tipo' => 'texto', 'expresion' => $base.'."marca_af"'],
                'serie' => ['tipo' => 'texto', 'expresion' => $base.'."numero_serie_af"'],
                'propio' => ['tipo' => 'booleano', 'expresion' => $tabla.'.af_propio'],
                'menor' => ['tipo' => 'booleano', 'expresion' => $tabla.'.af_menor'],
                'estado' => [
                    'tipo' => 'callback',
                    'expresion' => $tabla.'.id_estado_af',
                    'callback' => $this->filtroId($tabla.'.id_estado_af'),
                ],
                'clasificacion' => [
                    'tipo' => 'callback',
                    'expresion' => $tabla.'.id_clasificacion',
                    'callback' => function ($query, string $valor) use ($tabla, $sinClasificar): void {
                        if ($valor === $sinClasificar) {
                            $query->whereNull($tabla.'.id_clasificacion');

                            return;
                        }

                        if (ctype_digit($valor)) {
                            $query->where($tabla.'.id_clasificacion', (int) $valor);
                        }
                    },
                ],
                'fecha_registro' => ['tipo' => 'fecha', 'expresion' => $tabla.'.fecha_registro_af'],
                'depreciacion' => [
                    'tipo' => 'callback',
                    'expresion' => $tabla.'.depreciacion_aplicada',
                    'callback' => function ($query, string $valor) use ($tabla): void {
                        if ($valor === 'na') {
                            $query->where($tabla.'.af_propio', false);

                            return;
                        }

                        if ($valor === 'activa') {
                            $query->where($tabla.'.af_propio', true)
                                ->where($tabla.'.depreciacion_aplicada', true);

                            return;
                        }

                        if ($valor === 'inactiva') {
                            $query->where($tabla.'.af_propio', true)
                                ->where($tabla.'.depreciacion_aplicada', false);
                        }
                    },
                ],
                'observaciones' => ['tipo' => 'texto', 'expresion' => $base.'."observaciones_af"'],
                'creado' => ['tipo' => 'fecha', 'expresion' => $tabla.'.created_at'],
                'modificado' => ['tipo' => 'fecha', 'expresion' => $tabla.'.updated_at'],
            ],
        ];
    }

    // Obtener todas los activos fijos
    public function index(Request $request)
    {
        $response = ['success' => false, 'data' => [], 'message' => ''];

        try {

            $resultado = $this->paginar(
                $request,
                ActivosFijos::query()->orderBy('id_activo_fijo', 'asc'),
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote'],
                10,
                $this->configTablaActivos()
            );

            $items = $resultado['items'];

            if ($items->isEmpty()) {
                $response['message'] = 'No se encontraron activos fijos.';
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
            $response['message'] = 'No fue posible obtener los activos fijos.';
        }

        return response()->json($response, 200);
    }

    // Crear un nuevo activo fijo
    public function store(Request $request, DemoQuotaService $quota)
    {
        $response = ['success' => false, 'message' => '', 'data' => []];

        try {
            $validatedData = $request->validate([
                'codigo_unico' => 'nullable|string|max:255',
                'nombre_af' => 'required|string|max:255',
                'descripcion_af' => 'nullable|string',
                'modelo_af' => 'required|string|max:255',
                'marca_af' => 'required|string|max:255',
                'numero_serie_af' => 'required|string|max:255',
                'costo_unitario_af' => 'required|regex:/^\d+(\.\d{1,2})?$/',
                'af_propio' => 'boolean',
                'id_estado_af' => 'required|integer',
                'id_clasificacion' => 'integer',
                'af_menor' => 'boolean',
                'fecha_registro_af' => 'required|date',
                'observaciones_af' => 'nullable|string',
            ]);

            $resultado = DB::transaction(function () use ($validatedData, $quota) {
                $quota->assertCanAdd(1);
                return ['success' => true, 'message' => 'Activo fijo creado exitosamente.', 'data' => ActivosFijos::create($validatedData)];
            });

            $response['success'] = $resultado['success'];
            $response['message'] = $resultado['message'];
            $response['data'] = $resultado['data'];
        } catch (DemoQuotaExceeded $e) {
            $response['message'] = 'La demo permite como máximo 100 unidades de negocio.';
            $response['code'] = 'DEMO_QUOTA_EXCEEDED';
            $response['used'] = $e->used;
            $response['requested'] = $e->requested;
            $response['limit'] = $e->limit;
            return response()->json($response, 422);
        } catch (ValidationException $e) {
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            report($e);
            $response['message'] = 'No fue posible crear el activo fijo.';
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Actualizar un activo fijo
    public function update(Request $request, $id)
    {
        $response = ['success' => false, 'message' => '', 'data' => []];

        try {
            $activo = ActivosFijos::findOrFail($id);
            $activo->update($request->all());

            $response['success'] = true;
            $response['message'] = 'Activo Fijo actualizado exitosamente.';
            $response['data'] = $activo;
        } catch (ModelNotFoundException $e) {
            $response['message'] = 'Activo Fijo no encontrado.';
        } catch (ValidationException $e) {
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            report($e);
            $response['message'] = 'No fue posible actualizar el activo fijo.';
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar un activo fijo
    public function destroy($id)
    {
        $response = ['success' => false, 'message' => ''];

        try {
            ActivosFijos::findOrFail($id)->delete();
            $response['success'] = true;
            $response['message'] = 'Activo fijo eliminado exitosamente.';
        } catch (\Exception $e) {
            report($e);
            $response['message'] = 'No fue posible eliminar el activo fijo.';
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
            return response()->json(['error' => 'Activo fijo no encontrado.'], 404);
        }
    }

    // Activos Fijos FILTRADOS //

    // Por Departamento
    public function getActivosPorDepartamento(Request $request, $idDepartamento)
    {
        try {
            $departamento = Departamento::find($idDepartamento);
            $resultado = $this->paginar(
                $request,
                ActivosFijos::porDepartamento($idDepartamento)->orderBy('id_activo_fijo', 'asc'),
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote'],
                10,
                $this->configTablaActivos()
            );

            $respuesta = [
                'success' => true,
                'departamento' => $departamento?->nombre_departamento,
                'data' => $resultado['items'],
                'message' => 'Activos fijos por departamento obtenidos exitosamente.',
            ];

            if ($resultado['meta'] !== null) {
                $respuesta['meta'] = $resultado['meta'];
            }

            return response()->json($respuesta, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $this->safeError('No fue posible obtener los activos fijos por departamento.', $e),
            ], 500);
        }
    }

    // Por Ubicación
    public function getActivosPorUbicacion(Request $request, $idUbicacion)
    {
        try {
            $ubicacion = Ubicacion::find($idUbicacion);
            $resultado = $this->paginar(
                $request,
                ActivosFijos::porUbicacion($idUbicacion)->orderBy('id_activo_fijo', 'asc'),
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote'],
                10,
                $this->configTablaActivos()
            );

            $respuesta = [
                'success' => true,
                'ubicacion' => $ubicacion?->nombre_ubicacion,
                'data' => $resultado['items'],
                'message' => 'Activos fijos por ubicación obtenidos exitosamente.',
            ];

            if ($resultado['meta'] !== null) {
                $respuesta['meta'] = $resultado['meta'];
            }

            return response()->json($respuesta, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $this->safeError('No fue posible obtener los activos fijos por ubicación.', $e),
            ], 500);
        }
    }

    // Por Clasificación
    public function getActivosPorClasificacion(Request $request, $idClasificacion)
    {
        try {
            $clasificacion = Clasificaciones::find($idClasificacion);
            $resultado = $this->paginar(
                $request,
                ActivosFijos::porClasificacion($idClasificacion)->orderBy('id_activo_fijo', 'asc'),
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote'],
                10,
                $this->configTablaActivos()
            );

            $respuesta = [
                'success' => true,
                'clasificacion' => $clasificacion?->nombre_clasificacion,
                'data' => $resultado['items'],
                'message' => 'Activos fijos por clasificación obtenidos exitosamente.',
            ];

            if ($resultado['meta'] !== null) {
                $respuesta['meta'] = $resultado['meta'];
            }

            return response()->json($respuesta, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $this->safeError('No fue posible obtener los activos fijos por clasificación.', $e),
            ], 500);
        }
    }

    // Por Empleado
    public function getActivosPorResponsable(Request $request, $idEmpleado)
    {
        try {
            $empleado = Empleado::find($idEmpleado);
            $resultado = $this->paginar(
                $request,
                ActivosFijos::porResponsable($idEmpleado)->orderBy('id_activo_fijo', 'asc'),
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote'],
                10,
                $this->configTablaActivos()
            );

            $activosPorEmpleado = $resultado['items']
                ->map(function (ActivosFijos $activo) {
                    return [
                        'id_activo_fijo' => $activo->id_activo_fijo,
                        'codigo_unico' => $activo->codigo_unico,
                        'codigo_etiqueta' => $activo->codigo_etiqueta,
                        'codigo_lote' => $activo->codigo_lote,
                        'lote_afconsecutivo' => $activo->lote_afconsecutivo,
                        'lote_total' => $activo->lote_total,
                        'nombre_af' => $activo->nombre_af,
                        'descripcion_af' => $activo->descripcion_af,
                        'modelo_af' => $activo->modelo_af,
                        'marca_af' => $activo->marca_af,
                        'numero_serie_af' => $activo->numero_serie_af,
                        'costo_unitario_af' => $activo->costo_unitario_af,
                        'af_propio' => $activo->af_propio,
                        'id_estado_af' => $activo->id_estado_af,
                        'id_clasificacion' => $activo->id_clasificacion,
                        'af_menor' => $activo->af_menor,
                        'fecha_registro_af' => $activo->fecha_registro_af,
                        'observaciones_af' => $activo->observaciones_af,
                        'ubicacion_actual' => $activo->ubicacion_actual,
                        'fecha_ultimo_movimiento' => $activo->fecha_ultimo_movimiento,
                        'created_at' => $activo->created_at,
                        'updated_at' => $activo->updated_at,
                    ];
                });

            $respuesta = [
                'success' => true,
                'empleado' => $empleado?->nombre_empleado . ' ' . $empleado?->apellido_paterno . ' ' . $empleado?->apellido_materno,
                'data' => $activosPorEmpleado,
                'message' => 'Activos fijos por empleado obtenidos exitosamente.',
            ];

            if ($resultado['meta'] !== null) {
                $respuesta['meta'] = $resultado['meta'];
            }

            return response()->json($respuesta, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $this->safeError('No fue posible obtener los activos fijos por empleado.', $e),
            ], 500);
        }
    }

    // Activos Fijos Dados de Baja
    public function getActivosDadosDeBaja(Request $request)
    {
        try {
            $resultado = $this->paginar(
                $request,
                ActivosFijos::dadosDeBaja()->orderBy('id_activo_fijo', 'asc'),
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote'],
                10,
                $this->configTablaActivos()
            );

            $respuesta = [
                'success' => true,
                'data' => $resultado['items'],
                'message' => 'Activos fijos dados de baja obtenidos exitosamente.',
            ];

            if ($resultado['meta'] !== null) {
                $respuesta['meta'] = $resultado['meta'];
            }

            return response()->json($respuesta, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $this->safeError('No fue posible obtener los activos fijos dados de baja.', $e),
            ], 500);
        }
    }

    // Activos Fijos No Propios
    public function getActivosNoPropios(Request $request)
    {
        try {
            $resultado = $this->paginar(
                $request,
                ActivosFijos::noPropios()->orderBy('id_activo_fijo', 'asc'),
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote'],
                10,
                $this->configTablaActivos()
            );

            $respuesta = [
                'success' => true,
                'data' => $resultado['items'],
                'message' => 'Activos fijos no propios obtenidos exitosamente.',
            ];

            if ($resultado['meta'] !== null) {
                $respuesta['meta'] = $resultado['meta'];
            }

            return response()->json($respuesta, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $this->safeError('No fue posible obtener los activos fijos no propios.', $e),
            ], 500);
        }
    }

    // Activos Fijos Menores
    public function getActivosMenores(Request $request)
    {
        try {
            $resultado = $this->paginar(
                $request,
                ActivosFijos::activosMenores()->orderBy('id_activo_fijo', 'asc'),
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote'],
                10,
                $this->configTablaActivos()
            );

            $respuesta = [
                'success' => true,
                'data' => $resultado['items'],
                'message' => 'Activos fijos menores obtenidos exitosamente.',
            ];

            if ($resultado['meta'] !== null) {
                $respuesta['meta'] = $resultado['meta'];
            }

            return response()->json($respuesta, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $this->safeError('No fue posible obtener los activos fijos menores.', $e),
            ], 500);
        }
    }

    // Activos Fijos Sin Factura
    public function getActivosSinFactura(Request $request)
    {
        try {
            $resultado = $this->paginar(
                $request,
                ActivosFijos::sinFactura()->orderBy('id_activo_fijo', 'asc'),
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote'],
                10,
                $this->configTablaActivos()
            );

            $respuesta = [
                'success' => true,
                'data' => $resultado['items'],
                'message' => 'Activos fijos sin factura obtenidos exitosamente.',
            ];

            if ($resultado['meta'] !== null) {
                $respuesta['meta'] = $resultado['meta'];
            }

            return response()->json($respuesta, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $this->safeError('No fue posible obtener los activos fijos sin factura.', $e),
            ], 500);
        }
    }
}
