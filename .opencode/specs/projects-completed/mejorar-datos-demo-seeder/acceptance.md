# Aceptación

- [ ] Existe `NOF-2026-0001` con proveedor, transferencia, MXN, tipo gravada y montos 39,000/6,240/45,240.
- [ ] Las cuatro unidades facturadas tienen códigos generados por el modelo, etiquetas con formato `codigo-F{id}-L{linea}-C{consecutivo}-LT{total}` y relación única factura-activo.
- [ ] Las laptops comparten `LT1-F{id}` y tienen consecutivos 1 y 2; TV y escritorio usan LT2 y LT3.
- [ ] El proyector Epson está sin relación de factura, con `codigo_lote=SINFACTURA` y etiqueta `codigo_unico-SINFACTURA`.
- [ ] Todos los movimientos apuntan al empleado demo, a una ubicación creada y al tipo de movimiento demo; no hay QR persistidos.
- [ ] La cuota queda muy por debajo de 100 unidades.
- [ ] `git diff --check` no reporta errores.
