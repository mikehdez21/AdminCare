# API

## 1. Convenciones

- Prefijo actual del fork: `/api`.
- Autenticación: Sanctum + sesión + CSRF.
- Envelope estándar:

```json
{
  "success": true,
  "message": "Texto.",
  "data": {}
}
```

- Errores:

```json
{
  "success": false,
  "message": "Texto.",
  "errors": {}
}
```

- Códigos: `401` no autenticado, `403` sin permiso, `404` no encontrado, `422` validación/regla de negocio, `500` error interno.
- No se reintroduce `/api/HSS1`.

## 2. Autenticación

### Rutas existentes

| Método | Ruta | Cambio |
|---|---|---|
| GET | `/api/auth/check` | Agrega `alcances` y `user.departamentos_atiende` |
| POST | `/api/auth/login` | Agrega `alcances`; actualiza `ultimo_acceso` |
| POST | `/api/auth/register` | Se conserva |
| GET | `/api/auth/permissions` | Agrega `alcances` |
| POST | `/api/auth/logout` | Se conserva flujo del fork |
| POST | `/api/auth/logout-inactive` | Se conserva flujo del fork |

### Payload de login/check

```json
{
  "success": true,
  "message": "Login exitoso!",
  "user": {
    "id_usuario": 1,
    "nombre_usuario": "DEMOADMIN",
    "email_usuario": "demo.admin@example.invalid",
    "atiende_helpdesk": true,
    "departamentos_atiende": [
      { "id_departamento": 3, "nombre_departamento": "Sistemas" }
    ]
  },
  "rol": "Admin",
  "permissions": ["helpdesk.tickets.lectura", "..."],
  "alcances": {
    "helpdesk.tickets": "global",
    "helpdesk.reportes": "global"
  },
  "departamento": "Sistemas"
}
```

## 3. Helpdesk — lectura

Permiso base: `helpdesk.mis_tickets.lectura` o `helpdesk.tickets.lectura` según grupo.

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

Reglas:

- El alcance se aplica en el backend; el frontend no filtra la mesa por su cuenta.
- Un solicitante solo ve sus tickets.
- Un técnico ve los de su departamento según `atiende_helpdesk`.
- Admin puede ver todo si tiene alcance global.
- `GET /api/helpdesk/tickets` acepta filtros, búsqueda y paginación.

## 4. Helpdesk — escritura

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

Reglas:

- Solo el solicitante, el responsable o alguien con `helpdesk.internas.escritura` puede operar el ciclo de vida.
- Las notas internas requieren `helpdesk.internas.escritura`.
- Las transiciones de estatus son las del `TicketService` del main.
- El cierre exitoso permite encuesta.
- El error de proveedor se guarda en `tableMA_ErroresProveedor`.

## 5. Helpdesk — configuración

Permiso: `helpdesk.configuracion.escritura`.

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

Lectura de configuración: `helpdesk.configuracion.lectura` (si se decide separar lectura de escritura) o la lectura base de Helpdesk.

## 6. Administrador y Almacén

Se conservan las rutas actuales; cambia el middleware y se agregan parámetros de listado.

### Parámetros de listado

```text
GET /api/admin/usuarios?page=1&per_page=10&search=ana&sort=nombre&direction=asc&filtros[estatus]=1
```

| Parámetro | Tipo | Regla |
|---|---|---|
| `page` | entero | >= 1 |
| `per_page` | entero | 1..100; sin él, lista completa |
| `search` | texto | búsqueda global |
| `sort` | texto | clave de whitelist |
| `direction` | `asc`/`desc` | default del endpoint |
| `filtros[clave]` | texto/booleano/fecha | whitelist del controlador |

Respuesta paginada:

```json
{
  "success": true,
  "message": "Listado obtenido.",
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total": 42,
    "last_page": 5,
    "search": "ana",
    "sort": "nombre",
    "direction": "asc"
  }
}
```

### Permisos por módulo

| Módulo | Lectura | Escritura | Eliminar |
|---|---|---|---|
| Almacén | `almacen.lectura` | `almacen.escritura` | `almacen.eliminar` |
| Contabilidad depreciación | `contabilidad.depreciacion.lectura` | `.escritura` | — |
| Métodos | `contabilidad.metodos.lectura` | `.escritura` | `.eliminar` |
| Auditoría | `contabilidad.auditoria.lectura` | `.escritura` | `.eliminar` |
| Usuarios | `admin.usuarios.lectura` | `.escritura` | `.eliminar` |
| Empleados | `admin.empleados.lectura` | `.escritura` | `.eliminar` |
| Roles | `admin.roles.lectura` | `.escritura` | `.eliminar` |
| Departamentos | `admin.departamentos.lectura` | `.escritura` | `.eliminar` |
| Ubicaciones | `admin.ubicaciones.lectura` | `.escritura` | `.eliminar` |

## 7. Catálogos compartidos

Para selects de otros módulos, sin abrir Administración:

| Ruta | Permiso |
|---|---|
| `GET /api/admin/departamentos` (lectura para selects) | `catalogos.departamentos.lectura` o `admin.departamentos.lectura` |
| `GET /api/admin/ubicaciones` | `catalogos.ubicaciones.lectura` o `admin.ubicaciones.lectura` |
| `GET /api/admin/empleados` | `catalogos.empleados.lectura` o `admin.empleados.lectura` |

La ruta exacta se decide al reescribir `routes/api.php`; se debe evitar duplicar endpoints si el mismo controlador puede servir ambos permisos con un OR.

## 8. Correo demo

- No hay endpoint de correo.
- Las notificaciones se generan en backend, pero `NotificaUsuarios` no despacha si `DEMO_MAIL_ENABLED=false`.
- La UI muestra el aviso; la API no debe responder error por correo.
- Si en el futuro se habilita correo, se cambia la variable y se configura el mailer; no se modifica el contrato de tickets.

## 9. Compatibilidad

- Los endpoints existentes de Almacén y Administración no cambian de ruta ni de método.
- Los clientes que no envían `per_page` siguen recibiendo lista completa.
- Los filtros/orden inválidos se ignoran, nunca devuelven 500.
- Helpdesk es nuevo; no hay clientes previos que romper.
