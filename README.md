# AdminCare

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/mikehdez21/AdminCare)

AdminCare comenzó como un sistema para almacén general y control de activos, pero el desarrollo fue ampliando su alcance hasta convertirlo en una base tipo ERP pensada para crecer por microsistemas. Hoy sigue cubriendo almacén y activos, pero está planteado para integrar módulos como agenda de citas de consulta externa e imagen, etiquetado de instrumental de CEYE, helpdesk, intranet hospitalaria y otros proyectos en puerta, manteniendo una arquitectura preparada para expansión.

## Qué resuelve

- Centraliza procesos administrativos y de control operativo.
- Administra usuarios, roles, empleados, departamentos y ubicaciones.
- Da seguimiento a activos fijos, movimientos, facturas y almacén general.
- Integra servicios de impresión de QR y etiquetas Zebra.
- Añade capacidades de SoftComputing para predicción y análisis asistido.

## Stack principal

| Capa | Tecnología | Dónde vive |
| --- | --- | --- |
| Frontend | React 18, Redux Toolkit, Vite | Vercel |
| Backend | Laravel 11, Sanctum, Spatie Permission | Railway |
| Microservicio IA | FastAPI, scikit-learn | Railway |
| Base de Datos | PostgreSQL | Supabase |

## Arquitectura

El flujo está pensado en tres piezas:

- Cliente web en React para la experiencia de usuario.
- API en Laravel para autenticación, reglas de negocio y persistencia.
- Servicio SoftComputing en Python para tareas de predicción y análisis.

Además, el despliegue está desacoplado: el frontend publica en Vercel y las APIs se resuelven contra Railway con reglas de proxy/rewrite para evitar problemas de CORS. La base de datos del sistema se centraliza en Supabase.

## SoftComputing

SoftComputing es la capa de inteligencia del sistema. Se usa para complementar la operación con análisis de datos, predicción de precios y detección de anomalías, conectando el backend Laravel con un microservicio Python especializado.

En precios, el microservicio FastAPI trabaja con tres algoritmos principales:

- `LinearRegression` para relaciones lineales simples.
- `RandomForestRegressor` para combinar varios árboles y dar predicciones más robustas.
- `KNeighborsRegressor` para estimar valores a partir de casos similares.

La parte contextual usa OpenAI para análisis asistido sobre escenarios como predicción de precios, detección de anomalías, fraude y optimización de inventario. El flujo principal usa `gpt-5-search-api` y, si hace falta, cae a `gpt-4o-mini` como respaldo.

## Deploys

- Frontend: Vercel.
- Backend API: Railway.
- Servicio SoftComputing: Railway.
- Base de datos: Supabase.

## Módulos destacados

- Autenticación y autorización con SPA sessions y control de permisos.
- Activos fijos y movimientos de inventario.
- Almacén general y facturación.
- Generación de QR y etiquetas para impresión.
- Servicios de análisis y predicción para soporte operativo.
- Análisis contextual con OpenAI para apoyo en decisiones.

## Acceso rápido por QR

Este README está pensado para lectura rápida desde un QR. La idea es que el código apunte al repositorio o a esta documentación para que cualquier persona entienda en segundos:

1. Qué es AdminCare.
2. Qué problemas resuelve.
3. Qué stack usa.
4. Cómo está desplegado.
5. Dónde entra SoftComputing.

## Documentación extendida

Si quieres profundizar, la documentación indexada en DeepWiki resume la arquitectura, módulos y despliegue del proyecto:

- https://deepwiki.com/mikehdez21/AdminCare
