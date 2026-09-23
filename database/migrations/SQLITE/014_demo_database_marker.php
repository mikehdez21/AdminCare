<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demo_database_marker', function (Blueprint $table): void {
            $table->unsignedTinyInteger('id')->primary();
            $table->string('marker', 64)->unique();
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demo_database_marker');
    }
};
