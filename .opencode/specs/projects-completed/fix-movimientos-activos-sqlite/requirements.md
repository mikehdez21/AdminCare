# Requirements

## Goal
Make `/almacen-general/movimientos-activos/individual` work in SQLite demo mode even though the original implementation reads a PostgreSQL/SQL view.

## Contract
- Preserve the existing endpoint, filters, pagination and response envelope.
- Return synthetic seeded movement data using the same fields expected by the frontend.
- Keep the PostgreSQL/view path unchanged where applicable.
- Do not require PostgreSQL-specific SQL or database views in SQLite.
