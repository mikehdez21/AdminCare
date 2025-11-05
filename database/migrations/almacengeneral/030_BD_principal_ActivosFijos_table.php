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

            // Valor de Compra del activo fijo
            $table->decimal('valor_compra_af', 11, 2)->nullable();

            // Fecha de compra del activo fijo
            $table->date('fecha_compra_af')->nullable();

            // Estado del activo ('Activo' o 'Baja' o 'En Mantenimiento' o 'Extraviado' etc.)
            $table->foreignId('id_estado_af')->constrained('almacengeneral.tableRef_EstatusAF', 'id_estatusaf')->default(1)->onDelete('restrict');

            // Relación con la tabla 'tableclasificaciones', representando la clasificación del activo
            $table->foreignId('id_clasificacion')->notNull()->constrained('almacengeneral.tableRef_ClasificacionesAF', 'id_clasificacion')->onDelete('restrict');

            // Relación con la tabla 'tableubicaciones', representando la ubicación física del activo
            $table->foreignId('id_ubicacion')->notNull()->constrained('tableUbicaciones', 'id_ubicacion')->onDelete('restrict');

            // Relación con la tabla 'empleados', representando el responsable del activo
            $table->foreignId('id_responsable')->notNull()->constrained('tableEmpleados', 'id_empleado')->onDelete('restrict');
            
            // Relación con la tabla 'departamentos', representando el departamento al que pertenece el activo
            $table->foreignId('id_departamento')->notNull()->constrained('tableDepartamentos', 'id_departamento')->onDelete('restrict');
            
            // Fecha de registro del activo en el sistema
            $table->date('fecha_registro_af')->notNull();

            // Observaciones adicionales sobre el activo
            $table->text('observaciones_af')->nullable();
            
            // Campos de fecha de creación y actualización con zona horaria
            $table->timestamps();

            // Índices para mejorar el rendimiento de las consultas
            $table->index('nombre_af', 'idx_nombre_af'); // Índice para búsquedas por nombre del activo_fijo
            $table->index('codigo_unico', 'idx_codigo_unico'); // Índice para búsquedas por código único
            $table->index('fecha_compra_af', 'idx_fecha_compra_af'); // Índice para consultas por fecha de compra
            $table->index('marca_af', 'idx_marca_af'); // Índice para consultas por marca


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
