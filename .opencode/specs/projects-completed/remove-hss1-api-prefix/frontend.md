# Frontend y consumidores

El frontend contiene consumidores de `/api/HSS1/...` y deberá migrarlos a
`/api/...` en su trabajo correspondiente. Este cambio backend no conserva
aliases, por lo que clientes antiguos recibirán 404 (o la respuesta del
catch-all si no se trata de una ruta API válida).

La configuración de sesión, cookies y CSRF no cambia; solo cambia el path de
la solicitud.
