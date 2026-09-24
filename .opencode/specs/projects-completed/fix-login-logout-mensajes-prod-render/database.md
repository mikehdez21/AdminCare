# Database — Sin cambios de esquema

Este proyecto no modifica migraciones, seeders ni esquema.
- No hay cambios de columnas/tablas.
- La base de datos SQLite de la demo no se altera.
- Solo se tocan: `AuthController@logout` (manejo de errores), posible ajuste de middleware
  en `bootstrap/app.php` (backend), y frontend (componentes/authReducer/axios timeout).