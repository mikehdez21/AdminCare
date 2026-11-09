# Flujo de entrega por fases

## Decisiones del usuario

- Los cambios se hacen en fases.
- Cada fase tiene **commit + push propios**.
- Push directo a `main`.
- Cada push dispara build/deploy de Render.
- El usuario revisa manualmente la aplicación después de cada build.
- **No se avanza a la siguiente fase hasta que el usuario confirme que la revisó.**
- Mensajes de commit en formato Conventional Commits, en español o inglés consistente.
- No se hace un solo commit/push gigante.

## Regla de oro

Cada fase debe dejar la aplicación **desplegable y usable**. Si una fase no puede quedar usable sola, se agrupa con la fase mínima que la complete.

## Secuencia

| Fase | Commit | Push | Build Render | Revisión usuario | Siguiente |
|---|---|---|---|---|---|
| 0 | Spec en repo | Sí | Sí | Opcional | Espera OK |
| 1 | Esquema Helpdesk | Sí | Sí | Sí | Espera OK |
| 2 | Permisos backend + frontend base | Sí | Sí | Sí | Espera OK |
| 3 | Backend Helpdesk | Sí | Sí | Sí | Espera OK |
| 4 | Frontend Helpdesk | Sí | Sí | Sí | Espera OK |
| 5 | Tablas Admin/Almacén | Sí | Sí | Sí | Espera OK |
| 6 | Datos demo | Sí | Sí | Sí | Espera OK |
| 7 | Docs/verificación | Sí | Sí | Sí | Cierre |

## Fase 0 — Spec en el repo

Al cambiar a un agente de implementación:

1. Copiar la carpeta:

```text
C:\Users\HSS-DESARROLLO\.opencode\plan\helpdesk-permisos-tablas-demo
```

a:

```text
C:\Users\HSS-DESARROLLO\DevProjects\Personal\AdminCare\.opencode\specs\active-projects\helpdesk-permisos-tablas-demo
```

2. Verificar que no exista una carpeta con el mismo nombre.
3. Commit:

```text
docs(specs): add helpdesk demo parity plan
```

4. Push a `main`.
5. Esperar build de Render.
6. No tocar código todavía.

## Commits por fase

| Fase | Mensaje sugerido |
|---|---|
| 0 | `docs(specs): add helpdesk demo parity plan` |
| 1 | `feat(db): add helpdesk schema and attendance flags` |
| 2 | `feat(auth): adopt capability permissions and scopes` |
| 3 | `feat(helpdesk): add helpdesk backend` |
| 4 | `feat(helpdesk): add helpdesk interface` |
| 5 | `feat(tables): add sorting filtering and server pagination` |
| 6 | `feat(demo): seed helpdesk sample data` |
| 7 | `docs(demo): document helpdesk limitations and verification` |

## Qué verifica el usuario en cada fase

### Fase 1 — Esquema

- La app sigue cargando.
- Login funciona.
- Almacén y Administración siguen funcionando.
- No hay errores 500 en el arranque.
- La demo regenera datos sin fallar.

### Fase 2 — Permisos

- Login de `DEMOADMIN`, `DEMOALMACEN`.
- Menú de Almacén, Contabilidad y Administración visible según rol.
- Pantalla de Roles muestra permisos nuevos.
- Ninguna opción desaparece por error.
- Las rutas protegidas siguen respondiendo.

### Fase 3 — Backend Helpdesk

- La app sigue cargando.
- No hay errores de rutas nuevas.
- No hay correos ni errores SMTP.
- La demo no se rompe por migraciones nuevas.

### Fase 4 — Frontend Helpdesk

- Menú Helpdesk visible para Admin.
- Nuevo Ticket, Mis Tickets, Mesas, Dashboard y Configuración cargan.
- Aviso de correo visible.
- Crear ticket y ver detalle funciona.

### Fase 5 — Tablas

- Orden, filtros y paginación en Administrador y Almacén.
- Acciones de crear/editar/eliminar siguen funcionando.
- Cuota demo de Almacén sigue activa.

### Fase 6 — Datos demo

- 12 tickets visibles.
- Catálogos completos.
- Usuarios `DEMOTEC` y `DEMOSOL` funcionan.
- Dashboard con métricas.
- Encuesta y error de proveedor visibles.

### Fase 7 — Cierre

- Documentación actualizada.
- Checklist de aceptación completo.
- Spec movida a `projects-completed` solo con confirmación del usuario.

## Si el build falla

1. No avanzar de fase.
2. Revisar logs de Render.
3. Corregir en la misma fase.
4. Nuevo commit + push.
5. Esperar nuevo build.
6. Pedir revisión de nuevo.

No se hace `git reset --hard`, `force push` ni se borran commits sin autorización del usuario.

## Si la revisión del usuario encuentra un problema

1. Corregir en la misma fase.
2. Commit + push.
3. Esperar build.
4. Pedir nueva revisión.

No se abre la siguiente fase con un problema abierto de la anterior.

## Reset de datos en cada deploy

Render ejecuta `migrate:fresh --seed` en cada release/start. Cada push de fase **borra los datos creados durante la revisión anterior**. Es esperado en la demo.

Si el usuario crea tickets o cambios manuales durante la revisión, se perderán en el siguiente push. No tratar la demo como almacenamiento.

## Restricciones

- No hacer commit/push sin que la fase esté verificada estáticamente.
- No ejecutar `php.exe`, servidores locales ni `migrate:fresh` por parte de agentes.
- El usuario ejecuta migraciones locales si quiere validar antes del push.
- No tocar producción.
- No introducir secretos.
- No avanzar sin OK explícito del usuario.

## Criterio de avance

Después de cada push:

```text
build OK -> usuario revisa app -> usuario responde "OK fase N" -> inicio fase N+1
```

Si el usuario no responde, el agente se detiene.
