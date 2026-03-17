<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * Los URIs que deberían ser excluidos de la verificación CSRF.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Excluir rutas específicas si es necesario (generalmente públicas)
    ];

    /**
     * Indica si el middleware debe agregar el cookie XSRF-TOKEN a las respuestas.
     * ✅ Debe estar en true para Sanctum SPA
     */
    protected $addHttpCookie = true;
}
