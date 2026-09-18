# Arquitectura

`CodigosQRAF` centraliza la construcción del código y de la URL pública. La
configuración ya expone `app.frontend_url` desde `FRONTEND_URL`, que es el
dominio correcto porque la ruta pública `/activosfijos/qraf/:codigoQR` vive en
React; Laravel conserva un redirect legacy para códigos que todavía apuntan al
backend. Los fallbacks de impresión deben usar el mismo constructor para no
generar URLs backend inconsistentes.
