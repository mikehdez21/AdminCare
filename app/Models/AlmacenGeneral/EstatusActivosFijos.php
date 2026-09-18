<?php

namespace App\Models\AlmacenGeneral;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstatusActivosFijos extends Model
{
    use \App\Models\Concerns\UsesAlmacenGeneralTable;
    use HasFactory, HasApiTokens;

    protected $table = 'tableRef_EstatusAF';
    protected $primaryKey = 'id_estatusaf'; 

    protected $fillable = [
        'descripcion_estatusaf',
    ];

    
}
