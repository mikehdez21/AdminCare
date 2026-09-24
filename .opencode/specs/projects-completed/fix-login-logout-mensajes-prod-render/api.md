# API — Contrato preservado

| Endpoint | Método | Estado |
|---|---|---|
| `/api/auth/login` | POST | Se preserva. Ya responde `{ success, message, user, rol, permissions, departamento }` o `{ success:false, message, error_id }`. Sin cambios de contrato. |
| `/api/auth/logout` | POST | Se preserva la forma `{ success, message }`. Al fallar podrá incluir `error_id` (igual que login) para correlacionar logs. |
| `/api/auth/check` | GET | Sin cambios. |

Envelope: `{ success, message, ...data }` siempre.
- Códigos HTTP: login 200/401/403/422/500; logout 200/500 coherente con el estado real.
- Permisos RBAC: sin cambios.