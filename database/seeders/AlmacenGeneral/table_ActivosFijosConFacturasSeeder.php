<?php

namespace Database\Seeders\AlmacenGeneral;

use Illuminate\Database\Seeder;
use App\Models\AlmacenGeneral\ActivosFijos;
use App\Models\AlmacenGeneral\CodigosQRAF;
use App\Models\AlmacenGeneral\FacturaAF;
use App\Models\AlmacenGeneral\FacturaActivos;
use App\Models\AlmacenGeneral\MovimientosActivos;

class table_ActivosFijosConFacturasSeeder extends Seeder
{
    public function run(): void
    {
        // Factura unica con lotes por tipo de activo.
        $factura = FacturaAF::create([
            'id_proveedor' => 1,
            'num_factura' => 'FAC-2025-00001',
            'id_tipo_factura' => 1,
            'fecha_fac_recepcion' => '2025-07-02',
            'id_forma_pago' => 1,
            'id_tipo_moneda' => 1,
            'observaciones_factura' => 'Compra de telefonos, laptops y computadoras de escritorio por lotes',
            'subtotal_factura' => 76400.00,
            'descuento_factura' => 3640.00,
            'flete_factura' => 600.00,
            'iva_factura' => 11641.60,
            'total_factura' => 85001.60,
        ]);

        $activosFactura = [
            // L1: 3 telefonos
            [
                'nombre_af' => 'Telefono IP Cisco',
                'descripcion_af' => 'Telefono IP corporativo para extensiones internas',
                'modelo_af' => 'IP Phone 7841',
                'marca_af' => 'Cisco',
                'numero_serie_af' => 'TEL-L1-C1',
                'precio_unitario_af' => 2800.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'codigo_lote' => 'F1-TIPO1',
                'lote_afconsecutivo' => 1,
                'lote_total' => 3,
                'fecha_registro_af' => '2024-03-01',
                'observaciones_af' => 'Telefono lote 1 unidad 1 de 3',
                'precio_factura' => 2800.00,
                'descuento_af' => 140.00,
                'descuento_porcentajeaf' => 5.00,
            ],
            [
                'nombre_af' => 'Telefono IP Cisco',
                'descripcion_af' => 'Telefono IP corporativo para extensiones internas',
                'modelo_af' => 'IP Phone 7841',
                'marca_af' => 'Cisco',
                'numero_serie_af' => 'TEL-L1-C2',
                'precio_unitario_af' => 2800.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'codigo_lote' => 'F1-TIPO1',
                'lote_afconsecutivo' => 2,
                'lote_total' => 3,
                'fecha_registro_af' => '2024-03-01',
                'observaciones_af' => 'Telefono lote 1 unidad 2 de 3',
                'precio_factura' => 2800.00,
                'descuento_af' => 140.00,
                'descuento_porcentajeaf' => 5.00,
            ],
            [
                'nombre_af' => 'Telefono IP Cisco',
                'descripcion_af' => 'Telefono IP corporativo para extensiones internas',
                'modelo_af' => 'IP Phone 7841',
                'marca_af' => 'Cisco',
                'numero_serie_af' => 'TEL-L1-C3',
                'precio_unitario_af' => 2800.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'codigo_lote' => 'F1-TIPO1',
                'lote_afconsecutivo' => 3,
                'lote_total' => 3,
                'fecha_registro_af' => '2024-03-01',
                'observaciones_af' => 'Telefono lote 1 unidad 3 de 3',
                'precio_factura' => 2800.00,
                'descuento_af' => 140.00,
                'descuento_porcentajeaf' => 5.00,
            ],
            // L2: 2 laptops
            [
                'nombre_af' => 'Laptop Dell Latitude',
                'descripcion_af' => 'Equipo portatil para operaciones administrativas',
                'modelo_af' => 'Latitude 5420',
                'marca_af' => 'Dell',
                'numero_serie_af' => 'LAP-L2-C1',
                'precio_unitario_af' => 18000.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'codigo_lote' => 'F1-TIPO2',
                'lote_afconsecutivo' => 1,
                'lote_total' => 2,
                'fecha_registro_af' => '2024-04-05',
                'observaciones_af' => 'Laptop lote 2 unidad 1 de 2',
                'precio_factura' => 18000.00,
                'descuento_af' => 900.00,
                'descuento_porcentajeaf' => 5.00,
            ],
            [
                'nombre_af' => 'Laptop Dell Latitude',
                'descripcion_af' => 'Equipo portatil para operaciones administrativas',
                'modelo_af' => 'Latitude 5420',
                'marca_af' => 'Dell',
                'numero_serie_af' => 'LAP-L2-C2',
                'precio_unitario_af' => 18000.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'codigo_lote' => 'F1-TIPO2',
                'lote_afconsecutivo' => 2,
                'lote_total' => 2,
                'fecha_registro_af' => '2024-04-05',
                'observaciones_af' => 'Laptop lote 2 unidad 2 de 2',
                'precio_factura' => 18000.00,
                'descuento_af' => 900.00,
                'descuento_porcentajeaf' => 5.00,
            ],
            // L3: 4 computadoras de escritorio
            [
                'nombre_af' => 'Computadora de Escritorio HP',
                'descripcion_af' => 'Computadora de escritorio para oficina',
                'modelo_af' => 'EliteDesk 800 G4',
                'marca_af' => 'HP',
                'numero_serie_af' => 'CPU-L3-C1',
                'precio_unitario_af' => 15000.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'codigo_lote' => 'F1-TIPO3',
                'lote_afconsecutivo' => 1,
                'lote_total' => 4,
                'fecha_registro_af' => '2024-03-01',
                'observaciones_af' => 'Escritorio lote 3 unidad 1 de 4',
                'precio_factura' => 15000.00,
                'descuento_af' => 750.00,
                'descuento_porcentajeaf' => 5.00,
            ],
            [
                'nombre_af' => 'Computadora de Escritorio HP',
                'descripcion_af' => 'Computadora de escritorio para oficina',
                'modelo_af' => 'EliteDesk 800 G4',
                'marca_af' => 'HP',
                'numero_serie_af' => 'CPU-L3-C2',
                'precio_unitario_af' => 15000.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'codigo_lote' => 'F1-TIPO3',
                'lote_afconsecutivo' => 2,
                'lote_total' => 4,
                'fecha_registro_af' => '2024-03-01',
                'observaciones_af' => 'Escritorio lote 3 unidad 2 de 4',
                'precio_factura' => 15000.00,
                'descuento_af' => 750.00,
                'descuento_porcentajeaf' => 5.00,
            ],
            [
                'nombre_af' => 'Computadora de Escritorio HP',
                'descripcion_af' => 'Computadora de escritorio para oficina',
                'modelo_af' => 'EliteDesk 800 G4',
                'marca_af' => 'HP',
                'numero_serie_af' => 'CPU-L3-C3',
                'precio_unitario_af' => 15000.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'codigo_lote' => 'F1-TIPO3',
                'lote_afconsecutivo' => 3,
                'lote_total' => 4,
                'fecha_registro_af' => '2024-03-01',
                'observaciones_af' => 'Escritorio lote 3 unidad 3 de 4',
                'precio_factura' => 15000.00,
                'descuento_af' => 750.00,
                'descuento_porcentajeaf' => 5.00,
            ],
            [
                'nombre_af' => 'Computadora de Escritorio HP',
                'descripcion_af' => 'Computadora de escritorio para oficina',
                'modelo_af' => 'EliteDesk 800 G4',
                'marca_af' => 'HP',
                'numero_serie_af' => 'CPU-L3-C4',
                'precio_unitario_af' => 15000.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'codigo_lote' => 'F1-TIPO3',
                'lote_afconsecutivo' => 4,
                'lote_total' => 4,
                'fecha_registro_af' => '2024-03-01',
                'observaciones_af' => 'Escritorio lote 3 unidad 4 de 4',
                'precio_factura' => 15000.00,
                'descuento_af' => 750.00,
                'descuento_porcentajeaf' => 5.00,
            ],
        ];

        foreach ($activosFactura as $lineaIndex => $datos) {
            $this->crearActivoDesdeFactura($factura, $datos, $lineaIndex, 'Activo de factura unica por lote y tipo');
        }
    }

