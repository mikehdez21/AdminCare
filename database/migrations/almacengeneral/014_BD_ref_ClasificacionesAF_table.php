<?php

// 2024_10_08

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Crear el esquema si no existe
        DB::statement('CREATE SCHEMA IF NOT EXISTS almacengeneral');

        // Crear la tabla de clasificaciones dentro del esquema 'almacengeneral'
        Schema::create('almacengeneral.tableRef_ClasificacionesAF', function (Blueprint $table) {
            // Identificador único de la clasificación (clave primaria)
            $table->bigIncrements('id_clasificacion')->primary();

            // Nombre de la clasificación (cadena de texto, obligatorio)
            $table->string('descripcion_clasificacionaf');

            // Campos de control: created_at y updated_at (automáticamente gestionados por Laravel)
            $table->timestamps();

        });

        // Insertar las clasificaciones iniciales
        DB::table('almacengeneral.tableRef_ClasificacionesAF')->insert([
            ['descripcion_clasificacionaf' => 'AF Equipamento de Oficina', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_clasificacionaf' => 'AF Mobiliario y Equipo', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_clasificacionaf' => 'AF Vehículos', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_clasificacionaf' => 'AF Maquinaria Pesada', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_clasificacionaf' => 'AF Equipo Informático', 'created_at' => now(), 'updated_at' => now()],
            ['descripcion_clasificacionaf' => 'AF Herramientas y Equipos Menores', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la tabla de clasificaciones
        Schema::dropIfExists('almacengeneral.tableRef_ClasificacionesAF');
    }
};
