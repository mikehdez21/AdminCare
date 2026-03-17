<?php

namespace App\Models\AlmacenGeneral;

use Illuminate\Database\Eloquent\Model;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Writer\SvgWriter;
use Endroid\QrCode\Color\Color;
use Endroid\QrCode\Label\Label;
use Endroid\QrCode\Logo\Logo;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Encoding\Encoding;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;


class CodigosQRAF extends Model
{
    protected $table = 'almacengeneral.tableAF_CodigosQR';
    protected $primaryKey = 'id_qraf';

    protected $fillable = [
        'id_activo_fijo',
        'codigo_qr',
        'url_destino',
        'fecha_generacion',
        'fecha_ultimo_escaneo',
        'activo',
        'intentos_lectura',
        'observaciones',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'fecha_generacion' => 'datetime',
        'fecha_ultimo_escaneo' => 'datetime',
    ];

    // Relación con activo fijo
    public function activoFijo()
    {
        return $this->belongsTo(ActivosFijos::class, 'id_activo_fijo', 'id_activo_fijo');
    }

    // Generar código QR único por activo considerando cantidad de mismo activo
    public static function generarCodigo($idActivo)
    {
        // Verificar que el activo existe
        $activo = ActivosFijos::findOrFail($idActivo);
        return (string) 'QR' . $activo->codigo_etiqueta;
    }

    /**
     * Generar QR completo para un activo fijo
     * Incluye: creación en BD, generación de imagen y guardado en storage
     * 
     * @param int $idActivo ID del activo fijo
     * @param bool $forzarNuevo Si es true, crea uno nuevo aunque ya exista uno activo
     * @return array ['success' => bool, 'message' => string, 'data' => array]
     */
    public static function generarParaActivo($idActivo, $forzarNuevo = false)
    {
        try {
            // Verificar que el activo existe
            $activo = ActivosFijos::findOrFail($idActivo);

            // Verificar si ya existe un QR activo
            $qrExistente = self::where('id_activo_fijo', $idActivo)
                ->where('activo', true)
                ->first();

            if ($qrExistente && !$forzarNuevo) {
                return [
                    'success' => true,
                    'message' => 'El activo ya tiene un código QR activo.',
                    'data' => [
                        'qraf' => $qrExistente,
                        'imagen_base64' => $qrExistente->generarImagenQR(300, $activo->codigo_etiqueta),
                        'url_imagen' => $qrExistente->url_imagen_qr,
                        'ya_existia' => true,
                    ],
                ];
            }

            // si se fuerza, desactiva anteriores
            if ($forzarNuevo) {
                self::where('id_activo_fijo', $idActivo)->where('activo', true)->update(['activo' => false]);
            }

            // Generar código único
            $codigoQR = self::generarCodigo($idActivo);
            $frontendUrl = rtrim((string) config('app.frontend_url', config('app.url')), '/');
            $urlDestino = $frontendUrl . '/activosfijos/qraf/' . rawurlencode($codigoQR);

            // Crear registro en la base de datos
            $qraf = self::create([
                'id_activo_fijo' => $idActivo,
                'codigo_qr' => $codigoQR,
                'url_destino' => $urlDestino,
                'fecha_generacion' => now(),
                'activo' => true,
            ]);

            // Generar imagen QR con etiqueta
            $label = $activo->codigo_etiqueta;
            $imagenBase64 = $qraf->generarImagenQR(300, $label);

            // Guardar en storage
            $rutaGuardada = $qraf->guardarImagenQR('qr_codes/activos');

            return [
                'success' => true,
                'message' => 'Código QR generado exitosamente.',
                'data' => [
                    'qraf' => $qraf,
                    'imagen_base64' => $imagenBase64,
                    'url_imagen' => $qraf->url_imagen_qr,
                    'ruta_guardada' => $rutaGuardada,
                    'ya_existia' => false,
                ],
            ];

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return [
                'success' => false,
                'message' => 'Activo fijo no encontrado.',
                'data' => null,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al generar el código QR: ' . $e->getMessage(),
                'data' => null,
            ];
        }
    }

    /**
     * Generar imagen QR usando endroid/qr-code v6
     * 
     * @param int $size Tamaño de la imagen (default: 300)
     * @param string|null $label Etiqueta opcional debajo del QR
     * @return string Base64 de la imagen PNG
     */
    public function generarImagenQR($size = 300, $label = null)
    {
        $writer = extension_loaded('gd') ? new PngWriter() : new SvgWriter();
        
        // Crear el código QR con todos los parámetros en el constructor
        $qrCode = new QrCode(
            data: $this->url_destino,
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: $size,
            margin: 10,
            roundBlockSizeMode: RoundBlockSizeMode::Margin,
            foregroundColor: new Color(0, 0, 0),
            backgroundColor: new Color(255, 255, 255)
        );

        // Agregar etiqueta si se proporciona
        $labelObj = null;
        if ($label) {
            $labelObj = new Label($label);
        }

        $result = $writer->write($qrCode, null, $labelObj);

        // Retorna base64 PNG cuando GD esta disponible y SVG cuando no.
        return base64_encode($result->getString());
    }

