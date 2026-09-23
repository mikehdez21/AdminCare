<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add the jefatura_empleado boolean column to tableEmpleados.
     *
     * The Empleado model, EmpleadoController and the frontend already use
     * jefatura_empleado, but the original schema (006) never declared it.
     * This repair migration upgrades existing demo databases safely: it adds
     * the column only when missing, with a default of false so existing rows
     * (and inserts that send NULL) keep working.
     */
    public function up(): void
    {
        if (! Schema::hasTable('tableEmpleados')) {
            return;
        }

        if (! Schema::hasColumn('tableEmpleados', 'jefatura_empleado')) {
            Schema::table('tableEmpleados', function (Blueprint $table) {
                $table->boolean('jefatura_empleado')->default(false);
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('tableEmpleados')) {
            return;
        }

        if (Schema::hasColumn('tableEmpleados', 'jefatura_empleado')) {
            Schema::table('tableEmpleados', function (Blueprint $table) {
                $table->dropColumn('jefatura_empleado');
            });
        }
    }
};