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
            $table->string('nombre_clasificacion')->unique();

            // Cuenta Contable
            $table->string('cuenta_contable')->nullable();

            // Estatus activo o inactivo (booleano, por defecto true)
            $table->boolean('estatus_activo')->default(true);

            // Campos de control: created_at y updated_at (automáticamente gestionados por Laravel)
            $table->timestamps();
        });

        // Insertar las clasificaciones iniciales
        DB::table('almacengeneral.tableRef_ClasificacionesAF')->insert([
            ['nombre_clasificacion' => 'AF Equipamento de Oficina', 'cuenta_contable' => '1001', 'estatus_activo' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre_clasificacion' => 'AF Mobiliario y Equipo', 'cuenta_contable' => '1002', 'estatus_activo' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre_clasificacion' => 'AF Vehículos', 'cuenta_contable' => '1003', 'estatus_activo' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre_clasificacion' => 'AF Maquinaria Pesada', 'cuenta_contable' => '1004', 'estatus_activo' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre_clasificacion' => 'AF Equipo Informático', 'cuenta_contable' => '1005',  'estatus_activo' => false,  'created_at' => now(),  'updated_at' => now()],
            ['nombre_clasificacion' => 'AF Herramientas y Equipos Menores', 'cuenta_contable' => '1006', 'estatus_activo' => true, 'created_at' => now(), 'updated_at' => now()],
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
