# Requisitos

## 1. Objetivo funcional

El fork demo debe quedar alineado con el main en estructura de base de datos, módulo Helpdesk, permisos y mejoras de listados, sin perder las restricciones propias de la demo SQLite.

## 2. Alcance incluido

### 2.1 Helpdesk

- Tablas y migraciones equivalentes a las del main.
- Modelos Eloquent de Helpdesk.
- Controladores, servicios y reglas de negocio del main.
- Rutas API completas de Helpdesk.
- Notificaciones y observer de tickets.
- Catálogos: categorías, subcategorías, títulos, prioridades, estatus, SLA, etiquetas, proveedores de error, sistemas de proveedor y módulos SIHO.
- Pantallas React: nuevo ticket, mis tickets, mesas de ayuda, detalle, dashboard y configuración.
- Store Redux, tipos TypeScript y estilos del módulo.
- Datos demo: catálogos completos y ~12 tickets con distintos estatus, prioridades, avances, cierre, encuesta y error de proveedor.

### 2.2 Permisos

- Catálogo `config/permisos.php` adaptado a los módulos del fork.
- `App\Support\Permisos` y `App\Services\Permisos\AlcanceService`.
- Nombres de permiso `recurso.accion` (`lectura`, `escritura`, `eliminar`).
- Alcances `propio`, `departamento`, `global` para Helpdesk.
- Middleware de rutas por capacidad, no por nombre de menú.
- Payload de autenticación con `permissions` y `alcances`.
- Seeders de permisos, roles y alcances.
- UI de roles con catálogo, descripción y alcance.
- Menús y rutas del frontend gobernados por capacidades.

### 2.3 Columnas de atención Helpdesk

- `tableDepartamentos.atiende_helpdesk`.
- `tableUsuarios.atiende_helpdesk`.
- UI de Administración para marcar ambos campos.
- `tableUsuarios.ultimo_acceso`.

### 2.4 Mejoras de tablas y listados

Solo Administrador y Almacén:

- Orden por columna.
- Filtros por columna.
- Paginación de servidor.
- Búsqueda global.
- Componente compartido de tabla.
- Controles actualizados:
  - Administrador: Departamentos, Empleados, Roles, Ubicaciones, Usuarios.
  - Almacén: Activos Fijos, Facturas, Movimientos individuales, Proveedores.

### 2.5 Correos demo

- El código de notificaciones del main se conserva.
- En demo no se envía correo real.
- La UI de Helpdesk muestra un aviso claro de que no hay configuración ni servicio de correo.
- El aviso no debe impedir crear tickets, cambiar estatus ni cerrar tickets.

## 3. Fuera de alcance

- Módulo ResumenHome/Home del main.
- Carga de PDF de Extensiones.
- Suite completa de tests del main.
- Guard de expiración de sesión por inactividad del main.
- Envío real de correos SMTP/Microsoft 365.
- Cambios en producción, Render o bases de datos reales.
- Reintroducir el prefijo `/api/HSS1`.
- Cambios en la cuota demo para incluir Helpdesk.
- Reescritura general del módulo Almacén fuera de los listados.

## 4. Requisitos no funcionales

- **Compatibilidad SQLite:** todas las migraciones y consultas deben ejecutar en SQLite sin sintaxis exclusiva de PostgreSQL.
- **Compatibilidad PostgreSQL:** el esquema debe seguir funcionando con el driver `pgsql` mediante nombres condicionales de esquema.
- **Sin secretos:** no introducir credenciales ni correos reales.
- **Datos sintéticos:** todos los datos demo deben ser claramente ficticios.
- **Idempotencia razonable:** seeders con `firstOrCreate`/`updateOrCreate` cuando sea posible.
- **Linux/Render:** imports sensibles a mayúsculas; no depender de rutas locales de Windows.
- **Envelope API:** conservar `{ success, message, data }` y códigos HTTP existentes.
- **Permisos:** una ruta nueva debe quedar protegida por defecto; no debe depender solo del ocultamiento visual.
- **Demo:** ningún error de correo debe romper el flujo de tickets.

## 5. Historias de usuario

### HU-01 — Ver Helpdesk en la demo

Como usuario demo con permisos de Helpdesk, quiero ver el menú y las pantallas de Helpdesk para mostrar el módulo en el portafolio.

**Criterios:**
- El menú aparece solo si el usuario tiene al menos una capacidad de Helpdesk.
- Las rutas `/helpdesk/*` cargan sin errores.
- El usuario sin permisos no ve el menú y recibe 403 en la API.

### HU-02 — Crear y atender tickets

Como solicitante demo, quiero crear un ticket y consultar su detalle; como técnico demo, quiero ver la mesa, asignar responsables y cambiar estatus.

**Criterios:**
- El formulario carga categorías, subcategorías, títulos, prioridades, ubicaciones y empleados.
- El ticket se crea con folio único.
- El técnico ve tickets según su alcance.
- El cambio de estatus respeta las transiciones del main.
- El cierre permite encuesta de satisfacción.

### HU-03 — Correo no configurado

Como visitante de la demo, quiero saber que los correos de Helpdesk no se envían.

**Criterios:**
- La pantalla de Helpdesk muestra un aviso visible.
- Crear un ticket no genera error de correo.
- No se abre conexión SMTP.
- El aviso distingue claramente la limitación de la demo.

### HU-04 — Permisos por capacidad

Como administrador demo, quiero asignar permisos por recurso y acción, y alcance por rol.

**Criterios:**
- La pantalla de Roles muestra el catálogo del main.
- Un rol con `helpdesk.tickets.lectura` puede listar la mesa.
- Un rol con `helpdesk.mis_tickets.escritura` puede abrir/reabrir sus tickets.
- El alcance `global` solo existe por asignación explícita.
- Los permisos antiguos de sidebar ya no gobiernan las rutas.

### HU-05 — Listados mejorados

Como usuario de Administración o Almacén, quiero ordenar, filtrar y paginar las tablas.

**Criterios:**
- El encabezado permite ordenar por columnas permitidas.
- Cada columna tiene filtro cuando aplique.
- La paginación es de servidor y conserva búsqueda/orden/filtros.
- Sin `per_page`, la respuesta sigue siendo retrocompatible.

### HU-06 — Datos demo ricos

Como visitante, quiero ver tickets de ejemplo con variedad.

**Criterios:**
- Hay ~12 tickets.
- Hay estatus abiertos, en proceso, resueltos y cerrados.
- Hay prioridades variadas.
- Hay avances visibles e internos.
- Hay al menos un ticket reabierto, uno con encuesta y uno con error de proveedor.

## 6. Dependencias

- `spatie/laravel-permission` ya instalado.
- `chart.js`, `react-chartjs-2`, `react-icons`, `react-modal`, `sweetalert2` ya instalados en el fork.
- `endroid/qr-code` se conserva.
- No se requiere `datascaled/laravel-m365-mailer` para la demo.

## 7. Riesgos de requisitos

- El main usa PostgreSQL en Helpdesk (esquema `helpdesk`, `pg_advisory_xact_lock`, `TO_CHAR`). La adaptación a SQLite es requisito bloqueante.
- El sistema de permisos del main cambia nombres y rutas; cualquier resto de permisos antiguos en el frontend deja opciones invisibles o rutas 403.
- La UI de roles del fork es anterior; si no se porta completa, el catálogo nuevo no se podrá administrar.
