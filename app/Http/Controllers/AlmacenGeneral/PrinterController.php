<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use App\Models\AlmacenGeneral\ActivosFijos;
use App\Models\AlmacenGeneral\CodigosQRAF;
use App\Services\Printing\ZebraService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;


class PrinterController extends Controller
{
    protected $zebraService;

    /**
     * Constructor - Inyectar ZebraService
     */
    public function __construct(ZebraService $zebraService)
    {
        $this->zebraService = $zebraService;
    }

    /**
     * Imprimir etiqueta QR en impresora Zebra
     * 
     * POST /api/HSS1/almacengeneral/printer/etiqueta/{idActivo}
     * 
     * @param int $idActivo - ID del activo fijo a imprimir
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function imprimirEtiquetaZebra($idActivo)
    {
        try {
            // Obtener datos del activo
            $activo = ActivosFijos::findOrFail($idActivo);

            // Obtener QR asociado
            $qr = CodigosQRAF::where('id_activo_fijo', $idActivo)->first();

            if (!$qr) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay código QR generado para este activo'
                ], 404);
            }

            // Obtener nombre del activo fijo
            $nombreaf = $activo->nombre_af ?? 'Sin nombre';

            // Preparar datos para impresión
            $datosImpresion = [
                'qr' => $qr->url_destino ?? url("/activosfijos/qraf/{$qr->codigo_qr}"),
                'codigo' => $activo->codigo_etiqueta,
                'nombreaf' => $nombreaf,
            ];

            // Obtener formato (compacto o estándar)
            $compacto = config('printing.zebra.formato_compacto', false);

            // Enviar a imprimir
            $resultado = $this->zebraService->impresionCompleta($datosImpresion, $compacto);

            return response()->json($resultado, $resultado['success'] ? 200 : 500);

        } catch (\Exception $e) {
            Log::error('Error en impresión Zebra', [
                'id_activo' => $idActivo,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al imprimir etiqueta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Imprimir múltiples etiquetas QR (batch)
     * 
     * POST /api/HSS1/almacengeneral/printer/etiquetas-batch
     * 
     * @param Request $request - JSON con array de IDs: {"ids": [1, 2, 3]}
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function imprimirEtiquetasBatch(Request $request)
    {
        try {
            $request->validate([
                'ids' => 'required|array|min:1',
                'ids.*' => 'integer|exists:activos_fijos,id_activo_fijo'
            ]);

            $ids = $request->input('ids');
            $resultados = [];
            $exitosas = 0;
            $fallidas = 0;

            foreach ($ids as $idActivo) {
                try {
                    $activo = ActivosFijos::find($idActivo);
                    $qr = CodigosQRAF::where('id_activo_fijo', $idActivo)->first();

                    if ($activo && $qr) {
                        $nombreaf = $activo->nombre_af ?? 'Sin nombre';

                        $datosImpresion = [
                            'qr' => $qr->url_destino ?? url("/activosfijos/qraf/{$qr->codigo_qr}"),
                            'codigo' => $activo->codigo_etiqueta,
                            'nombreaf' => $nombreaf,
                        ];

                        $resultado = $this->zebraService->impresionCompleta(
                            $datosImpresion,
                            config('printing.zebra.formato_compacto', false)
                        );

                        if ($resultado['success']) {
                            $exitosas++;
                        } else {
                            $fallidas++;
                        }

                        $resultados[] = [
                            'id_activo' => $idActivo,
                            'codigo' => $activo->codigo_etiqueta,
                            'exito' => $resultado['success'],
                            'mensaje' => $resultado['message']
                        ];
                    } else {
                        $fallidas++;
                        $resultados[] = [
                            'id_activo' => $idActivo,
                            'exito' => false,
                            'mensaje' => 'Activo o QR no encontrado'
                        ];
                    }
                } catch (\Exception $e) {
                    $fallidas++;
                    $resultados[] = [
                        'id_activo' => $idActivo,
                        'exito' => false,
                        'mensaje' => $e->getMessage()
                    ];
                }

                // Pausa entre impresiones
                usleep(100000); // 100ms
            }

            return response()->json([
                'success' => $fallidas === 0,
                'total' => count($ids),
                'exitosas' => $exitosas,
                'fallidas' => $fallidas,
                'resultados' => $resultados
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar impresión batch: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Probar conexión con impresora Zebra
     * 
     * GET /api/HSS1/almacengeneral/printer/test
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function testConexion()
    {
        try {
            $resultado = $this->zebraService->testConexion();
            $configuracion = $this->zebraService->getConfiguracion();

            return response()->json([
                'success' => $resultado['success'],
                'message' => $resultado['message'],
                'configuracion' => $configuracion
            ], $resultado['success'] ? 200 : 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al probar conexión: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener configuración actual de impresora
     * 
     * GET /api/HSS1/almacengeneral/printer/config
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerConfiguracion()
    {
        try {
            $config = $this->zebraService->getConfiguracion();

            return response()->json([
                'success' => true,
                'data' => $config
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener configuración: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar vista previa ZPL (para debugging)
     * 
     * POST /api/HSS1/almacengeneral/printer/preview-zpl/{idActivo}
     * 
     * @param int $idActivo - ID del activo
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function previewZPL($idActivo)
    {
        try {
            $activo = ActivosFijos::findOrFail($idActivo);
            $qr = CodigosQRAF::where('id_activo_fijo', $idActivo)->first();

            if (!$qr) {
                return response()->json([
                    'success' => false,
                    'message' => 'QR no encontrado'
                ], 404);
            }

            $urlQR = $qr->url_destino ?? url("/activosfijos/qraf/{$qr->codigo_qr}");

            // Generar ZPL con el servicio
            $zpl = $this->zebraService->generarZPL(
                $urlQR,
                $activo->codigo_unico,
                $activo->nombre_af ?? 'Sin nombre',
            );

            return response()->json([
                'success' => true,
                'zpl' => $zpl,
                'activo' => [
                    'id' => $activo->id_activo_fijo,
                    'codigo' => $activo->codigo_etiqueta,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar preview: ' . $e->getMessage()
            ], 500);
        }
    }
}
