# Criterios de aceptación

- [ ] Una ruta frontend existente continúa resolviéndose mediante el fallback
  de `welcome.blade.php`.
- [ ] `/build/assets/<archivo-inexistente>.js` y
  `/build/assets/<archivo-inexistente>.css` no coinciden con el catch-all y
  responden 404, nunca el HTML de `welcome.blade.php`.
- [ ] Las rutas bajo `/api` y los aliases legacy existentes,
  permanecen sin cambios.
- [ ] No se agregan overrides manuales de MIME ni reglas que intercepten
  `public/build`.
- [ ] El 401 de `auth/check` sin sesión se mantiene como comportamiento
  esperado y no se trata como fallo de assets.
- [ ] `git diff --check` termina correctamente.
