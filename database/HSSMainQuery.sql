-- Migrations will appear here as you chat with AI
create table permissions (
    id bigint primary key generated always as identity,
    name text not null,
    guard_name text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique (name, guard_name)
);
create table roles (
    id bigint primary key generated always as identity,
    team_id bigint,
    name text not null,
    guard_name text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique (team_id, name, guard_name)
);
create table model_has_permissions (
    permission_id bigint not null,
    model_type text not null,
    model_id bigint not null,
    team_id bigint,
    primary key (team_id, permission_id, model_id, model_type),
    foreign key (permission_id) references permissions (id) on delete cascade
);
create table model_has_roles (
    role_id bigint not null,
    model_type text not null,
    model_id bigint not null,
    team_id bigint,
    primary key (team_id, role_id, model_id, model_type),
    foreign key (role_id) references roles (id) on delete cascade
);
create table role_has_permissions (
    permission_id bigint not null,
    role_id bigint not null,
    primary key (permission_id, role_id),
    foreign key (permission_id) references permissions (id) on delete cascade,
    foreign key (role_id) references roles (id) on delete cascade
);
create table tabledepartamentos (
    id_departamento bigint primary key generated always as identity,
    nombre_departamento text not null,
    descripcion text,
    tipo_departamento text check (
        tipo_departamento in ('Almacen', 'General', 'Medico')
    ),
    atiende_pacientes boolean default false not null,
    estatus_activo boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
create index idx_nombre_departamento on tabledepartamentos using btree (nombre_departamento);
create index idx_tipo_departamento on tabledepartamentos using btree (tipo_departamento);
create index idx_estatus_activo on tabledepartamentos using btree (estatus_activo);
create table tableempleados (
    id_empleado bigint primary key generated always as identity,
    nombre_empleado text unique not null,
    apellido_paterno text,
    apellido_materno text,
    email_empleado text unique not null,
    telefono_empleado text,
    genero text check (genero in ('Masculino', 'Femenino')),
    estatus_activo boolean default true,
    fecha_alta date not null,
    fecha_baja date,
    foto_empleado text,
    firma_movimientos text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    id_departamento bigint,
    foreign key (id_departamento) references tabledepartamentos (id_departamento)
);
create index idx_nombre_empleado on tableempleados using btree (nombre_empleado);
create index idx_apellido_paterno on tableempleados using btree (apellido_paterno);
create index idx_apellido_materno on tableempleados using btree (apellido_materno);
create index idx_estatus_activo_empleado on tableempleados using btree (estatus_activo);
create table tableusuarios (
    id_usuario bigint primary key generated always as identity,
    nombre_usuario text unique not null,
    email_usuario text not null,
    password text not null,
    estatus_activo boolean default true not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    id_empleado bigint,
    id_departamento bigint,
    foreign key (id_empleado) references tableempleados (id_empleado) on delete
    set null,
        foreign key (id_departamento) references tabledepartamentos (id_departamento) on delete
    set null
);
create index idx_nombre_usuario on tableusuarios using btree (nombre_usuario);
create index idx_estatus_activo_usuario on tableusuarios using btree (estatus_activo);
create table table_usuariosdepartamentos (
    id_usuario bigint not null,
    id_departamento bigint not null,
    primary key (id_usuario, id_departamento),
    foreign key (id_usuario) references tableusuarios (id_usuario) on delete cascade,
    foreign key (id_departamento) references tabledepartamentos (id_departamento) on delete cascade
);
create table table_usuariosempleados (
    id_usuario bigint not null,
    id_empleado bigint not null,
    primary key (id_usuario, id_empleado),
    foreign key (id_usuario) references tableusuarios (id_usuario) on delete cascade,
    foreign key (id_empleado) references tableempleados (id_empleado) on delete cascade
);
create table sessions (
    id text primary key,
    user_id bigint,
    ip_address text,
    user_agent text,
    payload text not null,
    last_activity int,
    foreign key (user_id) references tableusuarios (id_usuario)
);
create index idx_last_activity on sessions using btree (last_activity);