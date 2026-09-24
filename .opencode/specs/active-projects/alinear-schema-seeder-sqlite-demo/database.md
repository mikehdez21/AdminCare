# Database — Cambios de esquema (solo SQLite demo)

> Referencia: `.agents/docs/architecture/database.md`. Estas migraciones viven en
> `database/migrations/SQLITE/` y se recrean por completo en cada deploy de Render
> (`migrate:fresh --seed --path=database/migrations/SQLITE`).

## 1. `006_BD_principal_Empleados_table.php`
Cambios dentro de `Schema::create('tableEmpleados', ...)`:

| Columna | Antes | Después | Notas |
|---|---|---|---|
| `email_empleado` | `string(255)->unique()` (NOT NULL) | `string(255)->unique()->nullable()` | Mantener unicidad; NULL permitido porque la API/UI no lo envían |
| `firma_movimientos` | `string(255)` (NOT NULL) | `string(255)->nullable()` | NULL permitido; los seeders siguen persistiendo un hash de demo |

Funciones PHP para consultar SQLite (sin php.exe, uso previo con Python):
```sql
SELECT name, type, "notnull" FROM pragma_table_info('tableEmpleados') WHERE name IN ('email_empleado','firma_movimientos');
```

## 2. `012_SQLite_demo_schema.php`
Cambios dentro de `Schema::create('tableAF_DepreciacionActivo', ...)`:

| Columna | Antes | Después | Notas |
|---|---|---|---|
| clave primaria | `bigIncrements('id_depreciacion')` | `bigIncrements('id_depreciacionaf')` | Coincidir con `Depreciacion::$primaryKey`, controller y frontend types |

Resto de columnas de `tableAF_DepreciacionActivo` (FKs, valores, timestamps) permanecen igual.

Verificación SQLite:
```sql
SELECT name, type, pk FROM pragma_table_info('tableAF_DepreciacionActivo') WHERE pk = 1;
```
Debe devolver `id_depreciacionaf` después de recrear la BD demo.

## 2b. `012_SQLite_demo_schema.php` — Alineación adicional con 041 (observaciones del reviewer)
Dentro de `Schema::create('tableAF_DepreciacionActivo', ...)`:

| Columna | Antes (SQLite 012) | Después | Igual que 041 (Postgres) |
|---|---|---|---|
| `id_estatus_depreciacion` | `unsignedBigInteger->nullable()` | `unsignedBigInteger` (NOT NULL) | sí (041:58 `notNull`) |
| `fecha_calculo_depreciacion` | `date->nullable()` | `date` (NOT NULL) | sí (041:52 `notNull`) |

Además, agregar el índice único que 041 ya declara (041:61):
```php
$table->unique(['id_activo_fijo', 'anio_depreciacionaf'], 'uk_activo_anio_deprec');
```

Verificación de cobertura antes de aplicar NOT NULL (ya analizada):
- `DepreciacionController@activarDepreciacion` (línea 102) y `@calcularDepreciacion` (línea 191)
  siempre envían `id_estatus_depreciacion` (fallback `?? 1`) y `fecha_calculo_depreciacion` (`now()`).
- `DemoSeeder` inserta ambos campos en su fila de `tableAF_DepreciacionActivo`.
- No hay otro creador de registros de depreciación en el repo.

## 3. Sin cambios en otras tablas
- `tableRef_*` (catálogos), `tableAF_*`, `tableUbicaciones`, `tableDepartamentos`,
  `tableUsuarios` y `tableInter_*`: sin cambios.
- Migraciones canónicas Postgres (`database/migrations/`, `database/migrations/almacengeneral/`):
  sin cambios.

## 4. Recreación de la BD local de demo
Para validar: ejecutar `migrate:fresh --seed --force --path=database/migrations/SQLITE` sobre
`database/admincare-demo.db` (requiere autorización explícita del usuario, dado que los agentes
no ejecutan `php.exe` por política del repositorio).