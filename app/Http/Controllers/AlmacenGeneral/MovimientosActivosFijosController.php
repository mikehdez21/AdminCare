<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Concerns\Paginable;
use App\Http\Controllers\Controller;
use App\Models\AlmacenGeneral\MovimientosActivos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MovimientosActivosFijosController extends Controller
{
    use Paginable;

    // Obtener todos los movimientos de activos fijos de la TABLE
    public function index(Request $request)
    {
        $response = ['success' => false, 'data' => [], 'message' => ''];

        try {
            $resultado = $this->paginar(
                $request,
                MovimientosActivos::query()->orderBy('id_movimientoAF', 'asc'),
                ['id_movimientoAF', 'id_activo_fijo', 'motivo_movimiento']
            );

            $items = $resultado['items'];

            if ($items->isEmpty()) {
                $response['message'] = 'No se encontraron movimientos de activos fijos.';
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
            $response['message'] = $this->safeError('No fue posible obtener los movimientos de activos fijos.', $e);
        }

        return response()->json($response, 200);
    }

    // Crear un nuevo movimiento de activo fijo
    public function store(Request $request)
    {
        $response = ['success' => false, 'message' => '', 'data' => []];

        try {
            $validatedData = $request->validate([
                'id_activo_fijo' => 'required|integer',
                'id_tipo_movimiento' => 'required|integer',
                'motivo_movimiento' => 'nullable|string|max:255',
                'fecha_movimiento' => 'required|date',
                'id_responsable_anterior' => 'nullable|integer',
                'id_responsable_actual' => 'required|integer',
                'id_ubicacion_anterior' => 'nullable|integer',
                'id_ubicacion_actual' => 'required|integer',
            ]);

            if (isset($validatedData['id_responsable_anterior']) && $validatedData['id_responsable_anterior'] === 0) {
                $validatedData['id_responsable_anterior'] = null;
            }
            if (isset($validatedData['id_ubicacion_anterior']) && $validatedData['id_ubicacion_anterior'] === 0) {
                $validatedData['id_ubicacion_anterior'] = null;
            }

            $movimientoAF = MovimientosActivos::create($validatedData);

            $response['success'] = true;
            $response['message'] = 'Movimiento de activo fijo creado exitosamente.';
            $response['data'] = $movimientoAF;
        } catch (ValidationException $e) {
            $response['message'] = $this->safeError('Los datos del movimiento no son válidos.', $e);
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible crear el movimiento de activo fijo.', $e);
        }

        return response()->json($response, 200);
    }

    // Actualizar un movimiento de activo fijo
    public function update(Request $request, $id)
    {
        $response = ['success' => false, 'message' => '', 'data' => []];

        try {
            $validatedData = $request->validate([
                'id_activo_fijo' => 'required|integer',
                'id_tipo_movimiento' => 'required|integer',
                'motivo_movimiento' => 'nullable|string|max:255',
                'fecha_movimiento' => 'required|date',
                'id_responsable_anterior' => 'nullable|integer',
                'id_responsable_actual' => 'required|integer',
                'id_ubicacion_anterior' => 'nullable|integer',
                'id_ubicacion_actual' => 'required|integer',
            ]);

            $movimientoAF = MovimientosActivos::findOrFail($id);
            $movimientoAF->update($validatedData);

            $response['success'] = true;
            $response['message'] = 'Movimiento de activo fijo actualizado exitosamente.';
            $response['data'] = $movimientoAF;
        } catch (ValidationException $e) {
            $response['message'] = $this->safeError('Los datos del movimiento no son válidos.', $e);
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible actualizar el movimiento de activo fijo.', $e);
        }

        return response()->json($response, 200);
    }

    // Eliminar un movimiento de activo fijo
    public function destroy($id)
    {
        $response = ['success' => false, 'message' => ''];

        try {
            MovimientosActivos::findOrFail($id)->delete();
            $response['success'] = true;
            $response['message'] = 'Movimiento de activo fijo eliminado exitosamente.';
        } catch (\Exception $e) {
            $response['message'] = $this->safeError('No fue posible eliminar el movimiento de activo fijo.', $e);
        }

        return response()->json($response, 200);
    }

    // VIEW - Obtener activos fijos completos (Tabla ActivosFijos y Tabla MovimientosActivosFijos)
    public function getVWMovimientosAFCompletos(Request $request)
    {
        try {
            // La vista original solo existe en PostgreSQL. Construir aquí la
            // proyección también permite usar el esquema SQLite de demo sin
            // duplicar la vista ni depender de LATERAL (no soportado por SQLite).
            $driver = DB::connection()->getDriverName();
            $almacenSchema = $driver === 'pgsql' ? 'almacengeneral.' : '';
            $responsable = static function (string $alias) use ($driver): string {
                if ($driver === 'mysql') {
                    return "NULLIF(TRIM(CONCAT_WS(' ', {$alias}.nombre_empleado, {$alias}.apellido_paterno, {$alias}.apellido_materno)), '')";
                }

                // SQLite y PostgreSQL soportan concatenación con ||. COALESCE
                // evita que un apellido nullable anule el nombre completo.
                return "NULLIF(TRIM(COALESCE({$alias}.nombre_empleado, '') || ' ' || COALESCE({$alias}.apellido_paterno, '') || ' ' || COALESCE({$alias}.apellido_materno, '')), '')";
            };

            $movimientos = DB::table($almacenSchema.'tableAF_ActivosFijos as af')
                ->leftJoin($almacenSchema.'tableAF_MovimientosActivos as mov_actual', function ($join): void {
                    $join->on('mov_actual.id_activo_fijo', '=', 'af.id_activo_fijo');
                })
                // Conserva solo el movimiento más reciente por activo. La
                // comparación por ID deshace empates de fecha determinísticamente.
                ->where(function ($query) use ($almacenSchema): void {
                    $query->whereNull('mov_actual.id_movimientoAF')
                        ->orWhereNotExists(function ($newer) use ($almacenSchema): void {
                            $newer->select(DB::raw(1))
                                ->from($almacenSchema.'tableAF_MovimientosActivos as mov_nuevo')
                                ->whereColumn('mov_nuevo.id_activo_fijo', 'mov_actual.id_activo_fijo')
                                ->where(function ($date): void {
                                    $date->where(function ($q): void {
                                        $q->whereNotNull('mov_nuevo.fecha_movimiento')
                                            ->whereNull('mov_actual.fecha_movimiento');
                                    })->orWhere(function ($q): void {
                                        $q->whereNotNull('mov_nuevo.fecha_movimiento')
                                            ->whereNotNull('mov_actual.fecha_movimiento')
                                            ->whereColumn('mov_nuevo.fecha_movimiento', '>', 'mov_actual.fecha_movimiento');
                                    })->orWhere(function ($q): void {
                                        $q->where(function ($sameDate): void {
                                            $sameDate->whereColumn('mov_nuevo.fecha_movimiento', '=', 'mov_actual.fecha_movimiento')
                                                ->orWhere(function ($bothNull): void {
                                                    $bothNull->whereNull('mov_nuevo.fecha_movimiento')
                                                        ->whereNull('mov_actual.fecha_movimiento');
                                                });
                                        })->whereColumn('mov_nuevo.id_movimientoAF', '>', 'mov_actual.id_movimientoAF');
                                    });
                                });
                        });
                })
                ->leftJoin($almacenSchema.'tableRef_EstatusAF as est', 'af.id_estado_af', '=', 'est.id_estatusaf')
                ->leftJoin($almacenSchema.'tableRef_ClasificacionesAF as clas', 'af.id_clasificacion', '=', 'clas.id_clasificacion')
                ->leftJoin('tableEmpleados as emp_anterior', 'mov_actual.id_responsable_anterior', '=', 'emp_anterior.id_empleado')
                ->leftJoin('tableEmpleados as emp_actual', 'mov_actual.id_responsable_actual', '=', 'emp_actual.id_empleado')
                ->leftJoin('tableDepartamentos as dep_actual', 'emp_actual.id_departamento', '=', 'dep_actual.id_departamento')
                ->leftJoin('tableUbicaciones as ub_anterior', 'mov_actual.id_ubicacion_anterior', '=', 'ub_anterior.id_ubicacion')
                ->leftJoin('tableUbicaciones as ub_actual', 'mov_actual.id_ubicacion_actual', '=', 'ub_actual.id_ubicacion')
                ->leftJoin($almacenSchema.'tableRef_TiposMovimientosAF as tipmov', 'mov_actual.id_tipo_movimiento', '=', 'tipmov.id_tipomovimientoaf')
                ->select([
                    'af.id_activo_fijo', 'af.codigo_unico', 'af.nombre_af', 'af.descripcion_af',
                    'af.modelo_af', 'af.marca_af', 'af.numero_serie_af', 'af.costo_unitario_af',
                    'af.fecha_registro_af', 'af.af_propio', 'af.af_menor', 'af.codigo_etiqueta', 'af.observaciones_af',
                    'est.descripcion_estatusaf as estado_actual', 'clas.nombre_clasificacion as clasificacion',
                    DB::raw($responsable('emp_anterior').' as responsable_anterior_completo'),
                    DB::raw($responsable('emp_actual').' as responsable_actual_completo'),
                    'dep_actual.nombre_departamento as departamento_actual',
                    'ub_anterior.nombre_ubicacion as ubicacion_anterior',
                    'ub_actual.nombre_ubicacion as ubicacion_actual',
                    'mov_actual.fecha_movimiento as fecha_ultimo_movimiento',
                    'mov_actual.motivo_movimiento as ultimo_motivo_movimiento',
                    'tipmov.nombre_tipomovimientoaf as tipo_movimiento',
                ])
                ->orderByRaw('CASE WHEN mov_actual.fecha_movimiento IS NULL THEN 1 ELSE 0 END')
                ->orderByDesc('mov_actual.fecha_movimiento')
                ->orderByDesc('af.fecha_registro_af');

            $resultado = $this->paginar(
                $request,
                $movimientos,
                ['af.codigo_unico', 'af.nombre_af', 'af.id_activo_fijo']
            );

            $respuesta = [
                'success' => true,
                'data' => $resultado['items'],
                'message' => 'Activos Fijos Completos obtenidos exitosamente.',
            ];

            if ($resultado['meta'] !== null) {
                $respuesta['meta'] = $resultado['meta'];
            }

            return response()->json($respuesta, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $this->safeError('No fue posible obtener los activos fijos completos.', $e),
            ], 500);
        }
    }

    // Obtener tipos de movimientos de activos fijos
    public function getTiposMovimientosAF()
    {
        try {
            $table = DB::connection()->getDriverName() === 'pgsql'
                ? 'almacengeneral.tableRef_TiposMovimientosAF'
                : 'tableRef_TiposMovimientosAF';
            $tiposMovimientosAF = DB::table($table)->get();

            return response()->json([
                'success' => true,
                'data' => $tiposMovimientosAF,
                'message' => 'Tipos de Movimientos de Activos Fijos obtenidos exitosamente.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $this->safeError('No fue posible obtener los tipos de movimientos de activos fijos.', $e),
            ], 500);
        }
    }
}
