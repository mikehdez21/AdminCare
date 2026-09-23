# Criterios de aceptación — Quitar sección "Otros permisos" sin columna "Base"

- [ ] En Añadir/Editar rol, la tabla de permisos muestra **todos** los permisos
      del catálogo en el grid original de 4 columnas
      `Permiso | Escritura | Lectura | Control`: 21 filas de módulo × 3 acciones
      = 84 permisos representados. **No existe columna "Base".**
- [ ] No existe la sección "Otros permisos" en `TablaPermisosRol` ni en
      `ShowPermisosRole`.
- [ ] Modal "Permisos del Rol:" (Ver) muestra **solo** los permisos asignados al
      rol (`rolToShow.permissions`); para el rol Admin se ven las 21 filas con
      las 3 acciones marcadas.
- [ ] Al crear un rol nuevo seleccionando acciones de un módulo, el backend
      asigna también los permisos base del/de los módulos (verificable con POST).
- [ ] El middleware de rutas sigue funcionando para roles nuevos (permisos base
      presentes).
- [ ] BD intacta: `permissions` = 84 y Admin tiene 84 (no se quitaron bases).
- [ ] `pnpm exec tsc --noEmit` y `git diff --check` sin errores de esta tarea.