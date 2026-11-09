# Permisos — Helpdesk completo

## 1. Recursos

Se agregan a `config/permisos.php`:

| Recurso | Acciones |
|---|---|
| `helpdesk.tickets` | lectura, escritura |
| `helpdesk.mis_tickets` | lectura, escritura |
| `helpdesk.reportes` | lectura |
| `helpdesk.configuracion` | lectura, escritura |
| `helpdesk.internas` | lectura, escritura |

`config/permisos.php` ya tiene `catalogos.*` desde Spec 1.

## 2. Alcances

```php
'alcances' => [
    'helpdesk.tickets' => ['propio', 'departamento', 'global'],
    'helpdesk.reportes' => ['propio', 'departamento', 'global'],
]
```

- `global` solo por fila en `tableInter_rolesAlcances`.
- `departamento` se deriva si el usuario y el departamento tienen `atiende_helpdesk`.
- `propio` es el default.

## 3. Roles demo

| Rol | Permisos | Alcance |
|---|---|---|
| `Admin` | Todos | Global Helpdesk |
| `HelpdeskTecnico` | `helpdesk.tickets.*`, `helpdesk.reportes.lectura`, `helpdesk.configuracion.lectura`, `helpdesk.internas.*`, `catalogos.*.lectura` | Departamento derivado |
| `HelpdeskSolicitante` | `helpdesk.mis_tickets.*`, `catalogos.*.lectura` | Propio derivado |
| `Almacen` / `JAlmacenGeneral` | Sin cambios | — |

## 4. Backend

```text
app/Services/Permisos/AlcanceService.php
app/Models/User.php
app/Models/Departamento.php
app/Http/Controllers/AuthController.php
```

Cambios:

- `User::departamentos()`.
- `User::scopeAtiendenHelpdesk()`.
- `User::scopeConCorreo()`.
- `Departamento::atiende_helpdesk`.
- `AuthController` agrega `alcances` y `user.departamentos_atiende`.
- `AuthController` actualiza `ultimo_acceso`.
- `AlcanceService` aplica alcance en listados/dashboard.

## 5. Rutas

```php
$permTicketsLectura = Permisos::middleware('helpdesk.tickets', 'lectura');
$permTicketsEscritura = Permisos::middleware('helpdesk.tickets', 'escritura');
$permMisTicketsLectura = Permisos::middleware('helpdesk.mis_tickets', 'lectura');
$permMisTicketsEscritura = Permisos::middleware('helpdesk.mis_tickets', 'escritura');
$permReportes = Permisos::middleware('helpdesk.reportes', 'lectura');
$permConfiguracion = Permisos::middleware('helpdesk.configuracion', 'escritura');
$permInternas = Permisos::middleware('helpdesk.internas', 'escritura');
```

Se aplica a:

- Lectura de catálogos y tickets.
- Crear/reabrir/encuestar.
- Actualizar/cambiar estatus/asignar/cerrar.
- Configuración.
- Dashboard.

## 6. Frontend

- `utils/alcances.ts`.
- `authReducer` con `alcances`.
- `SubMenuOptions_Helpdesk.tsx`.
- `ModalAlcanceRol.tsx`.
- `TablaPermisosRol` con alcances.
- `rolesApi` con alcance.

Reglas:

- El menú Helpdesk aparece solo con capacidades.
- El alcance no se calcula en el frontend.
- Admin puede asignar alcance global desde Roles.

## 7. Verificación

- Admin ve todo.
- Técnico ve su departamento.
- Solicitante ve solo sus tickets.
- Sin permiso: 403.
- Alcance global solo si hay fila.
- Roles UI muestra alcances de Helpdesk.
