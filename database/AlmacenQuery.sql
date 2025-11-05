create table af_clasificaciones (
    id_clasificacion bigint primary key generated always as identity,
    clasificacion_af text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
create table ref_formaspago (
    id_formapago bigint primary key generated always as identity,
    descripcion text unique not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
CREATE TABLE ref_tipodescuento_proveedor (
    id_descuento_proveedor BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    descripcion TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
create table af_proveedores (
    id_proveedor bigint primary key generated always as identity,
    nombre_proveedor text not null,
    razon_social text not null,
    email_proveedor text unique not null,
    telefono_proveedor text not null,
    sitioweb text,
    moneda_proveedor text,
    tipo_proveedor text check (
        tipo_proveedor in ('Productos', 'Servicios', 'Ambos')
    ) not null,
    forma_pago bigint not null references ref_formaspago (id_formapago),
    rfc text not null,
    tipo_regimen text check (tipo_regimen in ('Moral', 'Fisica')) not null,
    tipo_descuento bigint not null references ref_tipodescuento_proveedor (id_descuento_proveedor),
    tipo_facturacion text check (tipo_facturacion in ('Gravada', 'Exenta')) not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
CREATE TABLE af_facturas (
    id_factura_af BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    id_proveedor BIGINT NOT NULL REFERENCES almacengeneral.af_Proveedores(id_proveedor) num_factura TEXT NOT NULL,
    tipo_factura BOOLEAN NOT NULL,
    fecha_frecepcion DATE,
    fecha_femitida DATE NOT NULL,
    forma_pago BIGINT NOT NULL REFERENCES ref_formaspago (id_formapago),
    tipomoneda TEXT,
    observaciones_factura TEXT,
    subtotal_factura NUMERIC(11, 2),
    descuento_factura NUMERIC(11, 2),
    flete_factura NUMERIC(11, 2),
    iva_factura NUMERIC(11, 4),
    total_factura NUMERIC(11, 4),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
CREATE TABLE activos_fijos (
    id_activo_fijo BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    codigo_unico TEXT UNIQUE NOT NULL,
    id_clasificacion BIGINT NOT NULL REFERENCES af_clasificaciones(id_clasificacion),
    nombre_af TEXT NOT NULL,
    descripcion_af TEXT,
    fecha_adquisicion_af DATE NOT NULL,
    costo_adquisicion_af NUMERIC(11, 2) NOT NULL,
    vida_util_meses INT,
    valor_residual NUMERIC(11, 2),
    estado_af TEXT CHECK (estado_af IN ('Activo', 'Baja')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
);
CREATE TABLE af_compras (
    id_compra_af BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    id_activo_fijo BIGINT UNIQUE REFERENCES activos_fijos(id_activo_fijo) ON DELETE CASCADE,
    id_factura_af BIGINT NOT NULL REFERENCES facturas(id_factura_af),
    cantidad_activos INT DEFAULT 1,
    descuento_compra NUMERIC(11, 2) DEFAULT 0,
    periodo_garantia TEXT,
    propio TEXT CHECK (propio IN ('Propio', 'Terceros')) orden_compra text,
    fecha_compra date,
);
CREATE TABLE af_movimientos (
    id_movimiento_af BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    id_activo_fijo BIGINT REFERENCES activos_fijos(id_activo_fijo) ON DELETE CASCADE,
    ubicacion_af TEXT,
    referencia_ubi TEXT,
    responsable_af TEXT,
    solicitante_af TEXT,
    fecha_entrega DATE
);