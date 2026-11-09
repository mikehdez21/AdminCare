# API — Helpdesk completo

## 1. Prefijo y envelope

- Prefijo: `/api`.
- Envelope: `{ success, message, data }`.
- Auth: Sanctum + sesión + CSRF.

## 2. Autenticación

Cambios:

- `GET /api/auth/check` agrega `alcances` y `user.departamentos_atiende`.
- `POST /api/auth/login` agrega `alcances` y actualiza `ultimo_acceso`.
- `GET /api/auth/permissions` agrega `alcances`.

Payload:

```json
{
  "success": true,
  "user": {
    "id_usuario": 1,
    "nombre_usuario": "DEMOADMIN",
    "atiende_helpdesk": true,
    "departamentos_atiende": [
      { "id_departamento": 3, "nombre_departamento": "Sistemas" }
    ]
  },
  "rol": "Admin",
  "permissions": ["helpdesk.tickets.lectura"],
  "alcances": {
    "helpdesk.tickets": "global",
    "helpdesk.reportes": "global"
  },
  "departamento": "Sistemas"
}
```

## 3. Lectura

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/helpdesk/categorias` | `helpdesk.mis_tickets.lectura` |
| GET | `/api/helpdesk/categorias/{id}` | `helpdesk.mis_tickets.lectura` |
| GET | `/api/helpdesk/categorias/{id}/titulos` | `helpdesk.mis_tickets.lectura` |
| GET | `/api/helpdesk/subcategorias` | `helpdesk.mis_tickets.lectura` |
| GET | `/api/helpdesk/titulos` | `helpdesk.mis_tickets.lectura` |
| GET | `/api/helpdesk/prioridades` | `helpdesk.mis_tickets.lectura` |
| GET | `/api/helpdesk/estatus` | `helpdesk.mis_tickets.lectura` |
| GET | `/api/helpdesk/etiquetas` | `helpdesk.mis_tickets.lectura` |
| GET | `/api/helpdesk/empleados` | `helpdesk.mis_tickets.lectura` |
| GET | `/api/helpdesk/proveedores-error` | `helpdesk.mis_tickets.lectura` |
| GET | `/api/helpdesk/sistemas-proveedor` | `helpdesk.mis_tickets.lectura` |
| GET | `/api/helpdesk/modulos-siho` | `helpdesk.mis_tickets.lectura` |
| GET | `/api/helpdesk/tickets` | `helpdesk.tickets.lectura` o `helpdesk.mis_tickets.lectura` |
| GET | `/api/helpdesk/tickets/{id}` | `helpdesk.tickets.lectura` o `helpdesk.mis_tickets.lectura` |
| GET | `/api/helpdesk/tickets/{id}/avances` | `helpdesk.tickets.lectura` o `helpdesk.mis_tickets.lectura` |
| GET | `/api/helpdesk/dashboard` | `helpdesk.reportes.lectura` |

## 4. Escritura

| Método | Ruta | Permiso |
|---|---|---|
| POST | `/api/helpdesk/tickets` | `helpdesk.mis_tickets.escritura` |
| PUT | `/api/helpdesk/tickets/{id}/reabrir` | `helpdesk.mis_tickets.escritura` |
| POST | `/api/helpdesk/tickets/{id}/encuesta` | `helpdesk.mis_tickets.escritura` |
| PUT | `/api/helpdesk/tickets/{id}` | `helpdesk.tickets.escritura` |
| PUT | `/api/helpdesk/tickets/{id}/cambiar-estado` | `helpdesk.tickets.escritura` |
| PUT | `/api/helpdesk/tickets/{id}/tecnicos` | `helpdesk.tickets.escritura` |
| PUT | `/api/helpdesk/tickets/{id}/error-proveedor` | `helpdesk.tickets.escritura` |
| PUT | `/api/helpdesk/tickets/{id}/cerrar` | `helpdesk.tickets.escritura` |
| POST | `/api/helpdesk/tickets/{id}/avances` | `helpdesk.tickets.escritura` |
| DELETE | `/api/helpdesk/avances/{id}` | `helpdesk.tickets.escritura` |

## 5. Configuración

| Método | Ruta |
|---|---|
| POST/PUT/DELETE | `/api/helpdesk/categorias` |
| POST/PUT/DELETE | `/api/helpdesk/subcategorias` |
| POST/PUT/DELETE | `/api/helpdesk/titulos` |
| POST/PUT/DELETE | `/api/helpdesk/prioridades` |
| GET/POST/PUT/DELETE | `/api/helpdesk/slas` |
| POST/PUT/DELETE | `/api/helpdesk/etiquetas` |
| POST/PUT/DELETE | `/api/helpdesk/estatus` |
| POST/PUT/DELETE | `/api/helpdesk/proveedores-error` |
| POST/PUT/DELETE | `/api/helpdesk/sistemas-proveedor` |
| POST/PUT/DELETE | `/api/helpdesk/modulos-siho` |

Permiso: `helpdesk.configuracion.escritura`.

## 6. Listado de tickets

Parámetros:

- `page`, `per_page`, `search`, `sort`, `direction`, `filtros[...]`.

Reglas:

- Alcance aplicado por backend.
- No `per_page` en tickets: el controlador fuerza paginación para la mesa.
- `meta` con página, total y orden.

## 7. Errores

- `401` no autenticado.
- `403` sin permiso o fuera de alcance.
- `404` ticket/catálogo inexistente.
- `422` validación/transición inválida.
- `500` error interno.

## 8. Correo

- No hay endpoint.
- No se devuelve error si el correo demo está apagado.
- La creación/cambio/cierre devuelve el resultado normal.
- El aviso es visual en el frontend.
