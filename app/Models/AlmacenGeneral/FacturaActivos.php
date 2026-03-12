<?php

namespace App\Models\AlmacenGeneral;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FacturaActivos extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'almacengeneral.tableInter_FacturaActivos'; // Nombre de la tabla
    protected $primaryKey = 'id_facturaactivos'; // Clave primaria

    protected $fillable = [
        'id_factura',
        'id_activo_fijo',
        'precio_unitarioaf',
        'descuento_af',
        'descuento_porcentajeaf',
        'observaciones_detalleaf',
    ];

    // Relación con factura
    public function factura()
    {
        return $this->belongsTo(FacturaAF::class, 'id_factura', 'id_factura');
    }

    // Relación con activo fijo
    public function activoFijo()
    {
        return $this->belongsTo(ActivosFijos::class, 'id_activo_fijo', 'id_activo_fijo');
    }
}