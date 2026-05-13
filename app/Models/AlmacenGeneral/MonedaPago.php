<?php

namespace App\Models\AlmacenGeneral;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonedaPago extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'almacengeneral.tableRef_TiposMonedas';
    protected $primaryKey = 'id_tipomoneda';

    protected $fillable = [
        'descripcion_tipomoneda',
    ];
}
