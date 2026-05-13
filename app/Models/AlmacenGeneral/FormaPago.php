<?php

namespace App\Models\AlmacenGeneral;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormaPago extends Model
{
	use HasFactory, HasApiTokens;

	protected $table = 'almacengeneral.tableRef_FormasPago';
	protected $primaryKey = 'id_formapago';

	protected $fillable = [
		'descripcion_formaspago',
	];
}
