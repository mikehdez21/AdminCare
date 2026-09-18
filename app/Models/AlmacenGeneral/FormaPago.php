<?php

namespace App\Models\AlmacenGeneral;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormaPago extends Model
{
    use \App\Models\Concerns\UsesAlmacenGeneralTable;
	use HasFactory, HasApiTokens;

	protected $table = 'tableRef_FormasPago';
	protected $primaryKey = 'id_formapago';

	protected $fillable = [
		'descripcion_formaspago',
	];
}
