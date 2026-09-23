# Arquitectura

La imagen mantiene dos etapas: `frontend-build` compila los assets y la etapa PHP
instala `pdo_sqlite`, copia el código y ejecuta Composer. Después de `COPY . ./`,
la etapa PHP crea `database/database.sqlite` y solo entonces ejecuta Composer,
permitiendo que `package:discover` valide la ruta SQLite. La comprobación final
de `php -m` sigue verificando la extensión instalada. El release de Render
continúa creando el archivo y ejecutando sus comprobaciones destructivas en
runtime, sin cambios de configuración ni variables durante el build.
