<?php

// 2025_01_31

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Crear la tabla empleados
        Schema::create('tableEmpleados', function (Blueprint $table) {
            // Identificador único del empleado (clave primaria)
            $table->bigIncrements('id_empleado')->primary();

            // Nombre del empleado (cadena de texto, único, longitud máxima de 255 caracteres)
            $table->string('nombre_empleado', 255)->unique();

            // Apellido paterno del empleado (cadena de texto, opcional, longitud máxima de 255 caracteres)
            $table->string('apellido_paterno', 255)->nullable();

            // Apellido materno del empleado (cadena de texto, opcional, longitud máxima de 255 caracteres)
            $table->string('apellido_materno', 255)->nullable();

            // Correo electrónico del empleado (cadena de texto, único, longitud máxima de 255 caracteres)
            $table->string('email_empleado', 255)->unique();

            // Número de teléfono del empleado (cadena de texto, opcional, longitud máxima de 20 caracteres)
            $table->string('telefono_empleado', 20)->nullable();

            // Género del empleado (ENUM: solo permite 'Masculino' o 'Femenino', opcional)
            $table->enum('genero', ['Masculino', 'Femenino'])->nullable();

            // Fecha de nacimiento del empleado (tipo fecha, obligatoria)
            $table->date('fecha_nacimiento');

            // Estatus del empleado (booleano: true = activo, false = inactivo, valor por defecto true)
            $table->boolean('estatus_activo')->default(true);

            // Fecha de alta del empleado (tipo fecha, obligatoria)
            $table->dateTime('fecha_alta');

            // Fecha de baja del empleado (tipo fecha, opcional)
            $table->dateTime('fecha_baja')->nullable();

            // Almacena la ruta donde se guarda la foto en el sistema de archivos (storage/app/public/fotosEmpleados)
            $table->string('foto_empleado')->nullable();

            // Firma de movimientos del empleado (cadena de texto, obligatoria, longitud máxima de 255 caracteres)
            // Puede ser un hash o un identificador único para la firma
            $table->string('firma_movimientos', 255);

            // Campos de control: created_at y updated_at (automáticamente gestionados por Laravel)
            $table->timestamps();


            // Clave foránea que relaciona al empleado con un departamento
            $table->foreignId('id_departamento')->constrained('tableDepartamentos', 'id_departamento')->onDelete('set null');


            // Índices para mejorar el rendimiento de las consultas
            $table->index('nombre_empleado'); // Índice para búsquedas por nombre de empleado
            $table->index('apellido_paterno'); // Índice para búsquedas por apellido paterno de empleado
            $table->index('apellido_materno'); // Índice para búsquedas por apellido materno de empleado
            $table->index('estatus_activo'); // Índice para filtros por estatus del 
        });
    }

    /**
     * Reverse the migrations.
     */
    /*
    public function down(): void
    {
        // Eliminar las claves foráneas que dependen de 'tableEmpleados'
        Schema::disableForeignKeyConstraints(); // Desactivar restricciones de clave foránea temporalmente

        // Eliminar la tabla 'tableEmpleados'
        Schema::dropIfExists('tableEmpleados');

        Schema::enableForeignKeyConstraints(); // Reactivar restricciones de clave foránea
    }
*/

    public function down(): void
    {
        // Eliminar la tabla con CASCADE para eliminar también las dependencias
        DB::statement('DROP TABLE IF EXISTS tableEmpleados CASCADE;');
    }
};
