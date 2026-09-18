# Frontend

- Remove or replace the generic global fallback currently rendered by `frontend/src/js/components/ErrorBoundary.tsx` and wired in `frontend/src/js/App.tsx`.
- Use the existing SweetAlert wrapper for expected request, empty-catalog and mutation errors.
- Preserve safe loading/empty states for catalogs and log unexpected exceptions without presenting the requested generic view.
