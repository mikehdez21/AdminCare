# API — Permisos por capacidad

## Contrato existente

No cambia el envelope:

```json
{ "success": true, "message": "...", "data": {} }
```

## Autenticación

`GET /api/auth/check`, `POST /api/auth/login` y `GET /api/auth/permissions` siguen devolviendo `permissions` como arreglo de nombres.

En esta fase:

- No se agregan `alcances`.
- No se agregan `departamentos_atiende`.
- No cambia el formato de `user`.

## Roles

Se conservan las rutas actuales del controlador de roles.

### Cambio interno

`PUT/POST` de asignación de permisos:

- Recibe los permisos nuevos seleccionados.
- Conserva los permisos legacy del rol.
- Guarda la unión.

No cambia la URL ni el método.

## Errores

- `401` no autenticado.
- `403` sin permiso (sigue usando los permisos legacy en esta fase).
- `422` validación.
- `500` error interno.

## Fuera de alcance

- Cambiar middleware de rutas.
- Agregar endpoints de alcances.
- Agregar permisos de Helpdesk.
