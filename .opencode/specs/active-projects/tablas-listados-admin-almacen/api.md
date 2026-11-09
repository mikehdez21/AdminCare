# API — Tablas y listados

## Parámetros

```text
GET /api/<modulo>/<recurso>
    ?page=1
    &per_page=10
    &search=texto
    &sort=nombre
    &direction=desc
    &filtros[nombre]=ana
    &filtros[estatus]=1
    &filtros[fecha_alta]=2026-11-04
```

| Parámetro | Regla |
|---|---|
| `page` | >= 1 |
| `per_page` | 1..100; sin él, lista completa |
| `search` | texto global |
| `sort` | whitelist del controlador |
| `direction` | `asc`/`desc` |
| `filtros[clave]` | whitelist del controlador |

## Respuesta paginada

```json
{
  "success": true,
  "message": "Listado obtenido.",
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total": 42,
    "last_page": 5,
    "search": "ana",
    "sort": "nombre",
    "direction": "asc"
  }
}
```

## Reglas

- Un `sort` inválido se ignora.
- Un `direction` inválido usa el default.
- Un filtro inválido se ignora.
- Un filtro vacío se ignora.
- Los valores se enlazan; no se interpola SQL del cliente.
- `per_page` inválido no genera 500.
- Sin `per_page`, `meta` puede ser `null` y `data` contiene la lista completa.

## Fuera de alcance

- Nuevas rutas.
- Helpdesk.
- Cambios de permisos.
