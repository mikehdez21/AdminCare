# Frontend — Rutas y middleware

## Alcance

Cambiar la navegación para que use las capacidades nuevas. No se agregan pantallas.

## Archivos

```text
frontend/src/js/components/Home/Sidebar/Sidebar_OptionsList.tsx
frontend/src/js/components/Home/Sidebar/SubMenuOptions_Almacen.tsx
frontend/src/js/components/Home/Sidebar/SubMenuOptions_Contabilidad.tsx
frontend/src/js/components/Home/Sidebar/SubMenuOptions_Administrador.tsx
frontend/src/js/components/Home/Sidebar/SideBar.tsx (solo si aplica)
```

## Reglas

- Admin Dashboard: `nav.dashboard.lectura`.
- Almacén: `almacen.lectura`.
- Contabilidad:
  - Depreciación: `contabilidad.depreciacion.lectura`.
  - Configuración/Métodos: `contabilidad.metodos.lectura`.
  - Auditoría: `contabilidad.auditoria.lectura`.
- Administrador:
  - Usuarios: `admin.usuarios.lectura`.
  - Empleados: `admin.empleados.lectura`.
  - Roles: `admin.roles.lectura`.
  - Departamentos: `admin.departamentos.lectura`.
  - Ubicaciones: `admin.ubicaciones.lectura`.
- No usar `sidebar_*`, `almacengeneral_navbar_*` ni `.control`.
- No agregar menú Helpdesk.
- No cambiar rutas de React Router.
- No cambiar `ProtectedRoutes` (solo auth).

## Aviso de fase

Opcional: retirar el aviso de "permisos legacy activos" de la pantalla de Roles, porque en esta fase ya se retiran.

## Validación

```sh
pnpm exec tsc --noEmit
pnpm run lint
pnpm run build
```

Manual:

- Admin ve todos los módulos.
- Almacén ve Almacén, Contabilidad y Administración según permisos.
- Un usuario sin `almacen.lectura` no ve Almacén.
- Las rutas siguen respondiendo.
