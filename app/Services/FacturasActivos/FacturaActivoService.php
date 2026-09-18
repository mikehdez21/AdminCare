<?php

namespace App\Services\FacturasActivos;

use App\Models\AlmacenGeneral\FacturaActivos;
use App\Models\AlmacenGeneral\ActivosFijos;
use App\Models\AlmacenGeneral\MovimientosActivos;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\DemoQuotaService;

class FacturaActivoService
{
    public function __construct(private readonly DemoQuotaService $quota)
    {
    }
    private function generarClaveLoteActivo(array $activoData): string
    {
        return implode('|', [
            strtoupper(trim((string) ($activoData['nombre_af'] ?? ''))),
            strtoupper(trim((string) ($activoData['marca_af'] ?? ''))),
            strtoupper(trim((string) ($activoData['modelo_af'] ?? ''))),
            (string) ($activoData['id_clasificacion'] ?? 0),
            number_format((float) ($activoData['costo_unitario_af'] ?? 0), 2, '.', ''),
            strtoupper(trim((string) ($activoData['descripcion_af'] ?? ''))),
            strtoupper(trim((string) ($activoData['observaciones_af'] ?? ''))),
            (string) (int) (($activoData['af_propio'] ?? false) ? 1 : 0),
            (string) ($activoData['id_estado_af'] ?? 0),
        ]);
    }

