<?php

namespace App\Models\AlmacenGeneral;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\TieneArchivos;


class FacturaAF extends Model
{
    use HasFactory, HasApiTokens, TieneArchivos;

    protected $table = 'almacengeneral.tableAF_Facturas'; // Nombre de la tabla
    protected $primaryKey = 'id_factura'; // Clave primaria

    protected $fillable = [
        'id_proveedor',
        'num_factura',
        'id_tipo_factura',
        'fecha_fac_emision',
        'fecha_fac_recepcion',
        'id_forma_pago',
        'id_tipo_moneda',
        'observaciones_factura',
        'subtotal_factura',
        'descuento_factura',
        'flete_factura',
        'iva_factura',
        'total_factura',
    ];

    // Relación con proveedores
    public function proveedor()
    {
        return $this->belongsTo(Proveedores::class, 'id_proveedor', 'id_proveedor');
    }
}
