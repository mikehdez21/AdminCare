<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Concerns\Paginable;
use App\Http\Controllers\Controller;
use App\Models\AlmacenGeneral\ActivosFijos;
use App\Models\AlmacenGeneral\Clasificaciones;
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

    // Obtener todas los activos fijos
    public function index(Request $request)
    {
        $response = ['success' => false, 'data' => [], 'message' => ''];

        try {

            $resultado = $this->paginar(
                $request,
                ActivosFijos::query()->orderBy('id_activo_fijo', 'asc'),
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote']
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
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote']
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
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote']
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
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote']
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
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote']
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
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote']
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
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote']
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
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote']
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
                ['descripcion_af', 'id_activo_fijo', 'codigo_lote']
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