    private function crearActivoDesdeFactura(FacturaAF $factura, array $datos, int $lineaIndex, string $observacionDetalle = 'Creado a través de factura de compra'): void
    {
        $descuentoAf = $datos['descuento_af'];
        $descuentoPorcentaje = $datos['descuento_porcentajeaf'];
        unset($datos['precio_factura'], $datos['descuento_af'], $datos['descuento_porcentajeaf']);

        $numeroLote = $lineaIndex + 1;
        if (!empty($datos['codigo_lote']) && preg_match('/(?:TIPO|LT)(\d+)/', (string) $datos['codigo_lote'], $coincidencias)) {
            $numeroLote = (int) $coincidencias[1];
        }
        $consecutivoLote = (int) ($datos['lote_afconsecutivo'] ?? 1);
        $totalLote = (int) ($datos['lote_total'] ?? 1);

        $datos['codigo_lote'] = $datos['codigo_lote'] ?? ('LT' . $numeroLote . '-F' . $factura->id_factura);
        $datos['lote_afconsecutivo'] = $consecutivoLote;
        $datos['lote_total'] = $totalLote;

        // Igual que FacturaController: crear sin QR, actualizar etiqueta y luego generar QR final.
        $resultado = ActivosFijos::crearConQR($datos, false);

        if (!$resultado['success']) {
            throw new \RuntimeException('Error al crear activo en seeder: ' . ($resultado['message'] ?? 'Error desconocido'));
        }

        $activo = $resultado['data'] ?? $resultado['activo'] ?? null;
        if (!$activo || !isset($activo->id_activo_fijo)) {
            throw new \RuntimeException('Respuesta inválida al crear activo fijo en seeder.');
        }

        $activo->codigo_etiqueta = sprintf(
            '%s-F%d-L%d-C%d-LT%d',
            $activo->codigo_unico,
            $factura->id_factura,
            $numeroLote,
            $consecutivoLote,
            $totalLote
        );
        $activo->save();

        $resultadoQRFinal = CodigosQRAF::generarParaActivo($activo->id_activo_fijo, true);
        if (!$resultadoQRFinal['success']) {
            throw new \RuntimeException('Error al generar QR final en seeder: ' . ($resultadoQRFinal['message'] ?? 'Error desconocido'));
        }

        FacturaActivos::create([
            'id_factura' => $factura->id_factura,
            'id_activo_fijo' => $activo->id_activo_fijo,
            'descuento_af' => $descuentoAf,
            'descuento_porcentajeaf' => $descuentoPorcentaje,
            'observaciones_detalleaf' => $observacionDetalle,
        ]);

        // Crear movimiento de asignación inicial al crear el activo
        MovimientosActivos::create([
            'id_activo_fijo' => $activo->id_activo_fijo,
            'id_tipo_movimiento' => 1, // Tipo de movimiento: Asignación
            'motivo_movimiento' => 'Asignación inicial al crear activo fijo',
            'fecha_movimiento' => now()->format('Y-m-d'),
            'id_responsable_anterior' => null,
            'id_responsable_actual' => 1,
            'id_ubicacion_anterior' => null,
            'id_ubicacion_actual' => 1,
        ]);
    }
}
