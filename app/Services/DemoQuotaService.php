<?php

namespace App\Services;

use App\Exceptions\DemoQuotaExceeded;
use Illuminate\Support\Facades\DB;

class DemoQuotaService
{
    public const LIMIT = 100;

    public function assertCanAdd(int $requested): void
    {
        if ($requested < 0) {
            throw new \InvalidArgumentException('Invalid quota delta.');
        }

        // The update acquires SQLite's write lock before counting. Callers must
        // invoke this from their write transaction, including nested services.
        DB::table('demo_quota_lock')->where('id', 1)->update(['updated_at' => now()]);

        $used = DB::table('tableAF_Proveedores')->count()
            + DB::table('tableAF_Facturas')->count()
            + DB::table('tableAF_ActivosFijos')->count();

        if ($used + $requested > self::LIMIT) {
            throw new DemoQuotaExceeded($used, $requested);
        }
    }
}
