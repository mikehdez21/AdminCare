<?php

namespace App\Support;

use App\Models\User;
use InvalidArgumentException;

/**
 * Acceso único al mapa de permisos y a la cadena de acciones.
 *
 * La cadena vive aquí, no en las rutas ni en el frontend: `eliminar` implica
 * `escritura` y `escritura` implica `lectura`. Para consultar una capacidad se
 * usa `tiene()`, nunca `can('X.lectura')` a secas.
 */
final class Permisos
{
    public const ACCIONES = ['lectura', 'escritura', 'eliminar'];

    private const CADENA = [
        'lectura' => ['lectura', 'escritura', 'eliminar'],
        'escritura' => ['escritura', 'eliminar'],
        'eliminar' => ['eliminar'],
    ];

    /** @var array<string, array{recurso: string, accion: string, dominio: string, etiqueta: string, descripcion: string, acciones: array<int, string>}>|null */
    private static ?array $mapa = null;

    /**
     * Todos los permisos expandidos: nombre => metadatos.
     *
     * @return array<string, array{recurso: string, accion: string, dominio: string, etiqueta: string, descripcion: string, acciones: array<int, string>}>
     */
    public static function mapa(): array
    {
        if (self::$mapa !== null) {
            return self::$mapa;
        }

        $mapa = [];

        foreach (config('permisos.recursos', []) as $recurso => $definicion) {
            foreach ($definicion['acciones'] as $accion) {
                $mapa[$recurso.'.'.$accion] = [
                    'recurso' => $recurso,
                    'accion' => $accion,
                    'dominio' => $definicion['dominio'],
                    'etiqueta' => $definicion['etiqueta'],
                    'descripcion' => $definicion['descripcion'],
                    'acciones' => $definicion['acciones'],
                ];
            }
        }

        return self::$mapa = $mapa;
    }

    /** @return array<string, array<string, mixed>> */
    public static function recursos(): array
    {
        return config('permisos.recursos', []);
    }

    /** @return array<int, string> */
    public static function todos(): array
    {
        return array_keys(self::mapa());
    }

    /** @return array<int, string> */
    public static function accionesDe(string $recurso): array
    {
        return self::recursos()[$recurso]['acciones'] ?? [];
    }

    public static function existe(string $nombre): bool
    {
        return isset(self::mapa()[$nombre]);
    }

    /**
     * Cadena de middleware para una acción: solo incluye acciones que el
     * recurso declara. Un typo o una acción inexistente revienta al cargar las
     * rutas, no en un 403 silencioso.
     */
    public static function middleware(string $recurso, string $accion): string
    {
        $acciones = array_values(array_intersect(
            self::CADENA[$accion] ?? [],
            self::accionesDe($recurso)
        ));

        if ($acciones === []) {
            throw new InvalidArgumentException(
                "El recurso [{$recurso}] no tiene la acción [{$accion}] o no existe en config/permisos.php."
            );
        }

        return implode('|', array_map(fn (string $a) => $recurso.'.'.$a, $acciones));
    }

    /**
     * Si el usuario tiene la capacidad, aplicando la cadena de acciones.
     */
    public static function tiene(User $usuario, string $recurso, string $accion): bool
    {
        foreach (self::CADENA[$accion] ?? [] as $candidata) {
            if ($usuario->can($recurso.'.'.$candidata)) {
                return true;
            }
        }

        return false;
    }
}
