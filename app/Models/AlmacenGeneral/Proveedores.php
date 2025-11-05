<?php

namespace App\Models\AlmacenGeneral;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proveedores extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'almacengeneral.tableAF_Proveedores'; // Especifica el nombre de la tabla
    protected $primaryKey = 'id_proveedor'; // Especifica el campo de la clave primaria

    protected $fillable = [
        'nombre_proveedor',
        'razon_social',
        'email_proveedor',
        'telefono_proveedor',
        'sitioWeb',
        'rfc',
        'id_tipo_moneda',
        'id_tipo_proveedor',
        'id_forma_pago',
        'id_tipo_regimen',
        'id_tipo_descuento',
        'id_tipo_facturacion',
        'estatus_activo',

    ];

    // Conversiones de tipos de campos
        protected $casts = [
            'estatus_activo' => 'boolean', // Convierte el campo 'estatus_activo' a booleano
        ];

}
