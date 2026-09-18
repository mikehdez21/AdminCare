# Requisitos

- Sustituir los datos genéricos irreales de `DemoSeeder` por una factura demo válida y activos de oficina/cómputo.
- Usar `NOF-2026-0001`, importes coherentes (subtotal, IVA 16% y total) y catálogos existentes.
- Crear dos laptops Asus del mismo lote y lotes independientes para televisión y escritorio.
- Crear las relaciones en `tableInter_FacturaActivos`, respetar unicidad de códigos y no persistir QR en modo demo.
- Incluir opcionalmente un proyector Epson sin factura con `SINFACTURA`.
- Registrar movimientos con empleado y ubicación válidos y explícitos.
