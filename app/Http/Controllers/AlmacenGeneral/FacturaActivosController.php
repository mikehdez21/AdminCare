<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AlmacenGeneral\FacturaActivos;
use App\Models\AlmacenGeneral\FacturaAF;
use Illuminate\Support\Facades\DB;

class FacturaActivosController extends Controller
{
    // Obtener activos de una factura especifica
    public function getActivosByFactura($idFactura)
    {
        $response = ["success" => false, "data" => [], "message" => ""];

        try {
            $factura = FacturaAF::findOrFail($idFactura);

            $activosFactura = $factura->activosFijos()->get()->map(function ($activo) {
                return [
                    'id_activo_fijo' => $activo->id_activo_fijo,
                    'nombre_af' => $activo->nombre_af,
                    'codigo_unico' => $activo->codigo_unico,
                    'codigo_etiqueta' => $activo->codigo_etiqueta,
                    'codigo_lote' => $activo->codigo_lote,
                    'lote_afconsecutivo' => $activo->lote_afconsecutivo,
                    'lote_total' => $activo->lote_total,
                    'id_clasificacion' => $activo->id_clasificacion,
                    'fecha_registro_af' => $activo->fecha_registro_af,
                    'numero_serie_af' => $activo->numero_serie_af,
                    'precio_unitario_af' => $activo->precio_unitario_af,
                    'descuento_af' => $activo->pivot->descuento_af,
                    'descuento_porcentajeaf' => $activo->pivot->descuento_porcentajeaf,
                    'observaciones' => $activo->pivot->observaciones_detalleaf,
                    'total' => $activo->pivot->precio_unitario_af,
                ];
            });

            $response['success'] = true;
            $response['data'] = $activosFactura;
            $response['message'] = 'Activos de factura obtenidos correctamente.';
        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener activos de factura: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }

    // Agregar activos a una factura
    public function addActivosToFactura(Request $request)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $validatedData = $request->validate([
                'id_factura' => 'required|integer',
                'activos' => 'required|array',
                'activos.*.id_activo_fijo' => 'required|integer',
                'activos.*.numero_serie_af' => 'required|string',
                'activos.*.precio_unitario_af' => 'required|numeric|min:0',
                'activos.*.observaciones' => 'nullable|string'
            ]);

            DB::beginTransaction();

            $factura = FacturaAF::findOrFail($validatedData['id_factura']);

            // Eliminar asociaciones existentes para esta factura
            FacturaActivos::where('id_factura', $validatedData['id_factura'])->delete();

            $activosCreados = [];

            foreach ($validatedData['activos'] as $activoData) {
                $facturaActivo = FacturaActivos::create([
                    'id_factura' => $validatedData['id_factura'],
                    'id_activo_fijo' => $activoData['id_activo_fijo'],
                    'numero_serie_af' => $activoData['numero_serie_af'],
                    'precio_unitario_af' => $activoData['precio_unitario_af'],
                    'observaciones_detalleaf' => $activoData['observaciones'] ?? null
                ]);

                $activosCreados[] = $facturaActivo;
            }

            DB::commit();

            $response['success'] = true;
            $response['message'] = 'Activos asociados a la factura exitosamente.';
            $response['data'] = $activosCreados;
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            $response['message'] = 'Errores de validaciÃ³n.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            DB::rollBack();
            $response['message'] = 'Error al asociar activos a factura: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 201 : 500);
    }

    // Actualizar activos de una factura
    public function updateActivosFactura(Request $request, $idFactura)
    {
        $response = ["success" => false, "message" => "", "data" => []];

        try {
            $validatedData = $request->validate([
                'activos' => 'required|array',
                'activos.*.id_activo_fijo' => 'required|integer',
                'activos.*.numero_serie_af' => 'required|string',
                'activos.*.precio_unitario_af' => 'required|numeric|min:0',
                'activos.*.observaciones' => 'nullable|string'
            ]);

            DB::beginTransaction();

            // Verificar que la factura existe
            $factura = FacturaAF::findOrFail($idFactura);

            // Eliminar asociaciones existentes
            FacturaActivos::where('id_factura', $idFactura)->delete();

            $activosActualizados = [];

            foreach ($validatedData['activos'] as $activoData) {
                $facturaActivo = FacturaActivos::create([
                    'id_factura' => $idFactura,
                    'id_activo_fijo' => $activoData['id_activo_fijo'],
                    'numero_serie_af' => $activoData['numero_serie_af'],
                    'precio_unitario_af' => $activoData['precio_unitario_af'],
                    'observaciones_detalleaf' => $activoData['observaciones'] ?? null
                ]);

                $activosActualizados[] = $facturaActivo;
            }

            DB::commit();

            $response['success'] = true;
            $response['message'] = 'Activos de factura actualizados exitosamente.';
            $response['data'] = $activosActualizados;
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            $response['message'] = 'Errores de validaciÃ³n.';
            $response['data'] = $e->errors();
        } catch (\Exception $e) {
            DB::rollBack();
            $response['message'] = 'Error al actualizar activos de factura: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }

    // Eliminar un activo especÃ­fico de una factura
    public function removeActivoFromFactura($idFactura, $idActivo)
    {
        $response = ["success" => false, "message" => ""];

        try {
            $facturaActivo = FacturaActivos::where('id_factura', $idFactura)
                ->where('id_activo_fijo', $idActivo)
                ->firstOrFail();

            $facturaActivo->delete();

            $response['success'] = true;
            $response['message'] = 'Activo removido de la factura exitosamente.';
        } catch (\Exception $e) {
            $response['message'] = 'Error al remover activo de factura: ' . $e->getMessage();
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }
}
