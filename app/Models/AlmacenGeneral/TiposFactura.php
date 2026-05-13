<?php

namespace App\Models\AlmacenGeneral;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TiposFactura extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'almacengeneral.tableRef_TiposFacturasAF';
    protected $primaryKey = 'id_tipofacturaaf';

    protected $fillable = [
        'nombre_tipofactura',
        'descripcion_tipofactura',
    ];
}
