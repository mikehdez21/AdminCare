# Arquitectura — Renombrar BD demo a `admincare-demo.db`

## Contexto
- La demo usa SQLite. El nombre del archivo se define en varios puntos y deben
  quedar alineados: entorno local (`.env`) y Render (`render.yaml`), el
  constructor de archivo (`ensure-sqlite.php`, `Dockerfile`,
  `render-demo-reset.sh`) y el fallback de Laravel (`config/database.php`).
- `AppServiceProvider.php:31` lee `config('database.connections.sqlite.database')`,
  por lo que heredará el nuevo nombre automáticamente (sin cambios allí).

## Diseño
- Un único nombre canónico: **`database/admincare-demo.db`** (ruta relativa,
  manejada igual que antes en todos los puntos).
- Renombrar el archivo local existente conservando datos (mover/renombrar, no
  recrear).
- Dockerfile y scripts de Render siguen creando el archivo (o usando
  `migrate:fresh --seed`) pero con el nuevo nombre.
- `.gitignore` de raíz y de `database/` se amplían para cubrir `*.db`.

## Impacto
- No afecta la lógica de migraciones, seeders, firewall de `render-demo-reset.sh`
  (solo el literal de la ruta) ni la API.
- El guard de `render-demo-reset.sh` compara `DB_DATABASE` con el literal; debe
  actualizarse junto con `render.yaml` para que siga protegiendo el reset.