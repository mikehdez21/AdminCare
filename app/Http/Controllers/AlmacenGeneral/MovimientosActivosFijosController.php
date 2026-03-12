<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AlmacenGeneral\MovimientosActivos;
use Illuminate\Support\Facades\DB;

class MovimientosActivosFijosController extends Controller
{
    // Obtener todos los movimientos de activos fijos de la TABLE
     public function index()
    {
        $response = ["success" => false, "data" => [], "message" => ""];

        try {

            $movimientosAF = MovimientosActivos::all();

            if ($movimientosAF->isEmpty()) {
                $response['message'] = 'No se encontraron movimientos de activos fijos.';
            } else {
                $response['success'] = true;
                $response['data'] = $movimientosAF;
            }
        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener los movimientos de activos fijos: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }

    // Crear un nuevo movimiento de activo fijo
    public function store(Request $request)
    {
        $response = ["success" => false, "message" => "", "data" => []];

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
        } catch (\Illuminate\Validation\ValidationException $e) {
            $response['message'] = 'Error de validación: ' . $e->getMessage();
        } catch (\Exception $e) {
            $response['message'] = 'Error al crear el movimiento de activo fijo: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }

    // Actualizar un movimiento de activo fijo
    public function update(Request $request, $id)
    {
        $response = ["success" => false, "message" => "", "data" => []];

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
        } catch (\Illuminate\Validation\ValidationException $e) {
            $response['message'] = 'Error de validación: ' . $e->getMessage();
        } catch (\Exception $e) {
            $response['message'] = 'Error al actualizar el movimiento de activo fijo: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }

    // Eliminar un movimiento de activo fijo
    public function destroy($id)
    {
        $response = ["success" => false, "message" => ""];

        try {
            MovimientosActivos::findOrFail($id)->delete();
            $response['success'] = true;
            $response['message'] = 'Movimiento de activo fijo eliminado exitosamente.';
        } catch (\Exception $e) {
            $response['message'] = 'Error al eliminar el movimiento de activo fijo: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }


    // VIEW - Obtener activos fijos completos (Tabla ActivosFijos y Tabla MovimientosActivosFijos)
    public function getVWMovimientosAFCompletos()
    {
        try {
            $vwMovimientosAF = DB::table('almacengeneral.vw_movimientosafcompletos')
                ->orderBy('fecha_ultimo_movimiento', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $vwMovimientosAF,
                'message' => 'Activos Fijos Completos obtenidos exitosamente.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener activos fijos completos: ' . $e->getMessage()
            ], 500);
        }
    }

    // Obtener tipos de movimientos de activos fijos
    public function getTiposMovimientosAF()
    {
        try {
            $tiposMovimientosAF = DB::table('almacengeneral.tableRef_TiposMovimientosAF')->get();

            return response()->json([
                'success' => true,
                'data' => $tiposMovimientosAF,
                'message' => 'Tipos de Movimientos de Activos Fijos obtenidos exitosamente.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tipos de movimientos de activos fijos: ' . $e->getMessage()
            ], 500);
        }
    }

    
    
     



   

}