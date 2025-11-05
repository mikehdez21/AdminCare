<?php

namespace App\Http\Controllers\FillTypes\AlmacenGeneral;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class TypesFacturaController extends Controller
{
    public function getTiposFacturas()
    {
        try {
            $API_tiposfacturas = DB::table('almacengeneral.tableRef_TiposFacturasAF')
                ->select('id_tipofacturaaf', 'nombre_tipofactura')
                ->get();

            return response()->json([
                'success' => true,
                'API_Response' => $API_tiposfacturas,
                'message' => 'DatosAPI - TiposFacturas'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los tipos de factura.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
