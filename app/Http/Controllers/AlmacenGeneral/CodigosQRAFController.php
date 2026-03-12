<?php

namespace App\Http\Controllers\AlmacenGeneral;

use App\Http\Controllers\Controller;
use App\Models\AlmacenGeneral\CodigosQRAF;
use App\Models\AlmacenGeneral\ActivosFijos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CodigosQRAFController extends Controller
{

    /**
     * Listar todos los códigos QRAF
     */
    public function index()
    {

        $response = ["success" => false, "data" => [], "message" => ""];

        try {
            $qraf = CodigosQRAF::all();

            if ($qraf->isEmpty()) {
                $response['message'] = 'No se encontraron códigos QR.';
            } else {
                $response['success'] = true;
                $response['data'] = $qraf;
            }

        } catch (\Exception $e) {
            $response['message'] = 'Error al obtener códigos QR: ' . $e->getMessage();
        }

        return response()->json($response, 200);
    }

    public function generarQR(Request $request, $idActivo)
    {
        // Usar el método estático del modelo que encapsula toda la lógica
        $resultado = CodigosQRAF::generarParaActivo($idActivo);

        // Si ya existía un QR activo, retornar con código 200 (no es error)
        if ($resultado['success'] && isset($resultado['data']['ya_existia']) && $resultado['data']['ya_existia']) {
            return response()->json($resultado, 200);
        }

        // Retornar el resultado con el código HTTP apropiado
        return response()->json($resultado, $resultado['success'] ? 201 : 500);
    }

    /**
     * Generar QR con logo de la empresa
     */
    public function generarQRConLogo(Request $request, $idActivo)
    {
        try {
            $activo = ActivosFijos::findOrFail($idActivo);
            $qr = CodigosQRAF::where('id_activo_fijo', $idActivo)->firstOrFail();

            // Ruta del logo (debe estar en storage/app/public/img/logo/logoNegro.png)
            $rutaLogo = storage_path('app/public/img/logo/logoNegro.png');

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

    
    public function escanearQR($codigoQR)
    {
        try {
            $qraf = CodigosQRAF::where('codigo_qr', $codigoQR)
                ->where('activo', true)
                ->firstOrFail();

            // Registrar el escaneo
            $qraf->registrarEscaneo();

            // Obtener información completa del activo desde la vista
            $activoVW = DB::table('almacengeneral.vw_movimientosafcompletos')
                ->where('id_activo_fijo', $qraf->id_activo_fijo)
                ->first();

            if (!$activoVW) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró información del activo.',
                ], 404);
            }

            // Ocultar la relación activoFijo en el objeto qraf para evitar duplicación
            $qraf->makeHidden('activoFijo');

            return response()->json([
                'success' => true,
                'data' => [
                    'qraf' => $qraf,
                    'activoVW' => $activoVW,
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
            $label = $activo->codigo_etiqueta;

            // Generar imagen QR con la nueva API
            $writer = new \Endroid\QrCode\Writer\PngWriter();
            
            $qrCode = new \Endroid\QrCode\QrCode(
                data: $qr->url_destino,
                encoding: new \Endroid\QrCode\Encoding\Encoding('UTF-8'),
                errorCorrectionLevel: \Endroid\QrCode\ErrorCorrectionLevel::High,
                size: 400,
                margin: 10,
                roundBlockSizeMode: \Endroid\QrCode\RoundBlockSizeMode::Margin,
                foregroundColor: new \Endroid\QrCode\Color\Color(0, 0, 0),
                backgroundColor: new \Endroid\QrCode\Color\Color(255, 255, 255)
            );

            $labelObj = new \Endroid\QrCode\Label\Label($label);

            $result = $writer->write($qrCode, null, $labelObj);

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