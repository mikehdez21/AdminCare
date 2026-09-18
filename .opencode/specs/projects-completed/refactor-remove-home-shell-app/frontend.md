# Frontend

- Remove Home/HomeResumen lazy imports, route entries, redirects and dashboard data loads.
- Login success navigates to the authenticated shell/default app route.
- Sidebar remains visible; MainContent is blank until a navigation item is selected.
- Keep Suspense/ErrorBoundary fallbacks for actual lazy/render failures.
