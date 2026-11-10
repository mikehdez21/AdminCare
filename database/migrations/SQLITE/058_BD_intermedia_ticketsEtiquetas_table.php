<?php

use App\Support\SchemaTable;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Crear la tabla intermedia de la relación muchos a muchos entre tickets y etiquetas
        Schema::create(SchemaTable::helpdesk('tableInter_ticketsEtiquetas'), function (Blueprint $table) {
            // Clave foránea: ticket
            $table->unsignedBigInteger('id_ticket');

            // Clave foránea: etiqueta
            $table->unsignedBigInteger('id_etiqueta');

            // Definir las relaciones
            $table->foreign('id_ticket')->references('id_ticket')->on(SchemaTable::helpdesk('tableMA_Tickets'))->onDelete('cascade');
            $table->foreign('id_etiqueta')->references('id_etiqueta')->on(SchemaTable::helpdesk('tableMA_Etiquetas'))->onDelete('cascade');

            // Clave primaria compuesta
            $table->primary(['id_ticket', 'id_etiqueta']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la tabla intermedia de tickets y etiquetas
        Schema::dropIfExists(SchemaTable::helpdesk('tableInter_ticketsEtiquetas'));
    }
};
