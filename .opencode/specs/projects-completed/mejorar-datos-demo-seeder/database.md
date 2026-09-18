# Base de datos

Se usan únicamente tablas y columnas ya existentes en el esquema SQLite demo:
facturas, proveedores, activos, tabla intermedia, ubicaciones, movimientos y
catálogos. La factura contiene cuatro unidades: dos laptops a 12,000, una TV
a 8,500 y un escritorio a 6,500; subtotal 39,000, IVA 6,240 y total 45,240.

Lotes: `LT1-F{id_factura}` (laptops, consecutivos 1/2, total 2),
`LT2-F{id_factura}` (TV) y `LT3-F{id_factura}` (escritorio). El proyector no
tiene fila en la tabla intermedia y queda en `SINFACTURA`.

El seeder existente crea registros nuevos en cada ejecución y no fue ampliado
a una estrategia idempotente: su uso esperado continúa siendo sobre una base
demo limpia o controlada por el flujo de release.
