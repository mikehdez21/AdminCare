# Arquitectura

Los archivos compilados se publican en `public/build` por el build de Vite y
son servidos directamente cuando existen. En el despliegue de Render, una
solicitud a un archivo inexistente pasa al front controller de Laravel; por
eso el catch-all de `routes/web.php` debe excluir explícitamente el segmento
`build`.

El patrón final del parámetro `any` es:

```regex
^(?!(?:api|HSS1|build)(?:/|$)).*
```

Así se preserva el fallback SPA para las demás rutas, se mantienen las rutas
API y aliases legacy fuera del fallback, y una ruta inexistente bajo `build`
queda sin coincidencia y Laravel responde 404. No se añade ninguna regla de
MIME: el tipo de los archivos existentes continúa siendo responsabilidad del
servidor de archivos.

La revisión de `public/.htaccess` no encontró una regla que reescriba
`public/build` a `welcome.blade.php`; sus condiciones solo envían al front
controller archivos y directorios que no existen. El 401 de `auth/check` es
un comportamiento esperado sin sesión y no forma parte de esta corrección.
