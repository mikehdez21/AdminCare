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
    use \App\Models\Concerns\UsesAlmacenGeneralTable;
    protected $table = 'tableAF_CodigosQR';
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

    private static function demoDisabled(): ?array
    {
        if (config('app.demo_mode')) {
            return ['success' => false, 'message' => 'La generación de QR no está disponible en la demo.', 'data' => null];
        }

        return null;
    }

    private static function assertGenerationEnabled(): void
    {
        if (config('app.demo_mode')) {
            throw new \RuntimeException('La generación de QR no está disponible en la demo.');
        }
    }

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
     * Generar QR completo para un activo fijo que fue removido de una factura
     *
     * @param int $idActivo ID del activo fijo
     * @return array ['success' => bool, 'message' => string, 'data' => array]
     */
    public static function generarQRActivoSinFactura($idActivo)
    {
        if ($disabled = self::demoDisabled()) {
            return $disabled;
        }
        try {
            $activo = ActivosFijos::findOrFail($idActivo);


            // Generar código único
            $codigoQR = 'QR' . $activo->codigo_unico . '-SINFACTURA';
            $appUrl = rtrim((string) config('app.url'), '/');
            $urlDestino = $appUrl . '/activosfijos/qraf/' . rawurlencode($codigoQR);

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
            $rutaGuardada = null;
            $warning = null;

            try {
                $rutaGuardada = $qraf->guardarImagenQR('qr_codes/activos');
            } catch (\Exception $storageException) {
                $warning = 'QR generado, pero no se pudo guardar el archivo en storage.';

                Log::warning($warning, [
                    'id_activo_fijo' => $idActivo,
                    'codigo_qr' => $codigoQR,
                    'exception' => get_class($storageException),
                ]);
            }

            return [
                'success' => true,
                'message' => $warning ?: 'Código QR generado exitosamente.',
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
            Log::error('QR generation failed.', ['exception' => get_class($e), 'id_activo_fijo' => $idActivo]);
            return [
                'success' => false,
                'message' => 'No fue posible generar el código QR.',
                'data' => null,
            ];
        }
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
        if ($disabled = self::demoDisabled()) {
            return $disabled;
        }
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
            $appUrl = rtrim((string) config('app.url'), '/');
            $urlDestino = $appUrl . '/activosfijos/qraf/' . rawurlencode($codigoQR);

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
            $rutaGuardada = null;
            $warning = null;

            try {
                $rutaGuardada = $qraf->guardarImagenQR('qr_codes/activos');
            } catch (\Exception $storageException) {
                $warning = 'QR generado, pero no se pudo guardar el archivo en storage.';

                Log::warning($warning, [
                    'id_activo_fijo' => $idActivo,
                    'codigo_qr' => $codigoQR,
                    'exception' => get_class($storageException),
                ]);
            }

            return [
                'success' => true,
                'message' => $warning ?: 'Código QR generado exitosamente.',
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
            Log::error('QR generation failed.', ['exception' => get_class($e), 'id_activo_fijo' => $idActivo]);
            return [
                'success' => false,
                'message' => 'No fue posible generar el código QR.',
                'data' => null,
            ];
        }
    }

    /**
     * Regenerar QR completo para un activo fijo que fue removido de una factura
     *
     * @param int $idActivo ID del activo fijo
     * @return array ['success' => bool, 'message' => string, 'data' => array]
     */
    public static function regenerarQRActivoSinFactura($idActivo)
    {
        if ($disabled = self::demoDisabled()) {
            return $disabled;
        }
        try {
            $activo = ActivosFijos::findOrFail($idActivo);


            // Generar código único
            $codigoQR = 'QR' . $activo->codigo_unico . '-SINFACTURA';
            $appUrl = rtrim((string) config('app.url'), '/');
            $urlDestino = $appUrl . '/activosfijos/qraf/' . rawurlencode($codigoQR);

            // buscar QR en BD y actualizar solo el campo codigo_qr y url_destino
            // Verificar si ya existe un QR activo
            $qrExistente = self::where('id_activo_fijo', $idActivo)
                ->where('activo', true)
                ->first();

            $qrExistente->codigo_qr = $codigoQR;
            $qrExistente->url_destino = $urlDestino;
            $qrExistente->save();

            // Generar imagen QR con etiqueta
            $label = $activo->codigo_etiqueta;
            $imagenBase64 = $qrExistente->generarImagenQR(300, $label);

            // Guardar en storage
            $rutaGuardada = null;
            $warning = null;

            try {
                $rutaGuardada = $qrExistente->guardarImagenQR('qr_codes/activos');
            } catch (\Exception $storageException) {
                $warning = 'QR generado, pero no se pudo guardar el archivo en storage.';

                Log::warning($warning, [
                    'id_activo_fijo' => $idActivo,
                    'codigo_qr' => $codigoQR,
                    'exception' => get_class($storageException),
                ]);
            }

            return [
                'success' => true,
                'message' => $warning ?: 'Código QR generado exitosamente.',
                'data' => [
                    'qraf' => $qrExistente,
                    'imagen_base64' => $imagenBase64,
                    'url_imagen' => $qrExistente->url_imagen_qr,
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
                'message' => 'No fue posible generar el código QR.',
                'data' => null,
            ];
        }
    }

    /**
     * Regenerar QR completo para un activo fijo que ha sido asociado a una factura
     * y ha cambiado su etiqueta/código de lote.
     *
     * @param int $idActivo ID del activo fijo
     * @return array ['success' => bool, 'message' => string, 'data' => array|null]
     */
    public static function regenerarQRActivoConFactura($idActivo)
    {
        if ($disabled = self::demoDisabled()) {
            return $disabled;
        }
        try {
            $activo = ActivosFijos::findOrFail($idActivo);

            // El código QR se genera basado en la etiqueta actual del activo, que ya debería tener el formato correcto
            // para el lote/factura actual, por ejemplo 'ABC123-F1-L5-C1-LT2' (generado en FacturaController@update)
            $codigoQR = 'QR' . $activo->codigo_etiqueta; // Usa el codigo_etiqueta actualizado del activo

            $appUrl = rtrim((string) config('app.url'), '/');
            $urlDestino = $appUrl . '/activosfijos/qraf/' . rawurlencode($codigoQR);

            // Buscar el QR existente activo para este activo
            $qrExistente = self::where('id_activo_fijo', $idActivo)->where('activo', true)->first();

            if (!$qrExistente) {
                // Opcional: Si no hay QR activo, podrías querer crear uno nuevo en lugar de fallar.
                // Para consistencia con la idea de "regenerar", asumiremos que debería existir.
                // Si quieres crear uno nuevo si no existe, cambia este comportamiento.
                return [
                    'success' => false,
                    'message' => 'No se encontró un código QR activo para regenerar.',
                    'data' => null,
                ];
                // O para crear uno nuevo si no existe:
                // return self::generarParaActivo($idActivo, true); // Asumiendo que generarParaActivo maneja correctamente la creación si no existe
            }

            // Actualizar los campos del QR existente
            $qrExistente->codigo_qr = $codigoQR;
            $qrExistente->url_destino = $urlDestino;
            $qrExistente->fecha_generacion = now(); // Opcional: Actualizar fecha de generación
            // 'activo' se mantiene en true
            $qrExistente->save();

            // Generar la nueva imagen QR con la etiqueta actualizada
            $label = $activo->codigo_etiqueta; // Etiqueta actualizada
            $imagenBase64 = $qrExistente->generarImagenQR(300, $label);

            $rutaGuardada = null;
            $warning = null;
            try {
                $rutaGuardada = $qrExistente->guardarImagenQR('qr_codes/activos'); // Opcional: ruta específica
            } catch (\Exception $storageException) {
                $warning = 'Advertencia: no se pudo guardar la imagen QR en disco.';
                Log::warning('QR image persistence failed.', ['exception' => get_class($storageException), 'id_activo_fijo' => $idActivo]);
                // Log::warning($warning, ['id_activo_fijo' => $idActivo, 'exception' => $storageException]);
            }

            return [
                'success' => true,
                'message' => 'Código QR regenerado exitosamente.',
                'data' => [
                    'id_codigo_qr' => $qrExistente->id_codigo_qr,
                    'codigo_qr' => $qrExistente->codigo_qr,
                    'url_destino' => $qrExistente->url_destino,
                    'imagen_base64' => $imagenBase64,
                    'ruta_guardada' => $rutaGuardada,
                    'warning' => $warning,
                ]
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'No fue posible regenerar el código QR.',
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
        self::assertGenerationEnabled();
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
        // Defense in depth: legacy callers must not create directories or write
        // files in DEMO_MODE, even when they bypass the controller/model guards.
        self::assertGenerationEnabled();
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
            Log::error('Error al guardar imagen QR.', [
                'codigo_qr' => $this->codigo_qr,
                'exception' => get_class($e),
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
        self::assertGenerationEnabled();
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
