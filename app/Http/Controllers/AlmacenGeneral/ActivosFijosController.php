<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AlmacenGeneral\ActivosFijos;
use Illuminate\Support\Facades\DB;

// MODELS - FILTROS ACTIVOS FIJOS
use App\Models\Departamento;
use App\Models\Ubicacion;
use App\Models\AlmacenGeneral\Clasificaciones;
use App\Models\Empleado;


class ActivosFijosController extends Controller
{
    // Obtener todas los activos fijos
    public function index()
    {
        $response = ["success" => false, "data" => [], "message" => ""];

        try {

            $activosfijos = ActivosFijos::all();

            if ($activosfijos->isEmpty()) {
                $response['message'] = 'No se encontraron activos fijos.';
            } else {
                $response['success'] = true;
                $response['data'] = $activosfijos;
            }
        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener los activos fijos: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }

    // Crear un nuevo activo fijo
    public function store(Request $request)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $validatedData = $request->validate([
                'codigo_unico' => 'nullable|string|max:255',
                'nombre_af' => 'required|string|max:255',
                'descripcion_af' => 'nullable|string',
                'modelo_af' => 'required|string|max:255',
                'marca_af' => 'required|string|max:255',
                'numero_serie_af' => 'required|string|max:255',
                'precio_unitario_af' => 'required|integer',
                'af_propio' => 'boolean',
                'id_estado_af' => 'required|integer',
                'id_clasificacion' => 'required|integer',
                'fecha_registro_af' => 'required|date',
                'observaciones_af' => 'nullable|string',
            ]);

            // Usar el método estático del modelo que crea el activo y su QR
            $resultado = ActivosFijos::crearConQR($validatedData);

            $response['success'] = $resultado['success'];
            $response['message'] = $resultado['message'];
            $response['data'] = $resultado['data'];
        } catch (\Illuminate\Validation\ValidationException $e) {
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            $response['message'] = 'Error al crear el activo fijo: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Actualizar un activo fijo
    public function update(Request $request, $id)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $activo = ActivosFijos::findOrFail($id);
            $activo->update($request->all());

            $response['success'] = true;
            $response['message'] = 'Activo Fijo actualizado exitosamente.';
            $response['data'] = $activo;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            $response['message'] = 'Activo Fijo no encontrado.';
        } catch (\Illuminate\Validation\ValidationException $e) {
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            $response['message'] = 'Error al actualizar el activo fijo: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar un activo fijo
    public function destroy($id)
    {
        $response = ["success" => false, "message" => ""];

        try {
            ActivosFijos::findOrFail($id)->delete();
            $response['success'] = true;
            $response['message'] = 'Activo fijo eliminado exitosamente.';
        } catch (\Exception $e) {
            $response['message'] = 'Error al eliminar el activo fijo: ' . $e->getMessage();
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
            return response()->json(['error' => 'Activo fijo no encontrado: ' . $e->getMessage()], 404);
        }
    }

    // Obtener los estatus de los activos fijos (Crear CRUD Completo, Model y Controller)
    public function getEstatusActivosFijos()
    {
        try {
            $API_estatusaf = DB::table('almacengeneral.tableRef_EstatusAF')
                ->select('id_estatusaf', 'descripcion_estatusaf')
                ->get();

            return response()->json([
                'success' => true,
                'API_Response' => $API_estatusaf,
                'message' => 'DatosAPI - EstatusActivosFijos'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estatus de activos fijos: ' . $e->getMessage()
            ], 500);
        }
    }



    // Activos Fijos FILTRADOS //

    // Por Departamento
    public function getActivosPorDepartamento($idDepartamento)
    {
        try {
            $departamento = Departamento::find($idDepartamento);
            $activosPorDepartamento = ActivosFijos::porDepartamento($idDepartamento)->get();

            return response()->json([
                'success' => true,
                'departamento' => $departamento?->nombre_departamento,
                'data' => $activosPorDepartamento,
                'message' => 'Activos fijos por departamento obtenidos exitosamente.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener activos fijos por departamento: ' . $e->getMessage()
            ], 500);
        }
    }


    // Por Ubicación
    public function getActivosPorUbicacion($idUbicacion)
    {
        try {
            $ubicacion = Ubicacion::find($idUbicacion);
            $activosPorUbicacion = ActivosFijos::porUbicacion($idUbicacion)->get();

            return response()->json([
                'success' => true,
                'ubicacion' => $ubicacion?->nombre_ubicacion,
                'data' => $activosPorUbicacion,
                'message' => 'Activos fijos por ubicación obtenidos exitosamente.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener activos fijos por ubicación: ' . $e->getMessage()
            ], 500);
        }
    }

    // Por Clasificación
    public function getActivosPorClasificacion($idClasificacion)
    {
        try {
            $clasificacion = Clasificaciones::find($idClasificacion);
            $activosPorClasificacion = ActivosFijos::porClasificacion($idClasificacion)->get();

            return response()->json([
                'success' => true,
                'clasificacion' => $clasificacion?->nombre_clasificacion,
                'data' => $activosPorClasificacion,
                'message' => 'Activos fijos por clasificación obtenidos exitosamente.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener activos fijos por clasificación: ' . $e->getMessage()
            ], 500);
        }
    }

    // Por Empleado
    public function getActivosPorResponsable($idEmpleado)
    {
        try {
            $empleado = Empleado::find($idEmpleado);
            $activosPorEmpleado = ActivosFijos::porResponsable($idEmpleado)
                ->get()
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
                        'precio_unitario_af' => $activo->precio_unitario_af,
                        'af_propio' => $activo->af_propio,
                        'id_estado_af' => $activo->id_estado_af,
                        'id_clasificacion' => $activo->id_clasificacion,
                        'fecha_registro_af' => $activo->fecha_registro_af,
                        'observaciones_af' => $activo->observaciones_af,
                        'ubicacion_actual' => $activo->ubicacion_actual,
                        'fecha_ultimo_movimiento' => $activo->fecha_ultimo_movimiento,
                        'created_at' => $activo->created_at,
                        'updated_at' => $activo->updated_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'empleado' => $empleado?->nombre_empleado . ' ' . $empleado?->apellido_paterno . ' ' . $empleado?->apellido_materno,
                'data' => $activosPorEmpleado,
                'message' => 'Activos fijos por empleado obtenidos exitosamente.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener activos fijos por empleado: ' . $e->getMessage()
            ], 500);
        }
    }

    // Activos Fijos Dados de Baja
    public function getActivosDadosDeBaja()
    {
        try {
            $activosDadosDeBaja = ActivosFijos::dadosDeBaja()->get();

            return response()->json([
                'success' => true,
                'data' => $activosDadosDeBaja,
                'message' => 'Activos fijos dados de baja obtenidos exitosamente.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener activos fijos dados de baja: ' . $e->getMessage()
            ], 500);
        }
    }

    // Activos Fijos No Propios
    public function getActivosNoPropios()
    {
        try {
            $activosNoPropios = ActivosFijos::noPropios()->get();

            return response()->json([
                'success' => true,
                'data' => $activosNoPropios,
                'message' => 'Activos fijos no propios obtenidos exitosamente.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener activos fijos no propios: ' . $e->getMessage()
            ], 500);
        }
    }
}