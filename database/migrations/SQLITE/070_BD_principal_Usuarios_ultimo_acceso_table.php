<?php

use App\Support\SchemaTable;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Último acceso del usuario.
 *
 * `AuthController::login` ya intentaba escribirla y `UserController` la
 * documenta, pero ninguna migración la creaba: el login respondía 500 después
 * de autenticar. Es nullable para no romper los usuarios existentes.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('tableUsuarios', 'ultimo_acceso')) {
            Schema::table('tableUsuarios', function (Blueprint $table) {
                $table->timestamp('ultimo_acceso')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('tableUsuarios', 'ultimo_acceso')) {
            Schema::table('tableUsuarios', function (Blueprint $table) {
                $table->dropColumn('ultimo_acceso');
            });
        }
    }
};
