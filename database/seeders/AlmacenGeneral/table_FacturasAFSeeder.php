<?php

namespace Database\Seeders\AlmacenGeneral;

use Illuminate\Database\Seeder;
use App\Models\AlmacenGeneral\FacturaAF;

class table_FacturasAFSeeder extends Seeder
{
    public function run(): void
    {
        FacturaAF::create([
            'id_proveedor' => 1,
            'num_factura' => 'FAC-2025-00001',
            'id_tipo_factura' => 1,
            'fecha_fac_emision' => '2025-07-01',
            'fecha_fac_recepcion' => '2025-07-02',
            'id_forma_pago' => 1,
            'id_tipo_moneda' => 1,
            'observaciones_factura' => 'Compra de equipos de cómputo',
            'subtotal_factura' => 50000.00,
            'descuento_factura' => 2000.00,
            'flete_factura' => 500.00,
            'iva_factura' => 8000.00,
            'total_factura' => 56500.00,
        ]);

        FacturaAF::create([
            'id_proveedor' => 2,
            'num_factura' => 'FAC-2025-00002',
            'id_tipo_factura' => 2,
            'fecha_fac_emision' => '2025-07-10',
            'fecha_fac_recepcion' => '2025-07-11',
            'id_forma_pago' => 2,
            'id_tipo_moneda' => 1,
            'observaciones_factura' => 'Compra de mobiliario',
            'subtotal_factura' => 30000.00,
            'descuento_factura' => 1500.00,
            'flete_factura' => 300.00,
            'iva_factura' => 4800.00,
            'total_factura' => 33600.00,
        ]);

        FacturaAF::create([
            'id_proveedor' => 3,
            'num_factura' => 'FAC-2025-00003',
            'id_tipo_factura' => 1,
            'fecha_fac_emision' => '2025-07-15',
            'fecha_fac_recepcion' => '2025-07-16',
            'id_forma_pago' => 1,
            'id_tipo_moneda' => 2,
            'observaciones_factura' => 'Compra de equipo de red',
            'subtotal_factura' => 20000.00,
            'descuento_factura' => 1000.00,
            'flete_factura' => 200.00,
            'iva_factura' => 3200.00,
            'total_factura' => 22000.00,
        ]);
    }
}
