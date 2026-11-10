<?php

use App\Support\SchemaTable;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Marca los departamentos que pueden recibir tickets del Helpdesk.
 *
 * Sin este campo, el Helpdesk tomaba los nueve departamentos del hospital,
 * incluidos los que no dan soporte (Recursos Humanos, Contabilidad, Auditoría).
 * El Helpdesk lo usa como lista cerrada: aquí se elige qué áreas atienden
 * tickets y cuál es el responsable de cada categoría.
 *
 * Backfill: ninguno. Todo departamento nace en `false` y se marca a mano desde la
 * UI de Departamentos, que es donde se decide qué áreas dan soporte.
 *
 * Va en la raíz de `database/migrations` y no en `05_helpdesk` porque la columna
 * pertenece a una tabla de HSS principal, no al esquema `helpdesk`. La
 * enumeración es global y correlativa: la 058 es la última de `05_helpdesk`, así
 * que esta continúa en 059 sin huecos ni repeticiones.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tableDepartamentos', function (Blueprint $table) {
            $table->boolean('atiende_helpdesk')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('tableDepartamentos', function (Blueprint $table) {
            $table->dropColumn('atiende_helpdesk');
        });
    }
};
