# Requisitos

- El código QR canónico de un activo debe ser `QR` seguido de `codigo_etiqueta`.
- Las nuevas URLs deben apuntar a `/activosfijos/qraf/{codigoQR}` usando el dominio público del frontend configurado en `FRONTEND_URL`.
- El resolver público debe continuar aceptando códigos históricos como `AF1`, además de URLs completas y códigos con prefijo `QR`.
- Deben conservarse las rutas y aliases legacy existentes.
- No se modifican migraciones ni se inicia ningún servidor local.
- Si faltan `codigo_etiqueta` y `codigo_unico`, SINFACTURA usa `AF{id_activo_fijo}-SINFACTURA`.
- La restricción única existente por activo y una transacción con `lockForUpdate` minimizan duplicados concurrentes; SQLite puede serializar o rechazar escrituras concurrentes por sus bloqueos, limitación que se maneja reconsultando el registro ganador.
