# Arquitectura

`AuthController@login` conserva la validación, autenticación de sesión y
payload existentes, pero elimina la escritura de una columna que no forma
parte del esquema actual. Un único `catch (Throwable)` genera un identificador
correlacionable y escribe un evento seguro mediante `Log`; el cliente recibe
solo un mensaje genérico y el identificador.

La exclusión global de `QueryException` se elimina para que Laravel pueda
reportar errores de base de datos. El canal `stderr` se selecciona únicamente
en Render mediante `render.yaml`; la configuración de Sanctum mantiene su
fallback local y recibe el dominio de Render por variable de entorno.
