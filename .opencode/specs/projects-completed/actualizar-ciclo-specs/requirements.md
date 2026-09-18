# Requirements

## Objective

Documentar de forma explícita el ciclo de vida de las especificaciones y
archivar todas las carpetas actualmente activas después de la validación
explícita del usuario.

## Requirements

- `AGENTS.md` debe indicar que, tras la validación explícita del usuario, cada
  carpeta completa debe moverse a `.opencode/specs/projects-completed/`.
- `.opencode/agents/orchestrator.md` debe expresar la misma regla sin
  ambigüedad y sin duplicación innecesaria.
- Las 8 carpetas existentes en `active-projects` deben conservar íntegramente
  su contenido al trasladarse a `projects-completed`.
- La especificación de este trabajo también debe trasladarse al completar la
  tarea, dejando `active-projects` vacío.

## Non-applicable layers

No hay cambios de base de datos, API ni frontend; por ello no se crean
`database.md`, `api.md` ni `frontend.md`.
