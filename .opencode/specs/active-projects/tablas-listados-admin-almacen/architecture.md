# Arquitectura — Tablas y listados

## 1. Backend

```text
app/Http/Controllers/Concerns/Paginable.php
app/Http/Controllers/AdminControllers/DepartamentosController.php
app/Http/Controllers/AdminControllers/EmpleadoController.php
app/Http/Controllers/AdminControllers/RolesController.php
app/Http/Controllers/AdminControllers/UbicacionController.php
app/Http/Controllers/AdminControllers/UserController.php
app/Http/Controllers/AlmacenGeneral/ActivosFijosController.php
app/Http/Controllers/AlmacenGeneral/FacturaController.php
app/Http/Controllers/AlmacenGeneral/MovimientosActivosFijosController.php
app/Http/Controllers/AlmacenGeneral/ProveedorController.php
```

Contrato de `paginar()`:

- `page`: entero >= 1.
- `per_page`: 1..100; sin él, lista completa.
- `search`: búsqueda global.
- `sort`: clave de whitelist.
- `direction`: `asc`/`desc`.
- `filtros[clave]`: whitelist.

Cada controlador declara:

```php
[
    'orden' => [...],
    'orden_default' => [...],
    'filtros' => [...],
    'joins' => [...],
]
```

## 2. Frontend

```text
components/00_Utils/TablaEntidades.tsx
hooks/useOrdenFiltroCliente.ts
hooks/usePaginacionRtk.ts
hooks/usePaginacionServidor.ts
utils/tabla.ts
@types/tablaTypes.ts
@types/paginacionTypes.ts
css/00_Utils/TablaEntidades.css
```

Controles:

```text
99_Administrador/Departamentos/DepartamentoControl.tsx
99_Administrador/Empleados/EmpleadosControl.tsx
99_Administrador/Roles/RolesControl.tsx
99_Administrador/Ubicaciones/UbicacionControl.tsx
99_Administrador/Usuarios/UsuariosControl.tsx
02_Almacenes/AlmacenGeneral/ActivosFijos/CRUD/subcomponents/TablaActivosFijos.tsx
02_Almacenes/AlmacenGeneral/Facturas/FacturasControl.tsx
02_Almacenes/AlmacenGeneral/MovimientosAF/MovimientoIndividual.tsx
02_Almacenes/AlmacenGeneral/Proveedores/ProveedorControl.tsx
```

## 3. Estrategia de port

- Comparar main vs fork archivo por archivo.
- Aplicar solo los cambios de orden/filtros/paginación.
- Conservar:
  - Cuota demo.
  - Ajustes SQLite.
  - Guards de sesión.
  - Estilos y componentes demo.
- No reemplazar archivos completos si el fork tiene cambios ajenos.

## 4. Riesgos

1. **Perder cambios demo:** los controladores del fork tienen cuota y ajustes SQLite. Mitigación: diff quirúrgico.
2. **Hooks incompatibles:** portar `TablaEntidades` sin actualizar hooks deja filtros sin efecto. Mitigación: portar el conjunto completo.
3. **Controladores con dependencias del main no portadas:** revisar imports antes de copiar.
4. **Regresión de listados:** sin `per_page`, el backend debe seguir devolviendo la lista completa.
