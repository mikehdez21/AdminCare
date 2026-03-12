<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

// Seeders Admin
use Database\Seeders\DepartamentosSeeder;
use Database\Seeders\RolesSeeder;
use Database\Seeders\UsersSeeder;
use Database\Seeders\EmpleadosSeeder;

// Seeders AlmacenGeneral
use Database\Seeders\AlmacenGeneral\table_ProveedoresSeeder;
use Database\Seeders\AlmacenGeneral\table_FacturasAFSeeder;
use Database\Seeders\AlmacenGeneral\table_ActivosFijosSeeder;
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
            table_ActivosFijosSeeder::class,
            table_FacturasAFSeeder::class,
            table_MovimientosActivosSeeder::class,

        ]);
    }
}
