<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demo_quota_lock', function (Blueprint $table): void {
            $table->id();
            $table->timestamp('updated_at')->nullable();
        });

        DB::table('demo_quota_lock')->insert(['id' => 1, 'updated_at' => now()]);
    }

    public function down(): void
    {
        Schema::dropIfExists('demo_quota_lock');
    }
};
