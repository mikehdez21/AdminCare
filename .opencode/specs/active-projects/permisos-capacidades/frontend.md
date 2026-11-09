# Frontend — Permisos por capacidad

## Alcance

- Portar utilidades de permisos del main.
- Portar UI de roles con el catálogo nuevo.
- No cambiar menús ni navegación.

## Archivos

```text
frontend/src/js/utils/permissions.ts
frontend/src/js/components/99_Administrador/Roles/AddRol.tsx
frontend/src/js/components/99_Administrador/Roles/EditRol.tsx
frontend/src/js/components/99_Administrador/Roles/RolesControl.tsx
frontend/src/js/components/99_Administrador/Roles/ShowPermisosRole.tsx
frontend/src/js/components/99_Administrador/Roles/TablaPermisosRol.tsx
frontend/src/js/components/99_Administrador/Roles/ModalInfoPermiso.tsx
frontend/src/js/store/api/rolesApi.ts
frontend/src/css/99_Administrador/Roles/*
```

## `utils/permissions.ts`

Portar del main:

- `hasActionPermission(permissions, recurso, accion)`.
- `tieneCapacidadEn(permissions, dominio)`.
- Cadena lectura → escritura → eliminar.

No cambiar todavía los componentes que usan `sidebar_*`. La sustitución se hace en Spec 2.

## UI de roles

- Mostrar permisos agrupados por dominio.
- Mostrar etiqueta y descripción.
- Mostrar acciones del recurso.
- Al guardar:
  - Enviar permisos nuevos.
  - El backend conserva legacy.
- Mostrar aviso:

```text
Los permisos anteriores siguen activos hasta la fase de rutas y middleware.
```

- No mostrar alcances.
- No mostrar permisos de Helpdesk.

## Tipos

- Reutilizar `mainTypes.ts`.
- Agregar tipos de permiso si el main los separa.
- No duplicar `Permission` si ya existe en el fork.

## Validación

```sh
pnpm exec tsc --noEmit
pnpm run lint
pnpm run build
```

Además:

- Abrir Roles con DEMOADMIN.
- Verificar que se muestra el catálogo nuevo.
- Guardar un rol sin perder acceso a Almacén/Administración.
- Verificar que los menús siguen iguales.
