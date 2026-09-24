# Acceptance — Criterios que el usuario confirmará

## Logout
- [ ] En producción (Render), cerrar sesión devuelve 200 `{ success: true, message }` y
      redirige a `/login` sin el Swal de error.
- [ ] Ya no aparece en los logs `BadMethodCallException: Method Illuminate\Auth\RequestGuard::logout does not exist`.
- [ ] El `error_id` que se generó (`be9b8f8d-...`) fue el último `Authentication logout failed`
      de este tipo (solo quedan logs históricos).

## Logout inactivo (ruta secundaria)
- [ ] `POST /api/auth/logout-inactive` responde 200 sin lanzar la misma excepción.

## Regresión
- [ ] Login sigue funcionando (ruta pública, guard web sin cambios).
- [ ] `check()` y `permissions()` sin cambios de comportamiento.
- [ ] `git diff --check` limpio.
- [ ] No se cambian: rutas, middleware, CSRF, frontend, esquema.

## Confirmación final
- [ ] El usuario confirma con prueba en prod que el logout funciona antes de archivar la spec.