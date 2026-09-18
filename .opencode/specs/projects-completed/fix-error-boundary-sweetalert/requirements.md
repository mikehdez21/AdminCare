# Requirements

## Goal
Replace the generic section-level error screen with controlled, non-destructive error handling. Expected empty-data/API failures must use the application's SweetAlert pattern; unexpected React errors must not show the misleading “No se pudo mostrar esta sección” view.

## Preserved contract
- Do not log the user out or lose the current route/session.
- Empty catalogs and unavailable optional data render a safe empty state or SweetAlert, not a blank page.
- Keep the existing error details available to developers through console logging.
- Avoid masking real programming errors as successful operations.
