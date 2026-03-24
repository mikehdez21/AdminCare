<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {

        // Crear la tabla 'activosfijos'
        Schema::create('almacengeneral.tableAF_ActivosFijos', function (Blueprint $table) {

            // Identificador único autoincremental
            $table->bigIncrements('id_activo_fijo')->primary();

            // Código único del activo fijo
            $table->string('codigo_unico')->unique()->notNull();

            // Nombre del activo fijo
            $table->string('nombre_af')->notNull();

            // Descripción del activo fijo
            $table->text('descripcion_af')->nullable();

            // Modelo del activo fijo
            $table->string('modelo_af')->nullable();

            // Marca del activo fijo
            $table->string('marca_af')->nullable();

            // Número de serie del activo fijo
            $table->string('numero_serie_af')->nullable();

            // Precio unitario del activo fijo
            $table->decimal('precio_unitario_af', 12, 2)->nullable();

            // Activo Fijo Propio o Comodato
            $table->boolean('af_propio')->default(true)->notNull();

            // Identificador lógico del lote de alta (ej. FAC-2026-0001-ITEM-02)
            $table->string('codigo_lote', 100)->nullable()->after('codigo_unico');

            // Posición del activo dentro del lote (1..n)
            $table->integer('lote_afconsecutivo')->nullable()->after('codigo_lote');

            // Tamaño total del lote al momento de la creación
            $table->integer('lote_total')->nullable()->after('lote_afconsecutivo');

            $table->string('codigo_etiqueta', 150)->nullable()->after('codigo_unico');

            // Estado del activo ('Activo' o 'Baja' o 'En Mantenimiento' o 'Extraviado' etc.)
            $table->foreignId('id_estado_af')->constrained('almacengeneral.tableRef_EstatusAF', 'id_estatusaf')->default(1)->onDelete('restrict');

            // Relación con la tabla 'tableclasificaciones', representando la clasificación del activo
            $table->foreignId('id_clasificacion')->notNull()->constrained('almacengeneral.tableRef_ClasificacionesAF', 'id_clasificacion')->onDelete('restrict');

            // Fecha de registro del activo en el sistema
            $table->dateTime('fecha_registro_af')->notNull();

            // Observaciones adicionales sobre el activo
            $table->text('observaciones_af')->nullable();

            // Campos de fecha de creación y actualización con zona horaria
            $table->timestamps();

            // Índice único para el código de etiqueta, permitiendo nulos (un activo sin código de etiqueta no compite con otro sin código de etiqueta)
            $table->unique('codigo_etiqueta', 'uk_af_codigo_etiqueta');

            // Índices para mejorar el rendimiento de las consultas
            $table->index('nombre_af', 'idx_nombre_af'); // Índice para búsquedas por nombre del activo_fijo
            $table->index('codigo_unico', 'idx_codigo_unico'); // Índice para búsquedas por código único
            $table->index('marca_af', 'idx_marca_af'); // Índice para consultas por marca
            $table->index('codigo_lote', 'idx_af_codigo_lote');
        });
    }

    // Método que elimina la tabla 'tableAF_ActivosFijos' si se deshace la migración
    public function down()
    {
        Schema::dropIfExists('almacengeneral.tableAF_ActivosFijos');
        // Opcional: eliminar el esquema 'almacengeneral' y todas sus tablas
        DB::statement('DROP SCHEMA IF EXISTS almacengeneral CASCADE');
    }
};
