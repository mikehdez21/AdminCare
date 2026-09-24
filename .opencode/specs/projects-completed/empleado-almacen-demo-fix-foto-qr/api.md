# API — Sin cambios de endpoints

- No se agregan/modifican rutas.
- `EmpleadoController@index` y `@update` mantienen su forma de respuesta
  (`{ success, data, message, ... }`) y solo cambia la URL del fallback de foto.
- `GET /api/activosfijos/qraf/{codigo}` (QR público) no se modifica.
- Contrato de permisos: sin cambios en endpoints; el rol nuevo usa permisos existentes.