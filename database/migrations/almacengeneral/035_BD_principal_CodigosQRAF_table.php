<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('almacengeneral.tableAF_CodigosQR', function (Blueprint $table) {
            // ID único del código QR (clave primaria)
            $table->bigIncrements('id_qraf');
            
            // Clave foránea que referencia al activo fijo asociado (única y no nula)
            $table->foreignId('id_activo_fijo')
                ->unique()
                ->constrained('almacengeneral.tableAF_ActivosFijos', 'id_activo_fijo')
                ->onDelete('cascade');

            // Código QR generado (cadena de texto única y no nula)
            $table->string('codigo_qr', 100)->unique();

            // URL de destino asociada al código QR (cadena de texto no nula)
            $table->string('url_destino', 500);

            // Fecha de generación del código QR (timestamp, no nula, valor por defecto: fecha y hora actual)
            $table->timestamp('fecha_generacion')->useCurrent();

            // Fecha del último escaneo del código QR (timestamp, puede ser nula)
            $table->timestamp('fecha_ultimo_escaneo')->nullable();

            // Indicador de si el código QR está activo (booleano, valor por defecto: true)
            $table->boolean('activo')->default(true);

            // Número de intentos de lectura del código QR (entero, valor por defecto: 0)
            $table->integer('intentos_lectura')->default(0);

            // Timestamps para registrar la fecha de creación y actualización del registro
            $table->timestamps();
            $table->text('observaciones')->nullable();

            // Índices para mejorar el rendimiento de las consultas
            $table->index('id_activo_fijo', 'idx_activo_fijo_qr');


        });
    }

    public function down()
    {
        Schema::dropIfExists('almacengeneral.tableAF_CodigosQR');
    }
};