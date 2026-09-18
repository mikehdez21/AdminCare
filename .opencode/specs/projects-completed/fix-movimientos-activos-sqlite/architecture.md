# Architecture

The backend should detect the active database driver and use a SQLite-compatible query/repository path for individual fixed-asset movements. Prefer querying the normalized SQLite tables or a Laravel query builder join rather than creating a PostgreSQL-specific view. Reuse the existing controller/service response contract and frontend data shape.
