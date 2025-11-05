<?php

namespace App\Models\AlmacenGeneral;

use Illuminate\Database\Eloquent\Model;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Label\LabelAlignment;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\RoundBlockSizeMode;
use Illuminate\Support\Facades\Storage;

class CodigosQRAF extends Model
{
    protected $table = 'almacengeneral.tableAF_CodigosQR';
    protected $primaryKey = 'id_qr';
    public $timestamps = false;

    protected $fillable = [
        'id_activo_fijo',
        'codigo_qr',
        'url_destino',
        'activo',
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

    // Generar código QR único
    public static function generarCodigo($idActivo)
    {
        return 'QR-AF-' . str_pad($idActivo, 6, '0', STR_PAD_LEFT) . '-' . date('Y');
    }

    /**
     * Generar imagen QR usando endroid/qr-code
     * 
     * @param int $size Tamaño de la imagen (default: 300)
     * @param string|null $label Etiqueta opcional debajo del QR
     * @return string Base64 de la imagen PNG
     */
    public function generarImagenQR($size = 300, $label = null)
    {
        $builder = Builder::create()
            ->writer(new PngWriter())
            ->writerOptions([])
            ->data($this->url_destino)
            ->encoding(new Encoding('UTF-8'))
            ->errorCorrectionLevel(ErrorCorrectionLevel::High)
            ->size($size)
            ->margin(10)
            ->roundBlockSizeMode(RoundBlockSizeMode::Margin);

        // Agregar etiqueta si se proporciona
        if ($label) {
            $builder->labelText($label)
                ->labelAlignment(LabelAlignment::Center);
        }

        $result = $builder->build();

        // Retornar como base64
        return base64_encode($result->getString());
    }

    /**
     * Guardar imagen QR en el storage
     * 
     * @param string $carpeta Carpeta donde guardar (default: qr_codes)
     * @return string Ruta del archivo guardado
     */
    public function guardarImagenQR($carpeta = 'qr_codes')
    {
        $result = Builder::create()
            ->writer(new PngWriter())
            ->data($this->url_destino)
            ->encoding(new Encoding('UTF-8'))
            ->errorCorrectionLevel(ErrorCorrectionLevel::High)
            ->size(300)
            ->margin(10)
            ->roundBlockSizeMode(RoundBlockSizeMode::Margin)
            ->labelText($this->codigo_qr)
            ->labelAlignment(LabelAlignment::Center)
            ->build();

        $nombreArchivo = $this->codigo_qr . '.png';
        $ruta = "{$carpeta}/{$nombreArchivo}";

        // Guardar en storage/app/public/qr_codes
        Storage::disk('public')->put($ruta, $result->getString());

        return $ruta;
    }

    /**
     * Obtener URL pública de la imagen QR guardada
     * 
     * @return string|null URL pública o null si no existe
     */
    public function getUrlImagenQRAttribute()
    {
        $ruta = "qr_codes/{$this->codigo_qr}.png";
        
        if (Storage::disk('public')->exists($ruta)) {
            return Storage::disk('public')->url($ruta);
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
        $result = Builder::create()
            ->writer(new PngWriter())
            ->data($this->url_destino)
            ->encoding(new Encoding('UTF-8'))
            ->errorCorrectionLevel(ErrorCorrectionLevel::High)
            ->size($size)
            ->margin(10)
            ->roundBlockSizeMode(RoundBlockSizeMode::Margin)
            ->logoPath($rutaLogo)
            ->logoResizeToWidth(50)
            ->labelText($this->codigo_qr)
            ->labelAlignment(LabelAlignment::Center)
            ->build();

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