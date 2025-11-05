<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('almacengeneral.tableAF_DetalleResponsivas', function (Blueprint $table) {
            $table->bigIncrements('id_detalle_responsiva')->primary();
            
            // Relación con responsiva
            $table->foreignId('id_responsiva')->constrained('almacengeneral.tableAF_Responsivas', 'id_responsiva')->onDelete('cascade');
            
            // Relación con activo fijo
            $table->foreignId('id_activo_fijo')->constrained('almacengeneral.tableAF_ActivosFijos', 'id_activo_fijo')->onDelete('restrict');
            
            // Estado del activo al momento de la entrega
            $table->foreignId('condicion_entregaaf')->constrained('almacengeneral.tableRef_CondicionesAF', 'id_condicion_af')->onDelete('restrict');
            
            $table->text('descripcion_condicion_entrega')->nullable();
            
            // Estado del activo al momento de la devolución
            $table->foreignId('condicion_devolucionaf')->constrained('almacengeneral.tableRef_CondicionesAF', 'id_condicion_af')->onDelete('restrict');
            
            // Descripción adicional sobre la condición de devolución
            $table->text('descripcion_condicion_devolucion')->nullable();
            
            // Fecha de devolución individual
            $table->date('fecha_devolucion')->nullable();
            
            // Observaciones específicas del activo
            $table->text('observaciones_detalle')->nullable();
            
            $table->timestamps();
            
            // Restricción: un activo solo puede estar una vez en la misma responsiva
            $table->unique(['id_responsiva', 'id_activo_fijo'], 'uk_responsiva_activo');
            
            // Índices
            $table->index('fecha_devolucion', 'idx_fecha_devolucion');
            });
    }

    public function down()
    {
        Schema::dropIfExists('almacengeneral.tableAF_DetalleResponsivas');
    }
};