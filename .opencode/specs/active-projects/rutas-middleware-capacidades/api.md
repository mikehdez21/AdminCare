# API — Rutas y middleware

## Contrato

No cambia:

- URLs.
- Métodos.
- Payloads.
- Envelope `{ success, message, data }`.
- Códigos HTTP.

## Middleware

Cambia solo la autorización. Ejemplos:

### Antes

```php
Route::middleware('permission:sidebar_submenu_administrador_gestionusuarios')
```

### Después

```php
$lectura = Permisos::middleware('admin.usuarios', 'lectura');
Route::middleware(PermissionMiddleware::class.':'.$lectura)
```

## Respuestas de autorización

| Caso | Código | Cuerpo |
|---|---|---|
| Sin sesión | 401 | `success: false` |
| Sin permiso | 403 | `success: false` |
| Permiso válido | 200/201/204 | Sin cambios |

## Endpoints de catálogo

No cambian de ruta. Se les permite lectura con:

```text
catalogos.departamentos.lectura|admin.departamentos.lectura
catalogos.ubicaciones.lectura|admin.ubicaciones.lectura
catalogos.empleados.lectura|admin.empleados.lectura
```

## Fuera de alcance

- Helpdesk.
- Alcances.
- Nuevos endpoints.
- Cambios de controladores.
