<?php

namespace App\Models\AlmacenGeneral;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TiposFactura extends Model
{
    use \App\Models\Concerns\UsesAlmacenGeneralTable;
    use HasFactory, HasApiTokens;

    protected $table = 'tableRef_TiposFacturasAF';
    protected $primaryKey = 'id_tipofacturaaf';

    protected $fillable = [
        'nombre_tipofactura',
        'descripcion_tipofactura',
    ];
}
