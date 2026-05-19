<?php

namespace App\Models\AlmacenGeneral;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstatusDepreciacionAF extends Model
{
	
	use HasFactory, HasApiTokens;

	protected $table = 'almacengeneral.tableRef_EstatusDepreciacionAF';
	protected $primaryKey = 'id_estatus_depreciacion';

	protected $fillable = [
		'descripcion_estatus_depreciacion',
	];
}
