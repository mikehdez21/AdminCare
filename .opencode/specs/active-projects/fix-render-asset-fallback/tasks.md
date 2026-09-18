# Tareas

- [x] Revisar el catch-all de `routes/web.php` y el flujo de publicación de
  `public/build` en Docker/Render.
- [x] Revisar `public/.htaccess` y las reglas de bootstrap para descartar otra
  intercepción específica de `public/build`.
- [x] Excluir `build` del catch-all junto con `api` y `HSS1`, conservando el
  fallback frontend y los aliases legacy.
- [x] Documentar que no se modifica MIME manualmente y que `auth/check` 401 sin
  sesión es esperado.
- [ ] Ejecutar revisión estática y revisión del agente revisor.
- [ ] Revisar y cerrar esta spec después de la validación del cambio.
