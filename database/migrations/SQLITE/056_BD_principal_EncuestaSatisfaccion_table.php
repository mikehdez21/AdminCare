<?php

use App\Support\SchemaTable;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Crear la tabla de encuestas de satisfacción dentro del esquema 'helpdesk'
        Schema::create(SchemaTable::helpdesk('tableMA_EncuestaSatisfaccion'), function (Blueprint $table) {
            // Identificador único de la encuesta (clave primaria)
            $table->bigIncrements('id_encuesta_satisfaccion');

            // Ticket evaluado (obligatorio y único)
            $table->unsignedBigInteger('id_ticket');

            // Calificación de satisfacción (1 a 5)
            $table->smallInteger('calificacion');

            // Comentario de la encuesta (opcional)
            $table->text('comentario_satisfaccion')->nullable();

            // Usuario que evalúa la satisfacción (obligatorio)
            $table->unsignedBigInteger('id_usuario_evaluador');

            // Campos de control: created_at y updated_at
            $table->timestamps();

            // Claves foráneas
            $table->foreign('id_ticket')->references('id_ticket')->on(SchemaTable::helpdesk('tableMA_Tickets'))->onDelete('cascade');
            $table->foreign('id_usuario_evaluador')->references('id_usuario')->on('tableUsuarios')->onDelete('restrict');

            // Restricción única: una sola encuesta por ticket
            $table->unique('id_ticket', 'uk_encuesta_ticket');
        });

        // Restricción CHECK: la calificación debe estar entre 1 y 5
        DB::statement('ALTER TABLE helpdesk."tableMA_EncuestaSatisfaccion" ADD CONSTRAINT chk_encuesta_calificacion CHECK (calificacion BETWEEN 1 AND 5)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la tabla de encuestas de satisfacción
        Schema::dropIfExists(SchemaTable::helpdesk('tableMA_EncuestaSatisfaccion'));
    }
};
