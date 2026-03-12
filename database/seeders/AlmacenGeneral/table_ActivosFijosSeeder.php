<?php

namespace Database\Seeders\AlmacenGeneral;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\AlmacenGeneral\ActivosFijos;

class table_ActivosFijosSeeder extends Seeder
{
    public function run(): void
    {
        ActivosFijos::crearConQR([
            'nombre_af' => 'Activo Fijo Ejemplo',
            'descripcion_af' => 'Descripción del activo fijo de ejemplo',
            'modelo_af' => 'Modelo X',
            'marca_af' => 'Marca Y',
            'numero_serie_af' => 'SERIE12345',
            'valor_compra_af' => 1000.00,
            'fecha_compra_af' => '2024-01-01',
            'af_propio' => true,
            'id_estado_af' => 1,
            'id_clasificacion' => 1,
            'fecha_registro_af' => '2024-01-01',
            'observaciones_af' => 'Activo fijo registrado para pruebas',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Activo Fijo Ejemplo 2',
            'descripcion_af' => 'Descripción del segundo activo fijo de ejemplo',
            'modelo_af' => 'Modelo Z',
            'marca_af' => 'Marca W',
            'numero_serie_af' => 'SERIE67890',
            'valor_compra_af' => 2000.00,
            'fecha_compra_af' => '2024-02-01',
            'af_propio' => true,
            'id_estado_af' => 1,
            'id_clasificacion' => 2,
            'fecha_registro_af' => '2024-02-01',
            'observaciones_af' => 'Segundo activo fijo registrado para pruebas',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Computadora de Escritorio HP',
            'descripcion_af' => 'Computadora de escritorio para oficina',
            'modelo_af' => 'EliteDesk 800 G4',
            'marca_af' => 'HP',
            'numero_serie_af' => 'HP001234',
            'valor_compra_af' => 15000.00,
            'fecha_compra_af' => '2024-03-01',
            'af_propio' => true,
            'id_estado_af' => 1,
            'id_clasificacion' => 1,
            'fecha_registro_af' => '2024-03-01',
            'observaciones_af' => 'Equipo de cómputo asignado al área administrativa',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Monitor LED Samsung',
            'descripcion_af' => 'Monitor LED de 24 pulgadas',
            'modelo_af' => 'S24F350FH',
            'marca_af' => 'Samsung',
            'numero_serie_af' => 'SAM5678',
            'valor_compra_af' => 3500.00,
            'fecha_compra_af' => '2024-03-05',
            'af_propio' => true,
            'id_estado_af' => 1,
            'id_clasificacion' => 1,
            'fecha_registro_af' => '2024-03-05',
            'observaciones_af' => 'Monitor complementario para estación de trabajo',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Impresora Láser Brother',
            'descripcion_af' => 'Impresora láser monocromática',
            'modelo_af' => 'HL-L2350DW',
            'marca_af' => 'Brother',
            'numero_serie_af' => 'BRO9012',
            'valor_compra_af' => 4500.00,
            'fecha_compra_af' => '2024-03-10',
            'af_propio' => false,
            'id_estado_af' => 1,
            'id_clasificacion' => 1,
            'fecha_registro_af' => '2024-03-10',
            'observaciones_af' => 'Impresora para uso compartido del departamento',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Silla Ergonómica de Oficina',
            'descripcion_af' => 'Silla ejecutiva con soporte lumbar',
            'modelo_af' => 'Executive Pro',
            'marca_af' => 'OfficeMax',
            'numero_serie_af' => 'OM3456',
            'valor_compra_af' => 2800.00,
            'fecha_compra_af' => '2024-03-15',
            'af_propio' => true,
            'id_estado_af' => 1,
            'id_clasificacion' => 2,
            'fecha_registro_af' => '2024-03-15',
            'observaciones_af' => 'Mobiliario ergonómico para estación de trabajo',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Escritorio Ejecutivo',
            'descripcion_af' => 'Escritorio de madera con cajones',
            'modelo_af' => 'Ejecutivo 150',
            'marca_af' => 'Muebles Modernos',
            'numero_serie_af' => 'MM7890',
            'valor_compra_af' => 5200.00,
            'fecha_compra_af' => '2024-04-01',
            'af_propio' => false,
            'id_estado_af' => 1,
            'id_clasificacion' => 2,
            'fecha_registro_af' => '2024-04-01',
            'observaciones_af' => 'Mobiliario principal de oficina ejecutiva',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Laptop Dell Inspiron',
            'descripcion_af' => 'Laptop portátil para trabajo móvil',
            'modelo_af' => 'Inspiron 15 3000',
            'marca_af' => 'Dell',
            'numero_serie_af' => 'DELL1234',
            'valor_compra_af' => 18000.00,
            'fecha_compra_af' => '2024-04-05',
            'af_propio' => false,
            'id_estado_af' => 1,
            'id_clasificacion' => 1,
            'fecha_registro_af' => '2024-04-05',
            'observaciones_af' => 'Equipo portátil para trabajo remoto',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Proyector Epson',
            'descripcion_af' => 'Proyector para presentaciones',
            'modelo_af' => 'PowerLite X41+',
            'marca_af' => 'Epson',
            'numero_serie_af' => 'EPS5678',
            'valor_compra_af' => 12000.00,
            'fecha_compra_af' => '2024-04-10',
            'af_propio' => true,
            'id_estado_af' => 1,
            'id_clasificacion' => 1,
            'fecha_registro_af' => '2024-04-10',
            'observaciones_af' => 'Equipo audiovisual para sala de juntas',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Aire Acondicionado Split',
            'descripcion_af' => 'Sistema de climatización tipo split',
            'modelo_af' => 'Inverter 12000 BTU',
            'marca_af' => 'LG',
            'numero_serie_af' => 'LG9012',
            'valor_compra_af' => 8500.00,
            'fecha_compra_af' => '2024-05-01',
            'af_propio' => true,
            'id_estado_af' => 1,
            'id_clasificacion' => 3,
            'fecha_registro_af' => '2024-05-01',
            'observaciones_af' => 'Sistema de climatización para oficina principal',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Servidor Dell PowerEdge',
            'descripcion_af' => 'Servidor para infraestructura TI',
            'modelo_af' => 'PowerEdge T140',
            'marca_af' => 'Dell',
            'numero_serie_af' => 'DELL5678',
            'valor_compra_af' => 45000.00,
            'fecha_compra_af' => '2024-05-05',
            'af_propio' => true,
            'id_estado_af' => 1,
            'id_clasificacion' => 1,
            'fecha_registro_af' => '2024-05-05',
            'observaciones_af' => 'Servidor principal del sistema informático',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Scanner Canon',
            'descripcion_af' => 'Escáner de documentos profesional',
            'modelo_af' => 'CanoScan LiDE 400',
            'marca_af' => 'Canon',
            'numero_serie_af' => 'CAN3456',
            'valor_compra_af' => 2200.00,
            'fecha_compra_af' => '2024-05-10',
            'af_propio' => true,
            'id_estado_af' => 1,
            'id_clasificacion' => 1,
            'fecha_registro_af' => '2024-05-10',
            'observaciones_af' => 'Equipo para digitalización de documentos',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Mesa de Juntas',
            'descripcion_af' => 'Mesa de reuniones para 8 personas',
            'modelo_af' => 'Ejecutiva 240x120',
            'marca_af' => 'Muebles Modernos',
            'numero_serie_af' => 'MM1234',
            'valor_compra_af' => 8900.00,
            'fecha_compra_af' => '2024-06-01',
            'af_propio' => false,
            'id_estado_af' => 1,
            'id_clasificacion' => 2,
            'fecha_registro_af' => '2024-06-01',
            'observaciones_af' => 'Mobiliario para sala de juntas',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'UPS APC',
            'descripcion_af' => 'Sistema de alimentación ininterrumpida',
            'modelo_af' => 'Smart-UPS 1500VA',
            'marca_af' => 'APC',
            'numero_serie_af' => 'APC7890',
            'valor_compra_af' => 6500.00,
            'fecha_compra_af' => '2024-06-05',
            'af_propio' => false,
            'id_estado_af' => 1,
            'id_clasificacion' => 1,
            'fecha_registro_af' => '2024-06-05',
            'observaciones_af' => 'Sistema de respaldo eléctrico para servidores',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Teléfono IP Cisco',
            'descripcion_af' => 'Teléfono IP corporativo',
            'modelo_af' => 'IP Phone 7841',
            'marca_af' => 'Cisco',
            'numero_serie_af' => 'CSC5678',
            'valor_compra_af' => 2800.00,
            'fecha_compra_af' => '2024-06-10',
            'af_propio' => false,
            'id_estado_af' => 1,
            'id_clasificacion' => 1,
            'fecha_registro_af' => '2024-06-10',
            'observaciones_af' => 'Sistema de comunicación IP',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Archivero Metálico',
            'descripcion_af' => 'Archivero de 4 gavetas con chapa',
            'modelo_af' => 'Vertical 4 Gavetas',
            'marca_af' => 'Steelcase',
            'numero_serie_af' => 'STC9012',
            'valor_compra_af' => 3200.00,
            'fecha_compra_af' => '2024-07-01',
            'af_propio' => false,
            'id_estado_af' => 1,
            'id_clasificacion' => 2,
            'fecha_registro_af' => '2024-07-01',
            'observaciones_af' => 'Mobiliario para archivo de documentos',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Cámara de Seguridad Hikvision',
            'descripcion_af' => 'Cámara IP de vigilancia',
            'modelo_af' => 'DS-2CD2043G2-I',
            'marca_af' => 'Hikvision',
            'numero_serie_af' => 'HIK3456',
            'valor_compra_af' => 3800.00,
            'fecha_compra_af' => '2024-07-05',
            'af_propio' => false,
            'id_estado_af' => 1,
            'id_clasificacion' => 1,
            'fecha_registro_af' => '2024-07-05',
            'observaciones_af' => 'Sistema de videovigilancia perimetral',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Switch de Red Cisco',
            'descripcion_af' => 'Switch administrable de 24 puertos',
            'modelo_af' => 'Catalyst 2960-X',
            'marca_af' => 'Cisco',
            'numero_serie_af' => 'CSC7890',
            'valor_compra_af' => 15500.00,
            'fecha_compra_af' => '2024-07-10',
            'af_propio' => false,
            'id_estado_af' => 1,
            'id_clasificacion' => 1,
            'fecha_registro_af' => '2024-07-10',
            'observaciones_af' => 'Equipo de red para infraestructura de comunicaciones',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Copiadora Multifuncional',
            'descripcion_af' => 'Equipo multifuncional para impresión y copiado',
            'modelo_af' => 'Bizhub C308',
            'marca_af' => 'Konica Minolta',
            'numero_serie_af' => 'KM1234',
            'valor_compra_af' => 35000.00,
            'fecha_compra_af' => '2024-08-01',
            'af_propio' => false,
            'id_estado_af' => 1,
            'id_clasificacion' => 1,
            'fecha_registro_af' => '2024-08-01',
            'observaciones_af' => 'Equipo multifuncional para área administrativa',
        ]);

        ActivosFijos::crearConQR([
            'nombre_af' => 'Vehículo Oficial',
            'descripcion_af' => 'Automóvil para uso institucional',
            'modelo_af' => 'Aveo LT 2024',
            'marca_af' => 'Chevrolet',
            'numero_serie_af' => 'CHV5678',
            'valor_compra_af' => 280000.00,
            'fecha_compra_af' => '2024-08-05',
            'af_propio' => false,
            'id_estado_af' => 1,
            'id_clasificacion' => 4,
            'fecha_registro_af' => '2024-08-05',
            'observaciones_af' => 'Vehículo asignado para actividades institucionales',
        ]);

        // ========================================
        // LOTE DEMO: 3 unidades del mismo activo
        // ========================================
        $codigoLoteDemo = 'LOT-SEED-DEMO-001';

        for ($i = 1; $i <= 3; $i++) {
            ActivosFijos::crearConQR([
                'nombre_af' => 'Laptop Dell Latitude (Lote Demo)',
                'descripcion_af' => 'Equipo portátil de demostración para lote',
                'modelo_af' => 'Latitude 5420',
                'marca_af' => 'Dell',
                'numero_serie_af' => 'DEMO-LAT-' . str_pad((string) $i, 3, '0', STR_PAD_LEFT),
                'valor_compra_af' => 22000.00,
                'fecha_compra_af' => '2024-09-01',
                'af_propio' => true,
                'id_estado_af' => 1,
                'id_clasificacion' => 1,
                'codigo_lote' => $codigoLoteDemo,
                'lote_afconsecutivo' => $i,
                'lote_total' => 3,
                'fecha_registro_af' => '2024-09-01',
                'observaciones_af' => 'Registro de ejemplo para validar trazabilidad de lote',
            ]);
        }

        // ========================================
        // BACKFILL DE LOTE PARA REGISTROS SIN LOTE
        // ========================================
        $activosSinLote = DB::table('almacengeneral.tableAF_ActivosFijos')
            ->select('id_activo_fijo')
            ->whereNull('codigo_lote')
            ->orderBy('id_activo_fijo')
            ->get();

        foreach ($activosSinLote as $activo) {
            DB::table('almacengeneral.tableAF_ActivosFijos')
                ->where('id_activo_fijo', $activo->id_activo_fijo)
                ->update([
                    'codigo_lote' => 'LOT-SEED-' . str_pad((string) $activo->id_activo_fijo, 4, '0', STR_PAD_LEFT),
                    'lote_afconsecutivo' => 1,
                    'lote_total' => 1,
                ]);
        }

        // AL FINAL, agregar esto para resetear la secuencia:
        $maxId = DB::table('almacengeneral.tableAF_ActivosFijos')->max('id_activo_fijo');
        DB::statement('SELECT setval(\'almacengeneral."tableAF_ActivosFijos_id_activo_fijo_seq"\', ' . ($maxId) . ')');
    }
}