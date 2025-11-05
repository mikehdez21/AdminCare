<?php

namespace App\Models\AlmacenGeneral;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ArchivosDigitales extends Model
{
    protected $table = 'almacengeneral.tableAF_ArchivosDigitales';
    protected $primaryKey = 'id_adjunto';

    protected $fillable = [
        'nombre_original',
        'nombre_almacenado',
        'tipo_contenido',
        'tamano',
        'ruta_archivo',
        'descripcion',
        'tabla_referencia',
        'id_referencia',
        'id_usuario_subida',
        'fecha_subida',
        'activo',
        'metadata',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'fecha_subida' => 'datetime',
        'metadata' => 'array',
    ];

    // Relación con usuario que subió
    public function usuarioSubida()
    {
        return $this->belongsTo(\App\Models\Usuarios::class, 'id_usuario_subida', 'id_usuario');
    }

    // Relación polimórfica dinámica
    public function referencia()
    {
        $modelMap = [
            'facturas' => FacturaAF::class,
            'activos' => ActivosFijos::class,
            'bajas_activos' => BajasActivos::class,
            'responsivas' => Responsiva::class,
        ];

        $modelClass = $modelMap[$this->tabla_referencia] ?? null;

        if ($modelClass) {
            return $this->belongsTo($modelClass, 'id_referencia', 'id');
        }

        return null;
    }

    // Obtener URL pública del archivo
    public function getUrlAttribute()
    {
        return Storage::url($this->ruta_archivo);
    }

    // Obtener tamaño formateado
    public function getTamanoFormateadoAttribute()
    {
        $bytes = $this->tamano;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    // Eliminar archivo físico del servidor
    public function eliminarArchivo()
    {
        if (Storage::exists($this->ruta_archivo)) {
            Storage::delete($this->ruta_archivo);
        }
    }

    // Scope para filtrar por tabla de referencia
    public function scopePorTabla($query, $tabla)
    {
        return $query->where('tabla_referencia', $tabla);
    }

    // Scope para filtrar por referencia específica
    public function scopePorReferencia($query, $tabla, $id)
    {
        return $query->where('tabla_referencia', $tabla)
                     ->where('id_referencia', $id);
    }
}