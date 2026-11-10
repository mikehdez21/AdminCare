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
        // Crear la tabla de subcategorías de tickets dentro del esquema 'helpdesk'.
        // Una subcategoría representa la opción de problema elegida por el
        // solicitante dentro de una categoría (ej: categoría Mantenimiento ->
        // subcategoría "Fuga de agua").
        Schema::create(SchemaTable::helpdesk('tableRef_SubcategoriasTicket'), function (Blueprint $table) {
            // Identificador único de la subcategoría (clave primaria)
            $table->bigIncrements('id_subcategoria_ticket');

            // Categoría a la que pertenece la subcategoría (obligatorio)
            $table->unsignedBigInteger('id_categoria_ticket');

            // Nombre de la subcategoría / opción de problema (obligatorio)
            $table->string('nombre_subcategoria', 150);

            // Descripción de la subcategoría (opcional)
            $table->text('descripcion_subcategoria')->nullable();

            // Estatus activo o inactivo (booleano, por defecto true)
            $table->boolean('estatus_activo')->default(true);

            // `true` = subcategoría de solicitudes normales: cualquiera puede levantar
            // el ticket. `false` = actividad interna del personal que atiende tickets
            // (administrativa u operativa), que no viene de alguien de fuera.
            $table->boolean('es_publico')->default(true);

            // Campos de control: created_at y updated_at
            $table->timestamps();

            // Clave foránea: categoría padre (cascade)
            $table->foreign('id_categoria_ticket')->references('id_categoria_ticket')->on(SchemaTable::helpdesk('tableRef_CategoriasTicket'))->onDelete('cascade');

            // No se repiten opciones de problema dentro de la misma categoría
            $table->unique(['id_categoria_ticket', 'nombre_subcategoria'], 'uk_subcategoria_categoria_nombre');

            // Índices para mejorar el rendimiento de las consultas
            $table->index('id_categoria_ticket', 'idx_subcategoria_categoria');
            $table->index('estatus_activo', 'idx_subcategoria_estatus');
            $table->index('es_publico', 'idx_subcategoria_es_publico');
        });

        // Resolver el ID de cada categoría por nombre para no depender del orden de inserción
        $categoriaId = function (string $nombre): ?int {
            $id = DB::table(SchemaTable::helpdesk('tableRef_CategoriasTicket'))
                ->where('nombre_categoria', $nombre)
                ->value('id_categoria_ticket');

            return $id === null ? null : (int) $id;
        };

        // Opciones de problema iniciales por categoría.
        // Las subcategorías son la clasificación interna que administra quien
        // resuelve tickets; el solicitante no las elige directamente.
        $subcategorias = [
            'Sistemas' => [
                'SIHO (ERP interno)',
                'ECE (Expediente Electronico Web Hospitalario)',
                'Correctiva',
                'Preventiva',
                'Mantenimiento',
                'Otros',
            ],
            'Servicios Generales' => [
                'Limpieza',
                'Mantenimiento menor',
                'Otros',
            ],
            'Mantenimiento' => [
                'Correctiva',
                'Preventiva',
                'Otros',
            ],
            'Biomédica' => [
                'Correctiva',
                'Preventiva',
                'Otros',
            ],
        ];

        $filas = [];
        $timestamp = now();

        foreach ($subcategorias as $categoria => $opciones) {
            $idCategoria = $categoriaId($categoria);

            if ($idCategoria === null) {
                continue;
            }

            foreach ($opciones as $opcion) {
                $filas[] = [
                    'id_categoria_ticket' => $idCategoria,
                    'nombre_subcategoria' => $opcion,
                    'descripcion_subcategoria' => null,
                    'estatus_activo' => true,
                    'es_publico' => true,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ];
            }
        }

        DB::table(SchemaTable::helpdesk('tableRef_SubcategoriasTicket'))->insert($filas);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la tabla de subcategorías de tickets
        Schema::dropIfExists(SchemaTable::helpdesk('tableRef_SubcategoriasTicket'));
    }
};
