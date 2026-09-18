
# AdminCare — instrucciones para agentes

## Resumen del proyecto

AdminCare es una aplicación Laravel 11 con frontend React 18/TypeScript y
Vite. La versión actual es una demo basada en SQLite con datos sintéticos.
Incluye administración de usuarios, almacén general, activos fijos, facturas,
movimientos y generación/consulta de códigos QR.

La aplicación se despliega como un servicio Docker en Render. `render.yaml`,
`Dockerfile`, `scripts/render-release.sh` y `scripts/render-start.sh` forman el
flujo de despliegue principal.

## Estructura importante

- `app/`: lógica Laravel, modelos, controladores, servicios y middleware.
- `routes/`: rutas web y API.
- `database/`: migraciones, seeders y SQLite de la demo.
- `config/`: configuración de Laravel, Sanctum, CORS y sesiones.
- `frontend/src/js/`: aplicación React, Redux, rutas y componentes.
- `frontend/src/css/`: estilos del frontend.
- `public/`: archivos públicos y build integrado de Vite.
- `scripts/`: preparación, release y arranque de Render.
- `.opencode/agents/`: agentes especializados del proyecto.
- `.opencode/specs/active-projects/`: especificaciones de trabajos en curso.

## Coordinación de agentes

El agente Orchestrator coordina el trabajo y no debe implementar directamente.

- Exploración del repositorio: el agente integrado `explore`.
- Backend Laravel, API, base de datos y permisos: `backend-agent`.
- React, TypeScript, Redux, CSS y Vite: `frontend-agent`.
- Revisión de cambios: `reviewer-agent`.
- Migraciones o diseño de base de datos: `database-agent` cuando corresponda.

Todo trabajo no trivial debe tener una especificación en:

```text
.opencode/specs/active-projects/<nombre-de-la-tarea>/
```

La especificación debe incluir, según las capas afectadas, `requirements.md`,
`architecture.md`, `database.md`, `api.md`, `frontend.md`, `tasks.md` y
`acceptance.md`. Solo después de que el usuario confirme explícitamente que el
trabajo está completo se debe mover cada carpeta completa a
`.opencode/specs/projects-completed/`; ninguna carpeta validada debe permanecer
en `active-projects`.

## Reglas de trabajo

1. Leer primero los archivos relacionados y seguir los patrones existentes.
2. Mantener los cambios limitados a la tarea solicitada.
3. No borrar componentes solo por su nombre; comprobar imports, rutas y usos.
4. No modificar autenticación, CSRF, sesiones, permisos o rutas sin verificar
   sus consumidores frontend y backend.
5. No introducir secretos, credenciales ni datos reales en el repositorio.
6. No crear commits, hacer push ni cambiar la configuración de Git salvo que
   el usuario lo solicite expresamente.
7. Después de cambios de código, solicitar o ejecutar revisión estática antes
   de declarar la tarea terminada.

## Política de servidores

Los agentes no deben iniciar, reiniciar ni detener servidores locales. Tampoco
deben ejecutar manualmente:

- `php.exe`
- `php artisan serve`
- `npm run dev`
- `pnpm dev`
- comandos equivalentes que mantengan un servidor activo.

El desarrollador administra los servidores locales en sus terminales. Se
permiten verificaciones estáticas como TypeScript, lint, build, tests y
revisión de rutas que no inicien un servidor. La prohibición de `php.exe`
incluye su ejecución directa por los agentes; si una validación PHP requiere
ese binario, debe reportarse como no ejecutada.

La prohibición anterior no aplica al arranque normal del contenedor en Render:
`scripts/render-start.sh` puede ejecutar Laravel como parte del despliegue.

## Backend

- PHP requerido: 8.4.
- Framework: Laravel 11.
- Autenticación: Laravel Sanctum y sesiones.
- Autorización: Spatie Permission y permisos de lectura/acciones.
- Base de datos de demo: SQLite.
- Las respuestas de API deben conservar el envelope existente:
  `{ success, message, ...data }`.
- Las migraciones deben ser seguras e idempotentes cuando sea razonable.
- Los cambios de permisos deben reflejarse en seeders y, si afectan bases ya
  existentes, en una migración segura.
- No ejecutar `migrate:fresh` sobre una base que pueda contener datos útiles.

## Frontend

- El código vive en `frontend/`.
- Gestor de paquetes: pnpm.
- Comandos habituales desde `frontend/`:

```sh
pnpm install
pnpm run lint
pnpm exec tsc --noEmit
pnpm run build
```

- El acceso autenticado inicia en `/app`.
- `/app` muestra el shell con Sidebar y un MainContent vacío hasta seleccionar
  un módulo.
- Admin Dashboard usa la ruta `/admin` y el permiso
  `sidebar_menu_admindashboard`.
- Deben conservarse los aliases de rutas legacy cuando sean necesarios para
  enlaces existentes o compatibilidad con QR.
- Tener en cuenta que Render ejecuta sobre Linux; los imports de archivos son
  sensibles a mayúsculas y minúsculas.

## Render y despliegue

El despliegue principal usa:

```text
render.yaml
Dockerfile
scripts/render-release.sh
scripts/render-start.sh
```

El Dockerfile compila el frontend y empaqueta Laravel en la misma imagen. No
añadir configuraciones de Vercel o Railway como parte del despliegue actual sin
una solicitud explícita.

La demo usa SQLite y sesiones en archivos. El filesystem estándar de Render es
efímero, por lo que los datos y sesiones pueden perderse después de un
reinicio. No tratar la demo como almacenamiento productivo.

## Verificación mínima

Antes de entregar cambios:

```sh
git diff --check
```

Para cambios frontend, ejecutar lint, TypeScript y build cuando sea posible.
Para cambios backend, ejecutar validación de sintaxis, tests o inspecciones de
rutas que no requieran iniciar un servidor.

Reportar siempre:

- archivos modificados;
- verificaciones ejecutadas;
- verificaciones no ejecutadas y por qué;
- riesgos o bloqueos pendientes.
