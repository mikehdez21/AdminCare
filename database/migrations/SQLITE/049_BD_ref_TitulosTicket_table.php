<?php

use App\Support\SchemaTable;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Crear la tabla de títulos de ticket dentro del esquema 'helpdesk'.
        // Es el tercer nivel de la jerarquía: Categoría -> Subcategoría -> Título.
        // El solicitante NO escribe el título: elige uno del catálogo, y el título
        // ya tiene asociada la subcategoría que lo clasifica.
        Schema::create(SchemaTable::helpdesk('tableRef_TitulosTicket'), function (Blueprint $table) {
            // Identificador único del título (clave primaria)
            $table->bigIncrements('id_titulo_ticket');

            // Subcategoría que clasifica este título (obligatorio)
            $table->unsignedBigInteger('id_subcategoria_ticket');

            // Nombre del título, es lo que el solicitante selecciona (obligatorio)
            $table->string('nombre_titulo_ticket', 150);

            // Descripción / guía de cómo reportar el problema (opcional)
            $table->text('descripcion_titulo_ticket')->nullable();

            // Estatus activo o inactivo (booleano, por defecto true)
            $table->boolean('estatus_activo')->default(true);

            // Campos de control: created_at y updated_at
            $table->timestamps();

            // Clave foránea: subcategoría padre (cascade)
            $table->foreign('id_subcategoria_ticket')->references('id_subcategoria_ticket')->on(SchemaTable::helpdesk('tableRef_SubcategoriasTicket'))->onDelete('cascade');

            // No se repiten títulos dentro de la misma subcategoría
            $table->unique(['id_subcategoria_ticket', 'nombre_titulo_ticket'], 'uk_titulo_subcategoria_nombre');

            // Índices para mejorar el rendimiento de las consultas
            $table->index('id_subcategoria_ticket', 'idx_titulo_subcategoria');
            $table->index('estatus_activo', 'idx_titulo_estatus');
        });

        // Catálogo inicial, anidado categoría -> subcategoría -> títulos.
        // Se resuelve por nombre de categoría + subcategoría para no depender del
        // orden de inserción. Estos datos son de arranque: se administran
        // posteriormente desde el backend por quien resuelve tickets.
        $titulos = [
            'Sistemas' => [
                'SIHO (ERP interno)' => [
                    'No puedo facturar',
                    'Factura incorrecta',
                    'Reporte no genera',
                    'Corte de caja bloqueado',
                ],
                'ECE (Expediente Electronico Web Hospitalario)' => [
                    'No puedo iniciar sesión',
                    'No aparece el paciente',
                    'No guarda la nota',
                    'Error al firmar',
                ],
                'Correctiva' => [
                    'Falla de Teléfono',
                    'Falla de Impresora',
                ],
                'Preventiva' => [
                    'Mantenimiento preventivo de equipo',
                ],
                'Mantenimiento' => [
                    'Mantenimiento programado',
                ],
                'Otros' => [
                    'Otro de sistemas',
                ],
            ],
            'Servicios Generales' => [
                'Limpieza' => [
                    'Limpieza de áreas',
                    'Limpieza de baños',
                    'Retiro de basura',
                    'Limpieza de derrames',
                    'Falta de material de limpieza',
                ],
                'Mantenimiento menor' => [
                    'Cambio de foco',
                    'Cambio de pila',
                    'Ajuste de puerta o cajón',
                    'Reparación menor de muebles',
                ],
                'Otros' => [
                    'Otro de servicios generales',
                ],
            ],
            'Mantenimiento' => [
                'Correctiva' => [
                    'Fuga de agua',
                    'Falla eléctrica',
                    'Aire acondicionado',
                    'Puertas y ventanas',
                    'Mobiliario dañado',
                    'Drenaje obstruido',
                    'Iluminación fundida',
                ],
                'Preventiva' => [
                    'Mantenimiento programado',
                    'Lubricación de equipo',
                    'Revisión de instalaciones',
                    'Calibración de equipo',
                ],
                'Otros' => [
                    'Otro de mantenimiento',
                ],
            ],
            'Biomédica' => [
                'Correctiva' => [
                    'Equipo no enciende',
                    'Alarma activa en equipo',
                    'Error en equipo',
                    'Falla de sensor',
                    'Falla de software',
                ],
                'Preventiva' => [
                    'Mantenimiento preventivo',
                    'Calibración programada',
                    'Revisión de accesorios',
                ],
                'Otros' => [
                    'Otro de biomédica',
                ],
            ],
        ];

        $filas = [];
        $timestamp = now();

        foreach ($titulos as $categoria => $subcategorias) {
            $idCategoria = DB::table(SchemaTable::helpdesk('tableRef_CategoriasTicket'))
                ->where('nombre_categoria', $categoria)
                ->value('id_categoria_ticket');

            if ($idCategoria === null) {
                continue;
            }

            foreach ($subcategorias as $subcategoria => $opciones) {
                $idSubcategoria = DB::table(SchemaTable::helpdesk('tableRef_SubcategoriasTicket'))
                    ->where('id_categoria_ticket', $idCategoria)
                    ->where('nombre_subcategoria', $subcategoria)
                    ->value('id_subcategoria_ticket');

                if ($idSubcategoria === null) {
                    continue;
                }

                foreach ($opciones as $titulo) {
                    $filas[] = [
                        'id_subcategoria_ticket' => $idSubcategoria,
                        'nombre_titulo_ticket' => $titulo,
                        'descripcion_titulo_ticket' => null,
                        'estatus_activo' => true,
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ];
                }
            }
        }

        DB::table(SchemaTable::helpdesk('tableRef_TitulosTicket'))->insert($filas);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la tabla de títulos de ticket
        Schema::dropIfExists(SchemaTable::helpdesk('tableRef_TitulosTicket'));
    }
};
