<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use App\Models\AlmacenGeneral\CodigosQRAF;
use App\Models\AlmacenGeneral\ActivosFijos;
use Illuminate\Http\Request;

class CodigosQRAFController extends Controller
{
    public function generarQR(Request $request, $idActivo)
    {
        try {
            $activo = ActivosFijos::findOrFail($idActivo);

            // Verificar si ya existe un QR para este activo
            $qrExistente = CodigosQRAF::where('id_activo_fijo', $idActivo)->first();
            
            if ($qrExistente && $qrExistente->activo) {
                return response()->json([
                    'success' => false,
                    'message' => 'El activo ya tiene un código QR activo.',
                    'data' => $qrExistente,
                ], 400);
            }

            // Generar código único
            $codigoQR = CodigosQRAF::generarCodigo($idActivo);
            $urlDestino = url("/activosfijos/qr/scan/{$codigoQR}");

            // Crear registro en la base de datos
            $qr = CodigosQRAF::create([
                'id_activo_fijo' => $idActivo,
                'codigo_qr' => $codigoQR,
                'url_destino' => $urlDestino,
            ]);

            // Generar imagen QR con etiqueta
            $label = $activo->codigo_interno . ' - ' . $activo->nombre_af;
            $imagenBase64 = $qr->generarImagenQR(300, $label);

            // Opcionalmente guardar en storage
            $rutaGuardada = $qr->guardarImagenQR('qr_codes/activos');

            return response()->json([
                'success' => true,
                'message' => 'Código QR generado exitosamente.',
                'data' => [
                    'qr' => $qr,
                    'imagen_base64' => $imagenBase64,
                    'url_imagen' => $qr->url_imagen_qr,
                    'ruta_guardada' => $rutaGuardada,
                ],
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar el código QR: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generar QR con logo de la empresa
     */
    public function generarQRConLogo(Request $request, $idActivo)
    {
        try {
            $activo = ActivosFijos::findOrFail($idActivo);
            $qr = CodigosQRAF::where('id_activo_fijo', $idActivo)->firstOrFail();

            // Ruta del logo (debe estar en storage/app/public/logos/empresa.png)
            $rutaLogo = storage_path('app/public/logos/empresa.png');

            if (!file_exists($rutaLogo)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Logo no encontrado en ' . $rutaLogo,
                ], 404);
            }

            $imagenBase64 = $qr->generarImagenQRConLogo($rutaLogo, 400);

            return response()->json([
                'success' => true,
                'data' => [
                    'qr' => $qr,
                    'imagen_base64' => $imagenBase64,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Escanear código QR y obtener información del activo
     */
    public function escanearQR($codigoQR)
    {
        try {
            $qr = CodigosQRAF::where('codigo_qr', $codigoQR)
                ->where('activo', true)
                ->firstOrFail();

            // Registrar el escaneo
            $qr->registrarEscaneo();

            // Obtener información del activo
            $activo = $qr->activoFijo;

            return response()->json([
                'success' => true,
                'data' => [
                    'activo' => $activo,
                    'qr' => $qr,
                    'escaneos_totales' => $qr->intentos_lectura,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Código QR no encontrado o inactivo.',
            ], 404);
        }
    }

    /**
     * Descargar imagen QR como archivo PNG
     */
    public function descargarQR($idActivo)
    {
        try {
            $qr = CodigosQRAF::where('id_activo_fijo', $idActivo)
                ->where('activo', true)
                ->firstOrFail();

            $activo = $qr->activoFijo;
            $label = $activo->codigo_interno . ' - ' . $activo->nombre_af;

            // Generar imagen QR
            $result = \Endroid\QrCode\Builder\Builder::create()
                ->writer(new \Endroid\QrCode\Writer\PngWriter())
                ->data($qr->url_destino)
                ->encoding(new \Endroid\QrCode\Encoding\Encoding('UTF-8'))
                ->errorCorrectionLevel(\Endroid\QrCode\ErrorCorrectionLevel::High)
                ->size(400)
                ->margin(10)
                ->labelText($label)
                ->labelAlignment(\Endroid\QrCode\Label\LabelAlignment::Center)
                ->build();

            return response($result->getString())
                ->header('Content-Type', 'image/png')
                ->header('Content-Disposition', 'attachment; filename="' . $qr->codigo_qr . '.png"');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al descargar QR: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Listar todos los códigos QR
     */
    public function index()
    {
        try {
            $qrs = CodigosQRAF::with('activoFijo')->activos()->get();

            return response()->json([
                'success' => true,
                'data' => $qrs,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Desactivar código QR
     */
    public function desactivar($idQR)
    {
        try {
            $qr = CodigosQRAF::findOrFail($idQR);
            $qr->desactivar();

            return response()->json([
                'success' => true,
                'message' => 'Código QR desactivado exitosamente.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}