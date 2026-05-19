<?php

namespace App\Models\AlmacenGeneral;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class MetodoDepreciacion extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'almacengeneral.tableRef_MetodosDepreciacion';
    protected $primaryKey = 'id_metodo_depreciacion';

    protected $fillable = [
        'nombre_metodo',
        'descripcion_metodo',
        'formula',
        'tasa_default',
        'activo'
    ];

    public function activosFijos(): HasMany
    {
        return $this->hasMany(ActivosFijos::class, 'id_metodo_depreciacion');
    }
}
