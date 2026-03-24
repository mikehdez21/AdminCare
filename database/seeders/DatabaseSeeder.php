<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

// Seeders Admin
use Database\Seeders\table_DepartamentosSeeder;
use Database\Seeders\table_RolesSeeder;
use Database\Seeders\table_UsersSeeder;
use Database\Seeders\table_EmpleadosSeeder;

// Seeders AlmacenGeneral
use Database\Seeders\AlmacenGeneral\table_ProveedoresSeeder;
use Database\Seeders\AlmacenGeneral\table_ActivosFijosConFacturasSeeder;
use Database\Seeders\AlmacenGeneral\table_MovimientosActivosSeeder;


class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            table_DepartamentosSeeder::class,
            table_EmpleadosSeeder::class,
            table_RolesSeeder::class,
            table_UsersSeeder::class,
            table_ProveedoresSeeder::class,
            table_ActivosFijosConFacturasSeeder::class,
            table_MovimientosActivosSeeder::class,
        ]);
    }
}
