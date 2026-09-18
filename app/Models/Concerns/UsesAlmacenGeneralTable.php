<?php

namespace App\Models\Concerns;

trait UsesAlmacenGeneralTable
{
    /** Resolve production's PostgreSQL schema without breaking SQLite demo tables. */
    public function getTable()
    {
        $table = parent::getTable();

        return $this->getConnection()->getDriverName() === 'pgsql'
            && ! str_contains($table, '.')
            ? 'almacengeneral.'.$table
            : $table;
    }
}
