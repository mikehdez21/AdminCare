# Arquitectura — Rutas y middleware

## 1. Backend

`routes/api.php` se reorganiza por módulo y acción.

Patrón:

```php
$lectura = Permisos::middleware('admin.usuarios', 'lectura');
$escritura = Permisos::middleware('admin.usuarios', 'escritura');
$eliminar = Permisos::middleware('admin.usuarios', 'eliminar');

Route::middleware(PermissionMiddleware::class.':'.$lectura)->group(function () {
    Route::get('admin/usuarios', [UserController::class, 'index']);
});

Route::middleware(PermissionMiddleware::class.':'.$escritura)->group(function () {
    Route::post('admin/usuarios', [UserController::class, 'store']);
    Route::put('admin/usuarios/{id}', [UserController::class, 'update']);
});

Route::middleware(PermissionMiddleware::class.':'.$eliminar)->group(function () {
    Route::delete('admin/usuarios/{id}', [UserController::class, 'destroy']);
});
```

Reglas:

- No dejar rutas nuevas dentro de un grupo legacy.
- No usar `permission:sidebar_*`.
- Mantener el grupo `auth:sanctum`.
- Mantener el prefijo `/api`.
- Conservar los endpoints públicos de QR/status.

## 2. Catálogos compartidos

Para endpoints que sirven a selects:

```php
$catalogos = 'catalogos.departamentos.lectura|admin.departamentos.lectura';
```

El pipe funciona como OR en Spatie.

## 3. Frontend

### Sidebar

- `Sidebar_OptionsList.tsx`:
  - Admin Dashboard: `nav.dashboard.lectura`.
  - Almacén: `almacen.lectura`.
  - Contabilidad: `tieneCapacidadEn(permissions, 'contabilidad')`.
  - Administrador: `tieneCapacidadEn(permissions, 'admin')`.
- `SubMenuOptions_Almacen.tsx`: `almacen.lectura`.
- `SubMenuOptions_Contabilidad.tsx`: capacidades por recurso.
- `SubMenuOptions_Administrador.tsx`: capacidades por recurso.

### Sin Helpdesk

No se agrega `SubMenuOptions_Helpdesk` en esta fase.

## 4. Retiro legacy

En esta fase:

1. Se actualizan rutas y menús.
2. Se elimina el seeder legacy.
3. Se elimina la unión legacy del guardado de roles.
4. La base demo se regenera.

No se necesita comando de migración de permisos porque la demo usa `migrate:fresh --seed`.

## 5. Riesgos

1. **Ruta sin grupo:** una ruta existente queda pública o con permiso viejo. Mitigación: revisar todas las rutas contra el mapeo.
2. **Menú oculto:** capacidad mal escrita. Mitigación: grep y prueba manual con cada rol.
3. **Rol sin permiso nuevo:** el usuario pierde acceso. Mitigación: Spec 1 asigna nuevos permisos; verificar antes de retirar legacy.
4. **Confusión de dominio:** `admin.*` vs `catalogos.*`. Mitigación: OR explícito en endpoints de selects.
