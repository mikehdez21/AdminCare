# Requisitos

## Objetivo

Simplificar `README.md` para que una persona no técnica pueda entender AdminCare, probarlo localmente y conocer sus límites de demo sin leer procedimientos internos.

## Alcance

- Describir el propósito funcional de AdminCare en lenguaje claro.
- Documentar únicamente requisitos mínimos, instalación local breve, ejecución, Render, variables importantes, límites y solución de problemas.
- Mantener comandos portables en bloques `sh` solo para pasos imprescindibles.
- Alinear los datos documentados con `.env.example`, `render.yaml`, `Dockerfile`, `scripts/render-release.sh` y `scripts/render-start.sh`.

## Fuera de alcance

- Cambios en código, configuración de despliegue o scripts.
- Documentación exhaustiva de arquitectura interna, comandos de mantenimiento o historial del producto.
- Ejecución de servidores, `php.exe` o pruebas de integración.
