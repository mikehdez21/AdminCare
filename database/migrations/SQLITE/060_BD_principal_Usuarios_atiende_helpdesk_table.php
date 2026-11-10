<?php

use App\Support\SchemaTable;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Marca los usuarios que pueden atender tickets del Helpdesk.
 *
 * Es el filtro de `PUT helpdesk/tickets/{id}/asignar-tecnico`. Sin él el selector
 * ofrecía cualquier usuario activo del hospital, incluidos los que no son técnicos:
 * asignarle un ticket a alguien lo deja como `esAtendientePor`, o sea con derecho
 * a escribir notas internas y a gestionar el ciclo de vida de ese ticket.
 *
 * Backfill: ninguno. Todo usuario nace en `false` y se marca a mano desde la UI de
 * Usuarios.
 *
 * Complementa a la 059 (`tableDepartamentos.atiende_helpdesk`), pero son
 * independientes a propósito: un departamento puede dar soporte y no tener aún a
 * nadie disponible, y un técnico puede estar marcado antes de que su área abra la
 * mesa de ayuda.
 *
 * Raíz de `database/migrations` por lo mismo que la 059: la tabla es de HSS
 * principal. La numeración es global y correlativa, así que continúa en 060.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tableUsuarios', function (Blueprint $table) {
            $table->boolean('atiende_helpdesk')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('tableUsuarios', function (Blueprint $table) {
            $table->dropColumn('atiende_helpdesk');
        });
    }
};
