# Arquitectura

El seeder conserva la creación directa de catálogos, proveedor y usuario. Los
activos se crean mediante `ActivosFijos::crearConQR(..., false)` para usar el
generador de `codigo_unico` del modelo y después formar `codigo_etiqueta` con
el ID/código real. El activo sin factura usa
`ActivosFijos::crearQRSinFactura(..., false)`, que aplica los valores
canónicos de `SINFACTURA` sin generar QR.

Las relaciones factura-activo usan `FacturaActivos` y los movimientos usan
`MovimientosActivos`, manteniendo las claves foráneas y los catálogos actuales.
