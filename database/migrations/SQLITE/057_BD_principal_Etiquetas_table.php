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
        // Crear la tabla de etiquetas dentro del esquema 'helpdesk'
        Schema::create(SchemaTable::helpdesk('tableMA_Etiquetas'), function (Blueprint $table) {
            // Identificador único de la etiqueta (clave primaria)
            $table->bigIncrements('id_etiqueta');

            // Nombre de la etiqueta (obligatorio y único)
            $table->string('nombre_etiqueta', 50)->unique();

            // Color hex de la etiqueta para la interfaz (opcional, con valor por defecto)
            $table->string('color', 7)->nullable()->default('#6C757D');

            // Campos de control: created_at y updated_at
            $table->timestamps();
        });

        // Insertar las etiquetas iniciales
        DB::table(SchemaTable::helpdesk('tableMA_Etiquetas'))->insert([
            ['nombre_etiqueta' => 'Urgente', 'color' => '#DC3545', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_etiqueta' => 'Repetitivo', 'color' => '#FFC107', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_etiqueta' => 'Requiere compra', 'color' => '#17A2B8', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_etiqueta' => 'Garantía', 'color' => '#28A745', 'created_at' => now(), 'updated_at' => now()],
            ['nombre_etiqueta' => 'Externo', 'color' => '#6F42C1', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la tabla de etiquetas
        Schema::dropIfExists(SchemaTable::helpdesk('tableMA_Etiquetas'));
    }
};
