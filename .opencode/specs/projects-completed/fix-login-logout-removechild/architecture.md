# Architecture

Inspect `App.tsx`, `ErrorBoundary`, `BrowserRouter`/`Suspense`, auth Redux actions/reducer, `LogoutModal`, API interceptors and any third-party DOM-mutating libraries. Keep one React root and one ownership model for DOM. Authentication transitions should be represented by Redux/router state, not by direct DOM manipulation or forced reloads.
