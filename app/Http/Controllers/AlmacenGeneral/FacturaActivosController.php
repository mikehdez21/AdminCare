<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AlmacenGeneral\FacturaActivos;
use App\Models\AlmacenGeneral\ActivosFijos;
use App\Models\AlmacenGeneral\FacturaAF;
use App\Services\FacturasActivos\FacturaActivoService;
use App\Exceptions\DemoQuotaExceeded;
use Illuminate\Support\Facades\DB;

class FacturaActivosController extends Controller
{
    protected $facturaActivoService; // Declarar propiedad para el servicio

    // Inyectar el servicio en el constructor
    public function __construct(FacturaActivoService $facturaActivoService)
    {
        $this->facturaActivoService = $facturaActivoService;
    }

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
                    'af_propio' => $activo->af_propio,
                    'af_menor' => $activo->af_menor,
                    'id_estado_af' => $activo->id_estado_af,
                    'numero_serie_af' => $activo->numero_serie_af,
                    'costo_unitario_af' => $activo->costo_unitario_af,
                    'descuento_af' => $activo->pivot->descuento_af,
                    'descuento_porcentajeaf' => $activo->pivot->descuento_porcentajeaf,
                    'observaciones' => $activo->pivot->observaciones_detalleaf,
                ];
            });

            $response['success'] = true;
            $response['data'] = $activosFactura;
            $response['message'] = 'Activos de factura obtenidos correctamente.';
        } catch (DemoQuotaExceeded $e) {
            $response['message'] = 'La demo permite como máximo 100 unidades de negocio.';
            $response['code'] = 'DEMO_QUOTA_EXCEEDED';
            $response['used'] = $e->used;
            $response['requested'] = $e->requested;
            $response['limit'] = $e->limit;
            return response()->json($response, 422);
        } catch (\Exception $e) {
            report($e);
            $response['message'] = 'No fue posible obtener los activos de factura.';
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
                'activos.*.costo_unitario_af' => ['required', 'regex:/^\d+(\.\d{1,2})?$/'],
                'activos.*.observaciones' => 'nullable|string'
            ]);

            DB::beginTransaction();
            $factura = FacturaAF::findOrFail($validatedData['id_factura']);

            // Llamar al servicio para reemplazar los activos
            $this->facturaActivoService->reemplazarActivosDeFactura($validatedData['id_factura'], $validatedData['activos']);

            DB::commit();

            $response['success'] = true;
            $response['message'] = 'Activos asociados a la factura exitosamente.';
            // Si necesitas devolver los activos recién asociados, tendrías que consultarlos después
            // $response['data'] = $factura->activosFijos; // Otra forma de obtenerlos
            $response['data'] = $validatedData['activos']; // Devuelve lo que se envió, aunque no sean los IDs finales

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (DemoQuotaExceeded $e) {
            DB::rollBack();
            $response['message'] = 'La demo permite como máximo 100 unidades de negocio.';
            $response['code'] = 'DEMO_QUOTA_EXCEEDED';
            $response['used'] = $e->used;
            $response['requested'] = $e->requested;
            $response['limit'] = $e->limit;
            return response()->json($response, 422);
        } catch (\Exception $e) {
            DB::rollBack();
            report($e);
            $response['message'] = 'No fue posible asociar activos a factura.';
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
                'activos.*.costo_unitario_af' => ['required', 'regex:/^\d+(\.\d{1,2})?$/'],
                'activos.*.observaciones' => 'nullable|string'
            ]);

            DB::beginTransaction();

            // Verificar que la factura existe
            $factura = FacturaAF::findOrFail($idFactura);

            // Llamar al servicio para reemplazar los activos
            $this->facturaActivoService->reemplazarActivosDeFactura($idFactura, $validatedData['activos']);

            DB::commit();

            $response['success'] = true;
            $response['message'] = 'Activos de factura actualizados exitosamente.';
            $response['data'] = $validatedData['activos']; // Devuelve lo que se envió

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            $response['message'] = 'Errores de validación.';
            $response['data'] = $e->errors();
        } catch (DemoQuotaExceeded $e) {
            DB::rollBack();
            $response['message'] = 'La demo permite como máximo 100 unidades de negocio.';
            $response['code'] = 'DEMO_QUOTA_EXCEEDED';
            $response['used'] = $e->used;
            $response['requested'] = $e->requested;
            $response['limit'] = $e->limit;
            return response()->json($response, 422);
        } catch (\Exception $e) {
            DB::rollBack();
            report($e);
            $response['message'] = 'No fue posible actualizar los activos de factura.';
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

            // Limpiar campos: codigo_lote, lote_afconsecutivo, lote_total, codigo_etiqueta
            $limparCamposActivo = ActivosFijos::where('id_activo_fijo', $idActivo)->first();
            if ($limparCamposActivo) {
                $limparCamposActivo->codigo_lote = null;
                $limparCamposActivo->lote_afconsecutivo = null;
                $limparCamposActivo->lote_total = null;
                $limparCamposActivo->codigo_etiqueta = $limparCamposActivo->codigo_unico . '-SINFACTURA';
                $limparCamposActivo->save();
            }


            $facturaActivo->delete();

            $response['success'] = true;
            $response['message'] = 'Activo removido de la factura exitosamente.';
        } catch (\Exception $e) {
            report($e);
            $response['message'] = 'No fue posible remover el activo de factura.';
        }

        return response()->json($response, $response['success'] ? 200 : 500);
    }
}
