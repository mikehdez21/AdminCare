# Aceptación

- Para un activo con `codigo_etiqueta=AF1-F1-L1-C1-LT1`, el nuevo valor es
  `QRAF1-F1-L1-C1-LT1`.
- La URL generada tiene la forma
  `https://<FRONTEND_URL>/activosfijos/qraf/QRAF1-F1-L1-C1-LT1`.
- El resolver sigue encontrando un activo al recibir `AF1` y conserva aliases
  legacy.
- No hay cambios de migraciones, secretos, commits ni servidores iniciados.
- `git diff --check` y las verificaciones estáticas aplicables pasan.