    /**
     * Reemplaza todos los activos asociados a una factura con un nuevo conjunto de activos.
     * Puede manejar activos existentes o crear nuevos activos.
     *
     * @param int $idFactura El ID de la factura a la que se le reemplazarán los activos.
     * @param array $activosData El array de datos de activos recibido desde la solicitud.
     * @return void
     * @throws Exception Si ocurre un error durante la creación o asociación de activos.
     */
    public function reemplazarActivosDeFactura(int $idFactura, array $activosData): void
    {
        Log::info("Iniciando reemplazo de activos para la factura ID: {$idFactura}");

        $newUnits = collect($activosData)
            ->filter(static fn (array $asset): bool => empty($asset['id_activo_fijo']))
            ->sum(static fn (array $asset): int => max(1, (int) ($asset['cantidad'] ?? 1)));
        $this->quota->assertCanAdd($newUnits);

        // 1. Eliminar las asociaciones existentes
        FacturaActivos::where('id_factura', $idFactura)->delete();
        Log::info("Activos anteriores eliminados para la factura ID: {$idFactura}");

        // 2. Procesar el array de nuevos activos
        if (empty($activosData)) {
            Log::info("Array de activos vacío enviado para la factura ID: {$idFactura}, se eliminaron los anteriores.");
            return; // No hay nada más que hacer si el array está vacío
        }

        $activosNuevosAgrupados = [];
        foreach ($activosData as $activoData) {
            $esActivoExistente = !empty($activoData['id_activo_fijo']) && (int)$activoData['id_activo_fijo'] > 0;

            if ($esActivoExistente) {
                if (!ActivosFijos::whereKey($activoData['id_activo_fijo'])->exists()) {
                    throw new Exception('El activo indicado no existe.');
                }
                // Caso 1: Asociar activo existente
                FacturaActivos::create([
                    'id_factura' => $idFactura,
                    'id_activo_fijo' => $activoData['id_activo_fijo'],
                    'observaciones_detalleaf' => $activoData['observaciones'] ?? null
                ]);

                // Crear movimiento si hay datos de asignación
                if (!empty($activoData['id_responsable_actual']) && !empty($activoData['id_ubicacion_actual'])) {
                    MovimientosActivos::create([
                        'id_activo_fijo' => $activoData['id_activo_fijo'],
                        'id_tipo_movimiento' => $activoData['id_tipo_movimiento'] ?? 1,
                        'motivo_movimiento' => $activoData['motivo_asignacion'] ?? 'Asociación actualizada por modificación de factura',
                        'fecha_movimiento' => $activoData['fecha_movimiento'] ?? now(),
                        'id_responsable_anterior' => null,
                        'id_responsable_actual' => $activoData['id_responsable_actual'],
                        'id_ubicacion_anterior' => null,
                        'id_ubicacion_actual' => $activoData['id_ubicacion_actual'],
                    ]);
                }

                continue; // Pasar al siguiente activo
            }

            // Caso 2: Crear nuevo activo y asociarlo
            $camposRequeridos = [
                'nombre_af',
                'marca_af',
                'modelo_af',
                'numero_serie_af',
                'costo_unitario_af',
                'af_propio',
                'af_menor',
                'id_estado_af',
                'id_clasificacion',
            ];

            foreach ($camposRequeridos as $campo) {
                if (!array_key_exists($campo, $activoData) || $activoData[$campo] === null || $activoData[$campo] === '') {
                    throw new Exception("Falta el campo requerido '{$campo}' para crear un activo nuevo.");
                }
            }

            $cantidadLinea = max(1, (int) ($activoData['cantidad'] ?? 1));
            $claveLote = $this->generarClaveLoteActivo($activoData);

            if (!isset($activosNuevosAgrupados[$claveLote])) {
                $activosNuevosAgrupados[$claveLote] = [];
            }

            for ($n = 0; $n < $cantidadLinea; $n++) {
                $activosNuevosAgrupados[$claveLote][] = $activoData;
            }
        }

        // 3. Procesar los grupos de activos nuevos
        // Suponiendo que puedes obtener el número consecutivo de la factura aquí si es necesario
        // $factura = FacturaAF::find($idFactura); // O pasar la factura como argumento si ya está cargada
        // $numeroFacturaConsecutivo = $factura ? preg_replace('/^NOF-\d{4}-/', '', $factura->num_factura) : $idFactura;
        $numeroFacturaConsecutivo = $idFactura; // Usamos ID como fallback si no se pasa la factura completa

        foreach (array_values($activosNuevosAgrupados) as $lineaIndex => $grupoActivos) {
            $totalLote = count($grupoActivos);
            $codigoLote = 'LT' . ($lineaIndex + 1) . '- F' . $numeroFacturaConsecutivo;

            foreach ($grupoActivos as $i => $activoData) {
                $datosActivo = [
                    'nombre_af' => $activoData['nombre_af'],
                    'marca_af' => $activoData['marca_af'],
                    'modelo_af' => $activoData['modelo_af'],
                    'numero_serie_af' => $activoData['numero_serie_af'],
                    'costo_unitario_af' => $activoData['costo_unitario_af'],
                    'af_propio' => $activoData['af_propio'],
                    'af_menor' => $activoData['af_menor'],
                    'id_estado_af' => $activoData['id_estado_af'],
                    'fecha_registro_af' => $activoData['fecha_registro_af'],
                    'id_clasificacion' => $activoData['id_clasificacion'],
                    'descripcion_af' => $activoData['descripcion_af'] ?? null,
                    'observaciones_af' => $activoData['observaciones_af'] ?? null,
                    'codigo_lote' => $codigoLote,
                    'lote_afconsecutivo' => $i + 1,
                    'lote_total' => $totalLote,
                ];

                $resultadoActivo = ActivosFijos::crearConQR($datosActivo, false);

                if (!$resultadoActivo['success']) {
                    throw new Exception($resultadoActivo['message'] ?? 'Error al crear activo.');
                }

                $nuevoActivo = $resultadoActivo['data'] ?? null;

                if (!$nuevoActivo || !isset($nuevoActivo->id_activo_fijo)) {
                    throw new Exception('Error al crear activo: respuesta inválida al crear activo fijo.');
                }

                $nuevoActivo->codigo_etiqueta = sprintf(
                    '%s-F%d-L%d-C%d-LT%s',
                    $nuevoActivo->codigo_unico,
                    $idFactura,
                    $lineaIndex + 1,
                    $i + 1,
                    $totalLote
                );
                $nuevoActivo->save();

                if (!config('app.demo_mode', false)) {
                    $resultadoQRFinal = \App\Models\AlmacenGeneral\CodigosQRAF::generarParaActivo(
                        $nuevoActivo->id_activo_fijo,
                        true
                    );

                    if (!$resultadoQRFinal['success']) {
                        throw new Exception('Error al generar QR final: ' . ($resultadoQRFinal['message'] ?? 'Error desconocido'));
                    }
                }

                FacturaActivos::create([
                    'id_factura' => $idFactura,
                    'id_activo_fijo' => $nuevoActivo->id_activo_fijo,
                    'observaciones_detalleaf' => $activoData['observaciones'] ?? null
                ]);

                if (!empty($activoData['id_responsable_actual']) && !empty($activoData['id_ubicacion_actual'])) {
                    MovimientosActivos::create([
                        'id_activo_fijo' => $nuevoActivo->id_activo_fijo,
                        'id_tipo_movimiento' => $activoData['id_tipo_movimiento'] ?? 1,
                        'motivo_movimiento' => $activoData['motivo_asignacion'] ?? 'Asociación inicial por actualización de factura',
                        'fecha_movimiento' => $activoData['fecha_movimiento'],
                        'id_responsable_anterior' => null,
                        'id_responsable_actual' => $activoData['id_responsable_actual'],
                        'id_ubicacion_anterior' => null,
                        'id_ubicacion_actual' => $activoData['id_ubicacion_actual'],
                    ]);
                }
            }
        }

        Log::info("Reemplazo de activos completado para la factura ID: {$idFactura}");
    }
}
