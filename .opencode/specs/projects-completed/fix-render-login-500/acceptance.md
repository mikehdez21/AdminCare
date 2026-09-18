# Aceptación

- [ ] Un login válido no provoca una consulta `UPDATE` a `ultimo_acceso`.
- [ ] Un error inesperado queda correlacionado por `error_id` en los logs de
  Render y la respuesta no revela detalles internos.
- [ ] `SANCTUM_STATEFUL_DOMAINS` contiene `admincare-demo.onrender.com` en
  Render y el fallback local sigue funcionando sin esa variable.
- [ ] Un usuario sin departamento completa login con `departamento` igual a
  `No asignado`.
- [ ] No existe el prefijo `HSS1` en `routes/api.php`.
- [x] `git diff --check` no reporta errores.
