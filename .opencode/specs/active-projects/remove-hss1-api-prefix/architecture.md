# Arquitectura

Laravel agrega el prefijo `/api` al archivo `routes/api.php` desde
`bootstrap/app.php`. Por ello se elimina únicamente el grupo
`Route::prefix('HSS1')`; las rutas declaradas pasan a ser `/api/...` sin
cambiar sus grupos de middleware ni sus controladores.

La ruta web QR de `routes/web.php` permanece separada en
`/activosfijos/qraf/{codigoQR}`. El catch-all web deja de reservar el segmento
obsoleto `HSS1` y continúa excluyendo `api` y `build`.
