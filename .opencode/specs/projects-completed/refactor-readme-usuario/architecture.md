# Arquitectura documental

El README seguirá un recorrido de usuario:

1. Qué es AdminCare.
2. Qué se necesita para ejecutarlo localmente.
3. Instalación y ejecución mínima.
4. Qué ocurre en Render.
5. Variables que requieren atención.
6. Límites de la demo.
7. Solución de problemas frecuentes.

La fuente de verdad operativa será la configuración existente. La documentación debe reflejar Laravel 11/PHP 8.4, frontend React construido con Node 22/pnpm, SQLite en `database/database.sqlite`, `pdo_sqlite`, build Docker, release con migración y seed condicional, arranque con `PORT` y health check `/status`.

Los detalles internos solo se incluyen cuando cambian una decisión del usuario, como la pérdida potencial de datos en el filesystem efímero de Render o la cuota de demo.
