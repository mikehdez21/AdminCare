<?php

// 2024_09_23_000007

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Crear la tabla usuarios
        Schema::create('tableUsuarios', function (Blueprint $table) {
            // Identificador único del usuario (clave primaria)
            $table->bigIncrements('id_usuario')->primary();

            // Nombre del usuario (cadena de texto, único, obligatorio, longitud máxima de 255 caracteres)
            $table->string('nombre_usuario', 255)->unique()->notNull();

            // Correo electrónico del usuario (cadena de texto, obligatorio, longitud máxima de 255 caracteres)
            $table->string('email_usuario', 255)->notNull();

            // Contraseña del usuario (cadena de texto, obligatorio, longitud máxima de 255 caracteres)
            $table->string('password', 255)->notNull();

            // Estatus del usuario (booleano: true = activo, false = inactivo, valor por defecto true, obligatorio)
            $table->boolean('estatus_activo')->default(true)->notNull();

            // Fecha de Baja del Usuario
            $table->dateTime('fecha_baja')->nullable();

            // Estatus del usuario (booleano: true = activo, false = inactivo, valor por defecto true, obligatorio)
            $table->boolean('usuario_compartido')->default(false)->notNull();

            // Campos de control: created_at y updated_at (automáticamente gestionados por Laravel)
            $table->timestamps();

            // Clave foránea que relaciona al usuario con un empleado (opcional para empleados especificos como JEFATURAS)
            $table->foreignId('id_empleado')->nullable()->constrained('tableEmpleados', 'id_empleado')->onDelete('restrict');

            // Clave foránea que relaciona al usuario con un departamento (opcional para empleados genericos que COMPARTEN usuario)
            $table->foreignId('id_departamento')->nullable()->constrained('tableDepartamentos', 'id_departamento')->onDelete('restrict');




            // Índices para mejorar el rendimiento de las consultas
            $table->index('nombre_usuario'); // Índice para búsquedas por nombre de usuario
            $table->index('estatus_activo'); // Índice para filtros por estatus del usuario
        });
    }

    /*
    public function down(): void
    {
        // Eliminar las claves foráneas que dependen de 'tableUsuarios'
        Schema::disableForeignKeyConstraints(); // Desactivar restricciones de clave foránea temporalmente

        // Eliminar la tabla 'tableUsuarios'
        Schema::dropIfExists('tableUsuarios');

        Schema::enableForeignKeyConstraints(); // Reactivar restricciones de clave foránea
    }
*/
    public function down(): void
    {
        // Eliminar la tabla con CASCADE para eliminar también las dependencias
        DB::statement('DROP TABLE IF EXISTS tableUsuarios CASCADE;');
    }
};
