<?php

namespace Database\Seeders\AlmacenGeneral;

use Illuminate\Database\Seeder;
use App\Models\AlmacenGeneral\ActivosFijos;
use App\Models\AlmacenGeneral\CodigosQRAF;
use App\Models\AlmacenGeneral\FacturaAF;
use App\Models\AlmacenGeneral\FacturaActivos;

class table_ActivosFijosConFacturasSeeder extends Seeder
{
    public function run(): void
    {
        // ========================================
        // FACTURA 1: Equipos de Cómputo
        // ========================================
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

        // Crear activos para Factura 1
        $datosActivos1 = [
            [
                'nombre_af' => 'Computadora de Escritorio HP',
                'descripcion_af' => 'Computadora de escritorio para oficina',
                'modelo_af' => 'EliteDesk 800 G4',
                'marca_af' => 'HP',
                'numero_serie_af' => 'HP001234',
                'precio_unitario_af' => 15000.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'fecha_registro_af' => '2024-03-01',
                'observaciones_af' => 'Equipo de cómputo asignado al área administrativa',
                'precio_factura' => 15000.00,
                'descuento_af' => 1000.00,
                'descuento_porcentajeaf' => 6.67,
            ],
            [
                'nombre_af' => 'Monitor LED Samsung',
                'descripcion_af' => 'Monitor LED de 24 pulgadas',
                'modelo_af' => 'S24F350FH',
                'marca_af' => 'Samsung',
                'numero_serie_af' => 'SAM5678',
                'precio_unitario_af' => 3500.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'fecha_registro_af' => '2024-03-05',
                'observaciones_af' => 'Monitor complementario para estación de trabajo',
                'precio_factura' => 3500.00,
                'descuento_af' => 200.00,
                'descuento_porcentajeaf' => 5.71,
            ],
            [
                'nombre_af' => 'Servidor Dell PowerEdge',
                'descripcion_af' => 'Servidor para infraestructura TI',
                'modelo_af' => 'PowerEdge T140',
                'marca_af' => 'Dell',
                'numero_serie_af' => 'DELL5678',
                'precio_unitario_af' => 45000.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'fecha_registro_af' => '2024-05-05',
                'observaciones_af' => 'Servidor principal del sistema informático',
                'precio_factura' => 45000.00,
                'descuento_af' => 2000.00,
                'descuento_porcentajeaf' => 4.44,
            ],
        ];

        foreach ($datosActivos1 as $lineaIndex => $datos) {
            $this->crearActivoDesdeFactura($factura1, $datos, $lineaIndex);
        }

        // ========================================
        // FACTURA 2: Mobiliario
        // ========================================
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

        $datosActivos2 = [
            [
                'nombre_af' => 'Silla Ergonómica de Oficina',
                'descripcion_af' => 'Silla ejecutiva con soporte lumbar',
                'modelo_af' => 'Executive Pro',
                'marca_af' => 'OfficeMax',
                'numero_serie_af' => 'OM3456',
                'precio_unitario_af' => 2800.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 2,
                'fecha_registro_af' => '2024-03-15',
                'observaciones_af' => 'Mobiliario ergonómico para estación de trabajo',
                'precio_factura' => 2800.00,
                'descuento_af' => 140.00,
                'descuento_porcentajeaf' => 5.00,
            ],
            [
                'nombre_af' => 'Escritorio Ejecutivo',
                'descripcion_af' => 'Escritorio de madera con cajones',
                'modelo_af' => 'Ejecutivo 150',
                'marca_af' => 'Muebles Modernos',
                'numero_serie_af' => 'MM7890',
                'precio_unitario_af' => 5200.00,
                'af_propio' => false,
                'id_estado_af' => 1,
                'id_clasificacion' => 2,
                'fecha_registro_af' => '2024-04-01',
                'observaciones_af' => 'Mobiliario principal de oficina ejecutiva',
                'precio_factura' => 5200.00,
                'descuento_af' => 400.00,
                'descuento_porcentajeaf' => 7.69,
            ],
            [
                'nombre_af' => 'Mesa de Juntas',
                'descripcion_af' => 'Mesa de reuniones para 8 personas',
                'modelo_af' => 'Ejecutiva 240x120',
                'marca_af' => 'Muebles Modernos',
                'numero_serie_af' => 'MM1234',
                'precio_unitario_af' => 8900.00,
                'af_propio' => false,
                'id_estado_af' => 1,
                'id_clasificacion' => 2,
                'fecha_registro_af' => '2024-06-01',
                'observaciones_af' => 'Mobiliario para sala de juntas',
                'precio_factura' => 8900.00,
                'descuento_af' => 400.00,
                'descuento_porcentajeaf' => 4.49,
            ],
        ];

        foreach ($datosActivos2 as $lineaIndex => $datos) {
            $this->crearActivoDesdeFactura($factura2, $datos, $lineaIndex);
        }

        // ========================================
        // FACTURA 3: Equipo de Red
        // ========================================
        $factura3 = FacturaAF::create([
            'id_proveedor' => 3,
            'num_factura' => 'FAC-2025-00003',
            'id_tipo_factura' => 1,
            'fecha_fac_recepcion' => '2025-07-16',
            'id_forma_pago' => 1,
            'id_tipo_moneda' => 2,
            'observaciones_factura' => 'Compra de equipo de red e infraestructura',
            'subtotal_factura' => 20000.00,
            'descuento_factura' => 1000.00,
            'flete_factura' => 200.00,
            'iva_factura' => 3200.00,
            'total_factura' => 22000.00,
        ]);

        $datosActivos3 = [
            [
                'nombre_af' => 'Switch de Red Cisco',
                'descripcion_af' => 'Switch administrable de 24 puertos',
                'modelo_af' => 'Catalyst 2960-X',
                'marca_af' => 'Cisco',
                'numero_serie_af' => 'CSC7890',
                'precio_unitario_af' => 15500.00,
                'af_propio' => false,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'fecha_registro_af' => '2024-07-10',
                'observaciones_af' => 'Equipo de red para infraestructura de comunicaciones',
                'precio_factura' => 15500.00,
                'descuento_af' => 500.00,
                'descuento_porcentajeaf' => 3.23,
            ],
            [
                'nombre_af' => 'Teléfono IP Cisco',
                'descripcion_af' => 'Teléfono IP corporativo',
                'modelo_af' => 'IP Phone 7841',
                'marca_af' => 'Cisco',
                'numero_serie_af' => 'CSC5678',
                'precio_unitario_af' => 2800.00,
                'af_propio' => false,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'fecha_registro_af' => '2024-06-10',
                'observaciones_af' => 'Sistema de comunicación IP',
                'precio_factura' => 2800.00,
                'descuento_af' => 80.00,
                'descuento_porcentajeaf' => 2.86,
            ],
            [
                'nombre_af' => 'Cámara de Seguridad Hikvision',
                'descripcion_af' => 'Cámara IP de vigilancia',
                'modelo_af' => 'DS-2CD2043G2-I',
                'marca_af' => 'Hikvision',
                'numero_serie_af' => 'HIK3456',
                'precio_unitario_af' => 3800.00,
                'af_propio' => false,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'fecha_registro_af' => '2024-07-05',
                'observaciones_af' => 'Sistema de videovigilancia perimetral',
                'precio_factura' => 3800.00,
                'descuento_af' => 100.00,
                'descuento_porcentajeaf' => 2.63,
            ],
        ];

        foreach ($datosActivos3 as $lineaIndex => $datos) {
            $this->crearActivoDesdeFactura($factura3, $datos, $lineaIndex);
        }

        // ========================================
        // FACTURA 4: Activos Diversos (Equipos + Mobiliario)
        // ========================================
        $factura4 = FacturaAF::create([
            'id_proveedor' => 1,
            'num_factura' => 'FAC-2025-00004',
            'id_tipo_factura' => 1,
            'fecha_fac_recepcion' => '2025-08-10',
            'id_forma_pago' => 1,
            'id_tipo_moneda' => 1,
            'observaciones_factura' => 'Compra mixta de equipos y mobiliario',
            'subtotal_factura' => 45000.00,
            'descuento_factura' => 2250.00,
            'flete_factura' => 450.00,
            'iva_factura' => 7200.00,
            'total_factura' => 50400.00,
        ]);

        $datosActivos4 = [
            [
                'nombre_af' => 'Laptop Dell Inspiron',
                'descripcion_af' => 'Laptop portátil para trabajo móvil',
                'modelo_af' => 'Inspiron 15 3000',
                'marca_af' => 'Dell',
                'numero_serie_af' => 'DELL1234',
                'precio_unitario_af' => 18000.00,
                'af_propio' => false,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'fecha_registro_af' => '2024-04-05',
                'observaciones_af' => 'Equipo portátil para trabajo remoto',
                'precio_factura' => 18000.00,
                'descuento_af' => 500.00,
                'descuento_porcentajeaf' => 2.78,
            ],
            [
                'nombre_af' => 'Proyector Epson',
                'descripcion_af' => 'Proyector para presentaciones',
                'modelo_af' => 'PowerLite X41+',
                'marca_af' => 'Epson',
                'numero_serie_af' => 'EPS5678',
                'precio_unitario_af' => 12000.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'fecha_registro_af' => '2024-04-10',
                'observaciones_af' => 'Equipo audiovisual para sala de juntas',
                'precio_factura' => 12000.00,
                'descuento_af' => 300.00,
                'descuento_porcentajeaf' => 2.50,
            ],
            [
                'nombre_af' => 'Archivero Metálico',
                'descripcion_af' => 'Archivero de 4 gavetas con chapa',
                'modelo_af' => 'Vertical 4 Gavetas',
                'marca_af' => 'Steelcase',
                'numero_serie_af' => 'STC9012',
                'precio_unitario_af' => 3200.00,
                'af_propio' => false,
                'id_estado_af' => 1,
                'id_clasificacion' => 2,
                'fecha_registro_af' => '2024-07-01',
                'observaciones_af' => 'Mobiliario para archivo de documentos',
                'precio_factura' => 3200.00,
                'descuento_af' => 160.00,
                'descuento_porcentajeaf' => 5.00,
            ],
            [
                'nombre_af' => 'Impresora Láser Brother',
                'descripcion_af' => 'Impresora láser monocromática',
                'modelo_af' => 'HL-L2350DW',
                'marca_af' => 'Brother',
                'numero_serie_af' => 'BRO9012',
                'precio_unitario_af' => 4500.00,
                'af_propio' => false,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'fecha_registro_af' => '2024-03-10',
                'observaciones_af' => 'Impresora para uso compartido del departamento',
                'precio_factura' => 4500.00,
                'descuento_af' => 180.00,
                'descuento_porcentajeaf' => 4.00,
            ],
            [
                'nombre_af' => 'Aire Acondicionado Split',
                'descripcion_af' => 'Sistema de climatización tipo split',
                'modelo_af' => 'Inverter 12000 BTU',
                'marca_af' => 'LG',
                'numero_serie_af' => 'LG9012',
                'precio_unitario_af' => 8500.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 3,
                'fecha_registro_af' => '2024-05-01',
                'observaciones_af' => 'Sistema de climatización para oficina principal',
                'precio_factura' => 8500.00,
                'descuento_af' => 425.00,
                'descuento_porcentajeaf' => 5.00,
            ],
        ];

        foreach ($datosActivos4 as $lineaIndex => $datos) {
            $this->crearActivoDesdeFactura($factura4, $datos, $lineaIndex);
        }

        // ========================================
        // FACTURA 5: Copiadora y Otros Equipos
        // ========================================
        $factura5 = FacturaAF::create([
            'id_proveedor' => 3,
            'num_factura' => 'FAC-2025-00005',
            'id_tipo_factura' => 2,
            'fecha_fac_recepcion' => '2025-08-20',
            'id_forma_pago' => 2,
            'id_tipo_moneda' => 1,
            'observaciones_factura' => 'Compra de copiadora y accesorios',
            'subtotal_factura' => 40000.00,
            'descuento_factura' => 2000.00,
            'flete_factura' => 600.00,
            'iva_factura' => 6400.00,
            'total_factura' => 45000.00,
        ]);

        $datosActivos5 = [
            [
                'nombre_af' => 'Copiadora Multifuncional',
                'descripcion_af' => 'Equipo multifuncional para impresión y copiado',
                'modelo_af' => 'Bizhub C308',
                'marca_af' => 'Konica Minolta',
                'numero_serie_af' => 'KM1234',
                'precio_unitario_af' => 35000.00,
                'af_propio' => false,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'fecha_registro_af' => '2024-08-01',
                'observaciones_af' => 'Equipo multifuncional para área administrativa',
                'precio_factura' => 35000.00,
                'descuento_af' => 1750.00,
                'descuento_porcentajeaf' => 5.00,
            ],
            [
                'nombre_af' => 'Scanner Canon',
                'descripcion_af' => 'Escáner de documentos profesional',
                'modelo_af' => 'CanoScan LiDE 400',
                'marca_af' => 'Canon',
                'numero_serie_af' => 'CAN3456',
                'precio_unitario_af' => 2200.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'fecha_registro_af' => '2024-05-10',
                'observaciones_af' => 'Equipo para digitalización de documentos',
                'precio_factura' => 2200.00,
                'descuento_af' => 110.00,
                'descuento_porcentajeaf' => 5.00,
            ],
            [
                'nombre_af' => 'UPS APC',
                'descripcion_af' => 'Sistema de alimentación ininterrumpida',
                'modelo_af' => 'Smart-UPS 1500VA',
                'marca_af' => 'APC',
                'numero_serie_af' => 'APC7890',
                'precio_unitario_af' => 6500.00,
                'af_propio' => false,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'fecha_registro_af' => '2024-06-05',
                'observaciones_af' => 'Sistema de respaldo eléctrico para servidores',
                'precio_factura' => 6500.00,
                'descuento_af' => 260.00,
                'descuento_porcentajeaf' => 4.00,
            ],
        ];

        foreach ($datosActivos5 as $lineaIndex => $datos) {
            $this->crearActivoDesdeFactura($factura5, $datos, $lineaIndex);
        }

        // ========================================
        // FACTURA 6: Lotes por tipo de activo
        // L cambia por tipo, C es consecutivo dentro del lote y LT es total del lote
        // ========================================
        $facturaLoteDemo = FacturaAF::create([
            'id_proveedor' => 1,
            'num_factura' => 'FAC-2025-00006-LOTE',
            'id_tipo_factura' => 1,
            'fecha_fac_recepcion' => '2025-09-01',
            'id_forma_pago' => 1,
            'id_tipo_moneda' => 1,
            'observaciones_factura' => 'Compra por lotes de varios tipos de activos',
            'subtotal_factura' => 66000.00,
            'descuento_factura' => 3000.00,
            'flete_factura' => 500.00,
            'iva_factura' => 10560.00,
            'total_factura' => 74060.00,
        ]);

        $activosFactura6 = [
            // L1: cantidad 1 (AF18)
            [
                'nombre_af' => 'Servidor de Respaldo (Lote 1)',
                'descripcion_af' => 'Servidor único para respaldo documental',
                'modelo_af' => 'PowerEdge R250',
                'marca_af' => 'Dell',
                'numero_serie_af' => 'F6-L1-C1',
                'precio_unitario_af' => 12000.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'codigo_lote' => 'F6-TIPO1',
                'lote_afconsecutivo' => 1,
                'lote_total' => 1,
                'fecha_registro_af' => '2024-09-01',
                'observaciones_af' => 'Activo único del lote tipo 1',
                'precio_factura' => 12000.00,
                'descuento_af' => 500.00,
                'descuento_porcentajeaf' => 4.17,
            ],
            // L2: cantidad 3 (AF19, AF20, AF21)
            [
                'nombre_af' => 'Laptop Dell Latitude (Lote 2)',
                'descripcion_af' => 'Equipo portátil para operaciones administrativas',
                'modelo_af' => 'Latitude 5420',
                'marca_af' => 'Dell',
                'numero_serie_af' => 'F6-L2-C1',
                'precio_unitario_af' => 15000.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'codigo_lote' => 'F6-TIPO2',
                'lote_afconsecutivo' => 1,
                'lote_total' => 3,
                'fecha_registro_af' => '2024-09-01',
                'observaciones_af' => 'Unidad 1 de 3 del lote tipo 2',
                'precio_factura' => 15000.00,
                'descuento_af' => 700.00,
                'descuento_porcentajeaf' => 4.67,
            ],
            [
                'nombre_af' => 'Laptop Dell Latitude (Lote 2)',
                'descripcion_af' => 'Equipo portátil para operaciones administrativas',
                'modelo_af' => 'Latitude 5420',
                'marca_af' => 'Dell',
                'numero_serie_af' => 'F6-L2-C2',
                'precio_unitario_af' => 15000.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'codigo_lote' => 'F6-TIPO2',
                'lote_afconsecutivo' => 2,
                'lote_total' => 3,
                'fecha_registro_af' => '2024-09-01',
                'observaciones_af' => 'Unidad 2 de 3 del lote tipo 2',
                'precio_factura' => 15000.00,
                'descuento_af' => 700.00,
                'descuento_porcentajeaf' => 4.67,
            ],
            [
                'nombre_af' => 'Laptop Dell Latitude (Lote 2)',
                'descripcion_af' => 'Equipo portátil para operaciones administrativas',
                'modelo_af' => 'Latitude 5420',
                'marca_af' => 'Dell',
                'numero_serie_af' => 'F6-L2-C3',
                'precio_unitario_af' => 15000.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'codigo_lote' => 'F6-TIPO2',
                'lote_afconsecutivo' => 3,
                'lote_total' => 3,
                'fecha_registro_af' => '2024-09-01',
                'observaciones_af' => 'Unidad 3 de 3 del lote tipo 2',
                'precio_factura' => 15000.00,
                'descuento_af' => 700.00,
                'descuento_porcentajeaf' => 4.67,
            ],
            // L3: cantidad 2 (AF22, AF23)
            [
                'nombre_af' => 'Monitor Samsung 24" (Lote 3)',
                'descripcion_af' => 'Monitor para estaciones de trabajo',
                'modelo_af' => 'S24R35',
                'marca_af' => 'Samsung',
                'numero_serie_af' => 'F6-L3-C1',
                'precio_unitario_af' => 4500.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'codigo_lote' => 'F6-TIPO3',
                'lote_afconsecutivo' => 1,
                'lote_total' => 2,
                'fecha_registro_af' => '2024-09-01',
                'observaciones_af' => 'Unidad 1 de 2 del lote tipo 3',
                'precio_factura' => 4500.00,
                'descuento_af' => 200.00,
                'descuento_porcentajeaf' => 4.44,
            ],
            [
                'nombre_af' => 'Monitor Samsung 24" (Lote 3)',
                'descripcion_af' => 'Monitor para estaciones de trabajo',
                'modelo_af' => 'S24R35',
                'marca_af' => 'Samsung',
                'numero_serie_af' => 'F6-L3-C2',
                'precio_unitario_af' => 4500.00,
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'codigo_lote' => 'F6-TIPO3',
                'lote_afconsecutivo' => 2,
                'lote_total' => 2,
                'fecha_registro_af' => '2024-09-01',
                'observaciones_af' => 'Unidad 2 de 2 del lote tipo 3',
                'precio_factura' => 4500.00,
                'descuento_af' => 200.00,
                'descuento_porcentajeaf' => 4.44,
            ],
        ];

        foreach ($activosFactura6 as $lineaIndex => $datos) {
            $this->crearActivoDesdeFactura($facturaLoteDemo, $datos, $lineaIndex, 'Activo de factura 6 por lote y tipo');
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
    }
}
