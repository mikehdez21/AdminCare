# Requisitos: demo SQLite de AdminCare

## Estado y alcance

Este documento es el spec activo de una migración futura. En esta fase solo se documenta, decide y verifica el diseño; no se cambian PHP, React, migraciones, variables de producción ni archivos de Render.

El objetivo es publicar una demo pública de este monorepo en Render, usando SQLite en lugar de PostgreSQL, sin datos reales ni dependencias externas no aptas para una demo. Laravel permanece en la raíz y el frontend React/TypeScript/Vite permanece en `frontend`.

La exploración no encontró `.agents/docs/workflows/migration.md` ni documentación de arquitectura existente; este spec funciona como referencia inicial, no como sustituto de una decisión de implementación aprobada.

## Requisitos funcionales

- La aplicación debe arrancar con SQLite mediante `pdo_sqlite`; SQLite es una biblioteca/extensión PHP y un archivo local, no un servidor separado ni un servicio PostgreSQL.
- El esquema de demo debe poder crearse desde cero y poblarse con un dataset sintético, pequeño, fijo y determinista.
- El dataset inicial debe poder restablecerse con una operación documentada y segura. El restablecimiento borra el estado de la demo y vuelve a ejecutar migraciones/seeders aprobados.
- No se deben incluir nombres, correos, teléfonos, direcciones, números fiscales, archivos, imágenes ni credenciales de personas u organizaciones reales.
- La sesión debe caducar como máximo a los 30 minutos (`SESSION_LIFETIME=30` como intención de configuración). Debe existir cierre por inactividad y logout normal.
- Toda escritura de demo debe quedar limitada server-side a un máximo de 100 registros de negocio.
- Zebra/impresión física, uploads/archivos persistidos y SoftComputing/OpenAI deben quedar desactivados en la superficie pública de la demo.
- Las rutas que permanezcan visibles deben devolver una respuesta explícita de funcionalidad no disponible, preferentemente `404` o `501`, y nunca intentar conectar con hardware, almacenamiento de archivos o APIs externas.
- La navegación React debe funcionar servida por Laravel en el despliegue unificado propuesto, conservando la ejecución separada actual como opción de desarrollo hasta que una tarea de implementación la sustituya.

## Definición del límite de 100

Una **unidad de negocio** es una fila creada en una entidad operativa principal: `tableAF_Proveedores`, `tableAF_Facturas_Almacen` y `tableAF_ActivosFijos` (los nombres exactos deben confirmarse contra las migraciones). El total es la suma de esas tres tablas. Una factura que crea varios activos consume una unidad por la factura y una por cada activo. Las tablas de relación factura-activo, movimientos, QR, depreciación, responsivas, logs y catálogos no consumen una unidad adicional, pero no pueden usarse para eludir el límite de sus entidades propietarias.

La cuota es global para la base de datos de demo, no por usuario ni por endpoint. El backend debe:

1. Calcular el uso actual dentro de la misma transacción de escritura.
2. Validar el delta completo de la operación, incluidos activos creados por `FacturaController` según `cantidad`.
3. Rechazar con `422` y un código/mensaje estable cuando el resultado exceda 100.
4. Aplicar la validación a `POST`, duplicaciones/importaciones y cualquier servicio interno, no solo al formulario React.
5. Hacer que el check y la escritura sean atómicos; un fallo no debe dejar filas parciales.

## Fuera de alcance

- Migrar la instalación PostgreSQL existente o preservar su historial de producción.
- Garantizar durabilidad de datos públicos en el filesystem efímero de Render.
- Convertir la demo en un sistema multi-tenant o de alta concurrencia.
- Mantener integraciones de Zebra, QZ Tray, uploads, OpenAI, SoftComputing o servicios Python.
- Cambiar código durante esta fase de planificación.

## Restricciones y riesgos aceptados

SQLite permite el objetivo de demo, pero tiene concurrencia de escritura limitada, diferencias de tipos/SQL y no soporta schemas PostgreSQL. El filesystem de Render puede perderse al reiniciar o redeployar si no se contrata y configura disco persistente; incluso con disco, el reset determinista debe seguir siendo posible. No se debe presentar la demo como almacenamiento durable o entorno productivo.
