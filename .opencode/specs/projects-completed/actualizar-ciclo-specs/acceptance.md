# Acceptance

- `AGENTS.md` establece que la validación explícita del usuario es la
  condición previa para mover la carpeta completa a
  `.opencode/specs/projects-completed/` y que no debe permanecer en
  `active-projects`.
- `.opencode/agents/orchestrator.md` mantiene una regla clara y equivalente.
- `active-projects` no contiene carpetas.
- `projects-completed` contiene las 8 carpetas originales y
  `actualizar-ciclo-specs`.
- No se ha perdido ni alterado el contenido de las especificaciones movidas.
- `git diff --check` finaliza correctamente.
