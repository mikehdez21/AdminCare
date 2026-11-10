<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/**
 * Nombres de tabla portables entre PostgreSQL (esquemas) y SQLite (tablas planas).
 *
 * El fork demo usa SQLite; la versión PostgreSQL conserva el esquema del main.
 * Las expresiones SQL de paginación/orden necesitan el nombre calificado en
 * PostgreSQL y el nombre plano en SQLite.
 */
final class SchemaTable
{
    public static function almacen(string $tabla): string
    {
        return DB::connection()->getDriverName() === 'pgsql'
            ? 'almacengeneral.'.$tabla
            : $tabla;
    }

    public static function almacenQuoted(string $tabla): string
    {
        return DB::connection()->getDriverName() === 'pgsql'
            ? '"almacengeneral"."'.$tabla.'"'
            : '"'.$tabla.'"';
    }

    public static function helpdesk(string $tabla): string
    {
        return DB::connection()->getDriverName() === 'pgsql'
            ? 'helpdesk.'.$tabla
            : $tabla;
    }

    public static function helpdeskQuoted(string $tabla): string
    {
        return DB::connection()->getDriverName() === 'pgsql'
            ? '"helpdesk"."'.$tabla.'"'
            : '"'.$tabla.'"';
    }
}
