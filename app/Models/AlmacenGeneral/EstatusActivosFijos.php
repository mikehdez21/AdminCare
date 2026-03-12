<?php

namespace App\Models\AlmacenGeneral;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstatusActivosFijos extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'almacengeneral.tableRef_EstatusAF'; 
    protected $primaryKey = 'id_estatusaf'; 

    protected $fillable = [
        'descripcion_estatusaf',
    ];

    
}