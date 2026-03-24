<?php

namespace Database\Seeders\AlmacenGeneral;

use Illuminate\Database\Seeder;
use App\Models\AlmacenGeneral\FacturaAF;
use App\Models\AlmacenGeneral\FacturaActivos;

class table_FacturasAFSeeder extends Seeder
{
    public function run(): void
    {
        // Crear Factura 1
        $factura1 = FacturaAF::create([
            'id_proveedor' => 1,
            'num_factura' => 'FAC-2025-00001',
            'id_tipo_factura' => 1,
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

        // Asociar activos a la Factura 1 (Equipos de cómputo)
        FacturaActivos::create([
            'id_factura' => $factura1->id_factura,
            'id_activo_fijo' => 3, // Computadora HP
            'descuento_af' => 1000.00,
            'descuento_porcentajeaf' => 0.00, // 6.67% de descuento
            'observaciones_detalleaf' => 'Descuento por compra de 2 unidades'
        ]);

        FacturaActivos::create([
            'id_factura' => $factura1->id_factura,
            'id_activo_fijo' => 4, // Monitor Samsung
            'descuento_af' => 200.00,
            'descuento_porcentajeaf' => 5.71, // 5.71% de descuento
            'observaciones_detalleaf' => 'Descuento por volumen'
        ]);

        FacturaActivos::create([
            'id_factura' => $factura1->id_factura,
            'id_activo_fijo' => 11, // Servidor Dell
            'descuento_af' => 2000.00,
            'descuento_porcentajeaf' => 4.44, // 4.44% de descuento
            'observaciones_detalleaf' => 'Descuento corporativo'
        ]);

        // Crear Factura 2
        $factura2 = FacturaAF::create([
            'id_proveedor' => 2,
            'num_factura' => 'FAC-2025-00002',
            'id_tipo_factura' => 2,
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

        // Asociar activos a la Factura 2 (Mobiliario)
        FacturaActivos::create([
            'id_factura' => $factura2->id_factura,
            'id_activo_fijo' => 6, // Silla Ergonómica
            'descuento_af' => 140.00,
            'descuento_porcentajeaf' => 5.00, // 5% de descuento
            'observaciones_detalleaf' => 'Descuento por compra múltiple'
        ]);

        FacturaActivos::create([
            'id_factura' => $factura2->id_factura,
            'id_activo_fijo' => 7, // Escritorio Ejecutivo
            'descuento_af' => 400.00,
            'descuento_porcentajeaf' => 7.69, // 7.69% de descuento
            'observaciones_detalleaf' => 'Descuento especial'
        ]);

        FacturaActivos::create([
            'id_factura' => $factura2->id_factura,
            'id_activo_fijo' => 13, // Mesa de Juntas
            'descuento_af' => 400.00,
            'descuento_porcentajeaf' => 4.49, // 4.49% de descuento
            'observaciones_detalleaf' => 'Sin descuento adicional'
        ]);

        // Crear Factura 3
        $factura3 = FacturaAF::create([
            'id_proveedor' => 3,
            'num_factura' => 'FAC-2025-00003',
            'id_tipo_factura' => 1,
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

        // Asociar activos a la Factura 3 (Equipo de red)
        FacturaActivos::create([
            'id_factura' => $factura3->id_factura,
            'id_activo_fijo' => 18, // Switch Cisco
            'descuento_af' => 500.00,
            'descuento_porcentajeaf' => 3.23, // 3.23% de descuento
            'observaciones_detalleaf' => 'Descuento por pronto pago'
        ]);

        FacturaActivos::create([
            'id_factura' => $factura3->id_factura,
            'id_activo_fijo' => 15, // Teléfono IP Cisco
            'descuento_af' => 80.00,
            'descuento_porcentajeaf' => 2.86, // 2.86% de descuento
            'observaciones_detalleaf' => 'Descuento mínimo'
        ]);

        FacturaActivos::create([
            'id_factura' => $factura3->id_factura,
            'id_activo_fijo' => 17, // Cámara Hikvision
            'descuento_af' => 100.00,
            'descuento_porcentajeaf' => 2.63, // 2.63% de descuento
            'observaciones_detalleaf' => 'Descuento estándar'
        ]);
    }
}
