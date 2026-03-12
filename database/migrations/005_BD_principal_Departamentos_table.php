<?php

// 2024_09_23_000004

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;


return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Crear la tabla departamentos
        Schema::create('tableDepartamentos', function (Blueprint $table) {
            // Identificador único del departamento (clave primaria)
            $table->bigIncrements('id_departamento')->primary();

            // Nombre del departamento (cadena de texto, obligatorio, longitud máxima de 255 caracteres)
            $table->string('nombre_departamento', 255)->notNull();

            // Descripción del departamento (texto, opcional)
            $table->text('descripcion')->nullable();

            // Indica si el departamento atiende a pacientes (booleano: true = sí, false = no, valor por defecto false, obligatorio)
            $table->boolean('atiende_pacientes')->default(false)->notNull();

            // Estatus del departamento (booleano: true = activo, false = inactivo, valor por defecto true)
            $table->boolean('estatus_activo')->default(true);

            // Campos de control: created_at y updated_at (automáticamente gestionados por Laravel)
            $table->timestamps();

            // Índices para mejorar el rendimiento de las consultas
            $table->index('nombre_departamento'); // Índice para búsquedas por nombre
            $table->index('estatus_activo'); // Índice para filtros por estatus del departamento
        });
    }

    /**
     * Reverse the migrations.
     */
    /*
    public function down(): void
    {
        // Eliminar las claves foráneas que dependen de 'tableDepartamentos'
        Schema::disableForeignKeyConstraints(); // Desactivar restricciones de clave foránea temporalmente

        // Eliminar la tabla 'tableDepartamentos'
        Schema::dropIfExists('tableDepartamentos');

        Schema::enableForeignKeyConstraints(); // Reactivar restricciones de clave foránea
    }
*/

    public function down(): void
    {
        //Eliminar la tabla con CASCADE para eliminar también las dependencias
        DB::statement('DROP TABLE IF EXISTS tableDepartamentos CASCADE;');
    }
};
