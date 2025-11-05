<?php

namespace App\Http\Controllers\FillTypes\AlmacenGeneral;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class TypesProveedorController extends Controller
{
    public function getTiposProveedor()
    {
        try {
            $API_tiposproveedor = DB::table('almacengeneral.tableRef_TiposProveedor')
                ->select('id_tipoproveedor', 'descripcion_tipoproveedor')
                ->get();


            return response()->json([
                'success' => true,
                'API_Response' => $API_tiposproveedor,
                'message' => 'DatosAPI - TiposProveedor'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los tipos de proveedor.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getFormasPago()
    {
        try {
            $API_formaspago = DB::table('almacengeneral.tableRef_FormasPago')
                ->select('id_formapago', 'descripcion_formaspago')
                ->get();

            return response()->json([
                'success' => true,
                'API_Response' => $API_formaspago,
                'message' => 'DatosAPI - FormasPago'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las formas de pago.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getTiposRegimen()
    {
        try {
            $API_regimenfiscal = DB::table('almacengeneral.tableRef_RegimenFiscales')
                ->select('id_regimenfiscal', 'descripcion_regimenfiscal')
                ->get();

            return response()->json([
                'success' => true,
                'API_Response' => $API_regimenfiscal,
                'message' => 'DatosAPI - RegimenFiscal'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los regimenes fiscales.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getDescuentosProveedor()
    {
        try {
            $API_descuentoproveedor = DB::table('almacengeneral.tableRef_DescuentoProveedor')
                ->select('id_descuento_proveedor', 'descripcion_descuentoproveedor')
                ->get();

            return response()->json([
                'success' => true,
                'API_Response' => $API_descuentoproveedor,
                'message' => 'DatosAPI - DescuentoProveedor'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los descuentos del proveedor.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getTiposFacturacion()
    {
        try {
            $API_tiposfacturacion = DB::table('almacengeneral.tableRef_TiposFacturacion')
                ->select('id_tipofacturacion', 'descripcion_tipofacturacion')
                ->get();

            return response()->json([
                'success' => true,
                'API_Response' => $API_tiposfacturacion,
                'message' => 'DatosAPI - TiposFacturacion'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los tipos de facturación.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getTiposMoneda()
    {
        try {
            $API_tiposmoneda = DB::table('almacengeneral.tableRef_TiposMonedas')
                ->select('id_tipomoneda', 'descripcion_tipomoneda')
                ->get();

            return response()->json([
                'success' => true,
                'API_Response' => $API_tiposmoneda,
                'message' => 'DatosAPI - TiposMoneda'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los tipos de moneda.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
