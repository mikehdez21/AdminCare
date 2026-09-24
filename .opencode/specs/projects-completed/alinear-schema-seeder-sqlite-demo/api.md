# API — Contrato preservado

No se modifican endpoints, ni su request/response, ni permisos RBAC.

## Empleados
- `POST /api/empleados` (`EmpleadoController@store`)
- `PUT /api/empleados/{id}` (`EmpleadoController@update`)
- Response envelope: `{ success, message, ...data }`.

Tras el cambio, `store`/`update` pueden seguir creando/actualizando empleados sin enviar
`email_empleado` ni `firma_movimientos` (las columnas SQLite permiten NULL). `$fillable`
adicional permite persistir esos campos cuando un consumidor (o el seeder) sí los envíe.

## Depreciación
- `POST /api/depreciaciones/activar/{idActivo}` (`DepreciacionController@activarDepreciacion`)
- `POST /api/depreciaciones/calcular/{idActivo}` (`DepreciacionController@calcularDepreciacion`)
- `GET  /api/depreciaciones/historico/{idActivo}` (`DepreciacionController@historicoDepreciaciones`)
- `GET  /api/depreciaciones/activos-sin-depreciar` / `activos-en-depreciacion`

Tras la alineación de PK en SQLite, las respuestas exponen `id_depreciacionaf` (igual que el
frontend espera en `depreciacionTypes.ts` y `ListActivosDepreciacion.tsx`). No cambia la forma
del payload.

## Envelope
Toda respuesta conserva `{ success: boolean, message: string, ...data }`.