    /**
     * Guardar imagen QR en el storage
     * 
     * @param string $carpeta Carpeta donde guardar (default: qr_codes)
     * @return string Ruta del archivo guardado
     * @throws \Exception
     */
    public function guardarImagenQR($carpeta = 'qr_codes')
    {
        try {
            $disk = Storage::disk('public');
            
            // Crear el directorio si no existe (recursivo)
            if (!$disk->exists($carpeta)) {
                $dirCreado = $disk->makeDirectory($carpeta, 0755, true);
                Log::info("Directorio QR creado: {$carpeta}, resultado: " . ($dirCreado ? 'true' : 'false'));
            }

            $writer = extension_loaded('gd') ? new PngWriter() : new SvgWriter();
            
            // Crear el código QR con todos los parámetros en el constructor
            $qrCode = new QrCode(
                data: $this->url_destino,
                encoding: new Encoding('UTF-8'),
                errorCorrectionLevel: ErrorCorrectionLevel::High,
                size: 300,
                margin: 10,
                roundBlockSizeMode: RoundBlockSizeMode::Margin,
                foregroundColor: new Color(0, 0, 0),
                backgroundColor: new Color(255, 255, 255)
            );

            // Agregar etiqueta con el código QR
            $label = new Label($this->codigo_qr);

            $result = $writer->write($qrCode, null, $label);

            $extension = $writer instanceof PngWriter ? 'png' : 'svg';
            $nombreArchivo = $this->codigo_qr . '.' . $extension;
            $ruta = "{$carpeta}/{$nombreArchivo}";

            // Guardar en storage/app/public/qr_codes
            $contenido = $result->getString();
            $guardado = $disk->put($ruta, $contenido);
            
            if (!$guardado) {
                Log::error("Fallo al guardar QR", [
                    'ruta' => $ruta,
                    'codigo_qr' => $this->codigo_qr,
                    'tamaño_contenido' => strlen($contenido)
                ]);
                throw new \Exception("No se pudo guardar el archivo QR en: {$ruta}");
            }

            // Verificar que se guardó correctamente
            if (!$disk->exists($ruta)) {
                Log::error("Archivo QR no encontrado después de guardar", ['ruta' => $ruta]);
                throw new \Exception("El archivo QR no se guardó correctamente en: {$ruta}");
            }

            Log::info("QR guardado exitosamente", [
                'codigo_qr' => $this->codigo_qr,
                'ruta' => $ruta,
                'formato' => $extension,
                'tamaño' => $disk->size($ruta)
            ]);

            return $ruta;

        } catch (\Exception $e) {
            Log::error("Error al guardar imagen QR: " . $e->getMessage(), [
                'codigo_qr' => $this->codigo_qr,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Obtener URL pública de la imagen QR guardada
     * 
     * @return string|null URL pública o null si no existe
     */
    public function getUrlImagenQRAttribute()
    {
        $rutas = [
            "qr_codes/activos/{$this->codigo_qr}.png", // ruta actual
            "qr_codes/activos/{$this->codigo_qr}.svg", // fallback sin GD
            "qr_codes/{$this->codigo_qr}.png", // compatibilidad con registros antiguos
            "qr_codes/{$this->codigo_qr}.svg", // compatibilidad sin GD
        ];

        foreach ($rutas as $ruta) {
            if (Storage::disk('public')->exists($ruta)) {
                return Storage::url($ruta);
            }
        }

        return null;
    }

    /**
     * Generar QR con logo en el centro
     * 
     * @param string $rutaLogo Ruta del logo a insertar
     * @param int $size Tamaño de la imagen
     * @return string Base64 de la imagen PNG
     */
    public function generarImagenQRConLogo($rutaLogo, $size = 300)
    {
        $writer = new PngWriter();
        
        // Crear el código QR con todos los parámetros en el constructor
        $qrCode = new QrCode(
            data: $this->url_destino,
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: $size,
            margin: 10,
            roundBlockSizeMode: RoundBlockSizeMode::Margin,
            foregroundColor: new Color(0, 0, 0),
            backgroundColor: new Color(255, 255, 255)
        );

        // Agregar logo
        $logo = new Logo($rutaLogo, resizeToWidth: 50);

        // Agregar etiqueta
        $label = new Label($this->codigo_qr);

        $result = $writer->write($qrCode, $logo, $label);

        return base64_encode($result->getString());
    }

    /**
     * Registrar escaneo del código QR
     */
    public function registrarEscaneo()
    {
        $this->increment('intentos_lectura');
        $this->update(['fecha_ultimo_escaneo' => now()]);
    }

    /**
     * Desactivar código QR
     */
    public function desactivar()
    {
        $this->update(['activo' => false]);
    }

    /**
     * Reactivar código QR
     */
    public function reactivar()
    {
        $this->update(['activo' => true]);
    }

    /**
     * Scope para códigos QR activos
     */
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
}