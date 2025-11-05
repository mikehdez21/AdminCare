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

        // Crear la tabla 'af_depreciacion' dentro del esquema 'almacengeneral'
        Schema::create('almacengeneral.tableAF_Depreciacion', function (Blueprint $table) {
            // ID de la factura (Clave primaria autoincremental)
            $table->bigIncrements('id_depreciacionaf')->primary();

            // Clave foránea que referencia a la tabla de activos fijos en 'almacengeneral'
            $table->foreignId('id_activo_fijo')->constrained('almacengeneral.tableAF_ActivosFijos', 'id_activo_fijo')->onDelete('restrict');

            // Año de la depreciación
            $table->integer('anio_depreciacionaf')->notNull();

            // Valor inicial del activo fijo para la depreciación
            $table->decimal('valor_inicialaf', 21, 2)->notNull();

            // Valor de la depreciación anterior
            $table->decimal('valor_depreciacion_anterior', 21, 2)->notNull()->default(0);

            // Valor Depreciación Acumulada hasta la fecha
            $table->decimal('valor_depreciacion_acumulada', 21, 2)->notNull();

            // Valor de la depreciación del año
            $table->decimal('valor_depreciacion_anual', 21, 2)->notNull();

            // Valor en libros del activo fijo después de la depreciación
            $table->decimal('valor_libros_af', 21, 2)->notNull();

            // Método de depreciación (cadena de texto, opcional)
            $table->string('metodo_depreciacionaf', 100)->nullable();

            // Fecha del calculo de la depreciación
            $table->date('fecha_calculo_depreciacion')->notNull();

            // Observaciones adicionales sobre la depreciación
            $table->text('observaciones_depreciacionaf')->nullable();

            // Campos de timestamps para registrar la fecha de creación y actualización de la factura
            $table->timestamps();

            // Índices para mejorar el rendimiento de las consultas
            $table->index('fecha_calculo_depreciacion', 'idx_fecha_calculo_depreciacion');
            $table->index(['id_activo_fijo', 'fecha_calculo_depreciacion'], 'idx_activo_fecha_calculo');

        });
    }

    public function down()
    {
        // Eliminar la tabla 'tableAF_Depreciacion' en caso de revertir la migración
        Schema::dropIfExists('almacengeneral.tableAF_Depreciacion');
    }
};
