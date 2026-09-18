# AdminCare

AdminCare comenzó como un sistema para almacén general y control de activos, pero el desarrollo fue ampliando su alcance hasta convertirlo en una base tipo ERP pensada para crecer por microsistemas. Hoy sigue cubriendo almacén y activos, pero está planteado para integrar módulos como agenda de citas de consulta externa e imagen, etiquetado de instrumental de CEYE, helpdesk, intranet hospitalaria y otros proyectos en puerta, manteniendo una arquitectura preparada para expansión.

## Historial del proyecto y evolución técnica

AdminCare fue originalmente un proyecto escolar. En una etapa anterior, este mismo proyecto estuvo desplegado con el frontend en Vercel y con Railway ejecutando dos microservicios: una API Laravel y un servicio de Softcomputing basado en FastAPI, utilizado para la API de OpenAI y un servicio de ML. Con base de datos PostgreSQL mediante el SaaS Supabase.

Los cambios actuales documentan y justifican decisiones de evolución técnica para presentar el proyecto en el portafolio del autor: [portfolio.mikehdez21.workers.dev](https://portfolio.mikehdez21.workers.dev/), alojado en Cloudflare.

## Qué resuelve

- Centraliza procesos administrativos y de control operativo.
- Administra usuarios, roles, empleados, departamentos y ubicaciones.
- Da seguimiento a activos fijos, movimientos, facturas y almacén general.
- Integra servicios de impresión de QR y etiquetas Zebra (No disponible en la demo).

## Stack principal

| Capa | Tecnología | Dónde vive |
| --- | --- | --- |
| Frontend | React 18, Redux Toolkit, Vite | Render |
| Backend | Laravel 11, Sanctum, Spatie Permission | Render |
| Base de Datos | SQLite | Render (demo) |

## Requisitos mínimos

- PHP 8.4 con la extensión `pdo_sqlite`.
- Composer.
- Node.js 22 y pnpm.
- SQLite disponible para el entorno local.

## Instalación local

Desde la raíz del proyecto:

```sh
cp .env.example .env
composer install
php artisan key:generate
composer run setup:sqlite
php artisan migrate --seed
cd frontend && pnpm install
```

La base local se guarda en `database/database.sqlite`. No se necesita una base de datos externa para probar la demo.

## Cómo ejecutar

En una terminal, inicia Laravel:

```sh
php artisan serve
```

En otra terminal, inicia el frontend:

```sh
cd frontend && pnpm run dev
```

Abre la dirección que muestre Vite, normalmente `http://localhost:5173`. El proxy local usa Laravel en `http://127.0.0.1:8000` por defecto.

## Despliegue en Render

El repositorio incluye la configuración necesaria para un servicio web Docker:

- Render construye el frontend y la imagen PHP mediante `Dockerfile`.
- Durante cada release ejecuta `migrate:fresh --seed --force`: borra la SQLite demo y la regenera con las migraciones y el `DemoSeeder` actuales. No existe un seed condicional posterior.
- El servicio inicia Laravel en el puerto que proporciona Render y verifica su estado en `/status`.
- La base es SQLite en `database/database.sqlite`; el flujo destructivo está protegido por `DEMO_MODE=true`, SQLite y `DEMO_DATABASE_ALLOW_RESET=true`. No se configura persistent disk ni una base externa.
- El filesystem estándar de Render es efímero. Un restart sin un nuevo release no ejecuta `releaseCommand`, aunque puede perder la base y la sesión; cada release posterior vuelve a generar el dataset desde cero.

Para desplegar, crea un servicio en Render conectado al repositorio y aplica `render.yaml` como Blueprint. No es necesario ejecutar manualmente los scripts de release o arranque.

## Límites de la demo

- Usa datos sintéticos y no debe tratarse como almacenamiento de producción.
- Cada release destruye cualquier cambio realizado en la SQLite demo y restaura el dataset del seeder.
- Las escrituras tienen una cuota global de 100 unidades de negocio.
- Las subidas de archivos, fotos, QR persistente, impresión Zebra/QZ Tray y conexiones externas no están disponibles.
- Un reinicio de Render puede cerrar la sesión y perder la base SQLite del filesystem efímero; un restart por sí solo no ejecuta el `releaseCommand`.

## Solución de problemas

- **No inicia SQLite:** verifica que PHP tenga `pdo_sqlite` habilitado y que exista `database/database.sqlite`.
- **El frontend no llega a la API:** ejecuta Laravel en el puerto 8000 o define `VITE_PROXY_TARGET`/`VITE_APP_API` con la dirección correcta.
- **La demo alcanzó su límite:** las nuevas escrituras se rechazan al llegar a 100 unidades; no es un error del formulario.
- **La sesión desapareció en Render:** puede ocurrir después de un reinicio porque la demo usa sesiones en archivo y almacenamiento efímero.
