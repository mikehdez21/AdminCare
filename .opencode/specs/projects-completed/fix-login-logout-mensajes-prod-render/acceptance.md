# Acceptance — Criterios que el usuario confirmará

## Login
- [ ] Tras un login correcto, se aprecia el mensaje de éxito ("Login exitoso!") antes o
      mientras navega a `/app` (ya no se borra en el mismo tick).
- [ ] Un login fallido (credenciales inválidas / usuario no existe / cuenta inactiva) muestra
      el mensaje correspondiente en el box de error.
- [ ] Un login sin respuesta del servidor ya no queda "colgado" en silencio: a los ~30s el
      usuario ve un error de conexión/timeout.

## Logout
- [ ] Cerrar sesión correctamente en Render: redirige a `/login` sin errores.
- [ ] Si el logout llegara a fallar 500, el usuario ve el Swal con mensaje claro (± `error_id`)
      y NO queda en un estado incoherente (la app no lo "desloguea" a medias mientras el
      backend mantiene la sesión).
- [ ] Los logs de Render (`stderr`) registran la clase de excepción exacta y el `error_id`
      del 500 de logout para confirmar la causa raíz.

## Calidad
- [ ] `git diff --check` limpio.
- [ ] `pnpm exec tsc --noEmit` pasa.
- [ ] No se modifican: esquema SQLite, migraciones, permisos, rutas, CSRF ni autenticación
      (salvo el manejo de errores de logout).
- [ ] No se introducen secretos.

## Confirmación final
- [ ] El usuario confirma con los logs de Render y la prueba en prod que los síntomas
      desaparecieron antes de archivar la spec.