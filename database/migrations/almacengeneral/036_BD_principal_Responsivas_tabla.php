<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('almacengeneral.tableAF_Responsivas', function (Blueprint $table) {
            $table->bigIncrements('id_responsiva')->primary();
            
            // Código único de la responsiva
            $table->string('codigo_responsiva', 50)->unique()->notNull();
            
            // Relación con empleado
            $table->foreignId('id_empleado')->constrained('tableEmpleados', 'id_empleado')->onDelete('restrict');
            
            // Fechas 
            $table->date('fecha_entrega')->notNull();
            $table->date('fecha_devolucion_estimada')->nullable();
            $table->date('fecha_devolucion_real')->nullable();
            
            //ipo de responsiva
            $table->foreignId('id_tipo_responsiva')->constrained('almacengeneral.tableRef_TipoResponsiva', 'id_tipo_responsiva')->onDelete('restrict');
            
            // Estatus de la responsiva
            $table->foreignId('estatus_responsiva')->constrained('almacengeneral.tableRef_EstatusResponsiva', 'id_estatus_responsiva')->onDelete('restrict');
            
            // Información adicional
            $table->text('descripcion')->nullable();
            $table->text('observaciones')->nullable();
        
            // Fecha de registro
            $table->date('fecha_registro')->notNull();
            
            $table->timestamps();
            
            // Índices
            $table->index('fecha_entrega', 'idx_fecha_entrega');
            $table->index(['id_empleado', 'estatus_responsiva'], 'idx_empleado_estatus'); // Índice compuesto
        });
    }

    public function down()
    {
        Schema::dropIfExists('almacengeneral.tableAF_Responsivas');
    }
};