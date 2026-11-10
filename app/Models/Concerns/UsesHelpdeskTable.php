<?php

namespace App\Models\Concerns;

/**
 * Resuelve el esquema `helpdesk` en PostgreSQL y tablas planas en SQLite.
 *
 * Los modelos conservan el nombre con prefijo `helpdesk.` del main. En la demo
 * SQLite el trait lo quita; en PostgreSQL lo mantiene.
 */
trait UsesHelpdeskTable
{
    public function getTable()
    {
        $table = parent::getTable();
        $driver = $this->getConnection()->getDriverName();
        $prefijo = 'helpdesk.';

        if (str_starts_with($table, $prefijo)) {
            return $driver === 'pgsql' ? $table : substr($table, strlen($prefijo));
        }

        return $driver === 'pgsql' ? $prefijo.$table : $table;
    }
}
