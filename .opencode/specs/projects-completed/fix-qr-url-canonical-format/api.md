# API

- Generación/regeneración: `codigo_qr = QR + codigo_etiqueta`.
- `url_destino = FRONTEND_URL/activosfijos/qraf/{codigo_qr}` con el segmento
  codificado para URL.
- `GET /api/HSS1/activosfijos/qraf/{codigoQR}` mantiene el envelope existente y
  resuelve tanto el formato canónico como el legacy (`AF1`, `QRAF1` y valores
  históricos persistidos).
- `GET /activosfijos/qraf/{codigoQR}` en web se mantiene como alias/redirect
  hacia frontend.
