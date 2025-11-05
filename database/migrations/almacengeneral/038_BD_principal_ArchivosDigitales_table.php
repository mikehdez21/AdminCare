<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('almacengeneral.tableAF_ArchivosDigitales', function (Blueprint $table) {
            // ID único del adjunto (clave primaria)
            $table->bigIncrements('id_adjunto')->primary();
            
            // Información del archivo
            $table->string('nombre_original', 255)->notNull(); // Nombre original del archivo
            $table->string('nombre_almacenado', 255)->notNull()->unique(); // Nombre único en el servidor
            $table->string('tipo_contenido', 100)->notNull(); // MIME type (ej: application/pdf, image/jpeg)
            $table->bigInteger('tamano')->notNull(); // Tamaño en bytes
            $table->text('ruta_archivo')->notNull(); // Ruta relativa o absoluta del archivo
            $table->text('descripcion')->nullable(); // Descripción opcional del archivo
            
            // Referencia polimórfica
            $table->string('tabla_referencia', 100)->notNull(); // Nombre de la tabla referenciada
            $table->unsignedBigInteger('id_referencia')->notNull(); // ID del registro referenciado
            
            // Usuario que subió el archivo
            $table->foreignId('id_usuario_subida')
                ->nullable()
                ->constrained('tableUsuarios', 'id_usuario')
                ->onDelete('set null');
            
            // Fecha de subida
            $table->timestamp('fecha_subida')->useCurrent();
            
            // Indicador de si el archivo está activo
            $table->boolean('activo')->default(true);
            
            // Metadatos adicionales (opcional)
            $table->json('metadata')->nullable(); // Para guardar info extra (ej: dimensiones de imagen, duración de video)
            
            $table->timestamps();
            
            // Índices para mejorar el rendimiento
            $table->index(['tabla_referencia', 'id_referencia'], 'idx_referencia_archivo');
            $table->index('fecha_subida', 'idx_fecha_subida');
            $table->index('activo', 'idx_activo_archivo');
            $table->index('tipo_contenido', 'idx_tipo_contenido');
        });
    }

    public function down()
    {
        Schema::dropIfExists('almacengeneral.tableAF_ArchivosDigitales');
    }
};