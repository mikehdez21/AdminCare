<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        // Crear el esquema 'almacengeneral' si no existe
        DB::statement('CREATE SCHEMA IF NOT EXISTS almacengeneral');

        // Crear la tabla 'tableRef_MetodosDepreciacion' dentro del esquema 'almacengeneral'
        Schema::create('almacengeneral.tableRef_MetodosDepreciacion', function (Blueprint $table) {
            // ID del método de depreciación (Clave primaria autoincremental)
            $table->bigIncrements('id_metodo_depreciacion')->primary();

            // Nombre del método de depreciación (único y no nulo)
            $table->string('nombre_metodo', 100)->notNull()->unique();

            // Descripción del método de depreciación (opcional)
            $table->text('descripcion_metodo')->nullable();

            // Fórmula del método de depreciación (opcional)
            $table->string('formula', 500)->nullable();

            // Tasa de depreciación por defecto para este método (opcional)
            $table->decimal('tasa_default', 5, 2)->nullable();

            // Campo para indicar si el método de depreciación está activo o no
            $table->boolean('activo')->default(true);

            // Campos de timestamps para registrar la fecha de creación y actualización del método de depreciación
            $table->timestamps();

            // Índices para mejorar el rendimiento de las consultas
            $table->index('nombre_metodo', 'idx_nombre_metodo');
            $table->index('activo', 'idx_activo');
        });
    }

    public function down()
    {
        Schema::dropIfExists('almacengeneral.tableRef_MetodosDepreciacion');
    }
};
