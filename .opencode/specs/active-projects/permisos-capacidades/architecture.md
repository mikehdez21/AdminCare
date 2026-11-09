# Arquitectura — Permisos por capacidad

## 1. Componentes

```text
config/permisos.php
app/Support/Permisos.php
database/seeders/table_PermissionsSeeder.php
database/seeders/table_RolesSeeder.php
database/seeders/DemoSeeder.php
app/Http/Controllers/AdminControllers/RolesController.php
frontend/src/js/utils/permissions.ts
frontend/src/js/components/99_Administrador/Roles/*
frontend/src/js/store/api/rolesApi.ts
```

No se modifica:

```text
routes/api.php
bootstrap/app.php
AuthController.php
Sidebar/*
```

## 2. Catálogo

`config/permisos.php` es la fuente única:

- Dominios con etiqueta.
- Acciones con etiqueta/descripción.
- Recursos con acciones válidas.
- Sin recursos de Helpdesk en esta fase.

`App\Support\Permisos`:

- `mapa()`: expande recursos × acciones.
- `tiene(User, recurso, acción)`: respeta la cadena.
- `middleware(recurso, acción)`: devuelve la cadena de nombres para Spatie.
- `recursos()`: metadatos para la UI.

## 3. Estrategia aditiva

### Antes

- Rutas: `permission:sidebar_submenu_...`
- Menús: `hasActionPermission(..., 'sidebar_...', 'lectura')`
- Seeders: permisos legacy + `module.lectura/escritura/control`.

### Después de Spec 1

- Rutas: igual.
- Menús: igual.
- Base: permisos legacy + permisos nuevos.
- UI de roles: catálogo nuevo.
- Roles: legacy + nuevos.

### Después de Spec 2

- Rutas: `Permisos::middleware('almacen', 'lectura')`, etc.
- Menús: capacidades nuevas.
- Seeders: solo permisos nuevos.
- Legacy: retirado del seed.

## 4. Guardado de roles

El controlador de roles del main sincroniza permisos seleccionados. En este fork, mientras existan rutas legacy, el guardado debe:

1. Leer los permisos legacy actuales del rol.
2. Leer los permisos nuevos seleccionados en la UI.
3. Sincronizar la unión.
4. No borrar legacy por accidente.

Implementación sugerida:

```php
$legacy = $rol->permissions()
    ->where(function ($q) {
        $q->where('name', 'like', 'sidebar_%')
          ->orWhere('name', 'like', 'almacengeneral_navbar_%')
          ->orWhere('name', 'like', '%.control');
    })
    ->pluck('name');

$nuevos = collect($request->permissions);

$rol->syncPermissions($legacy->merge($nuevos)->unique());
```

La lista exacta de prefijos legacy se centraliza en un método privado para retirarlo fácilmente en Spec 2.

## 5. UI de roles

Se porta del main:

- Agrupación por dominio.
- Tabla de permisos con etiqueta/descripción.
- Acciones por recurso.
- Modal de información.
- Búsqueda/filtros si el main los tiene.

Se adapta:

- No mostrar alcances (Spec 4).
- No eliminar legacy.
- Aviso: "Los permisos anteriores siguen activos hasta la fase de rutas y middleware."

## 6. Riesgos

1. **Guardado destructivo:** si el controlador sincroniza solo los nuevos, las rutas legacy dejan de funcionar. Mitigación: unión con legacy.
2. **Catálogo incompleto:** un recurso sin acción deja rutas sin permiso en Spec 2. Mitigación: tests de mapa y revisión contra `routes/api.php`.
3. **Roles demo:** si `DemoSeeder` no asigna nuevos permisos al rol Almacén, Spec 2 romperá ese usuario. Mitigación: asignar legacy + nuevos en esta fase.
4. **UI confusa:** mostrar permisos que aún no protegen rutas. Mitigación: aviso visible en la pantalla de Roles.
