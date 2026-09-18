# Architecture

Inspect the current `ErrorBoundary`, `App.tsx`, shared SweetAlert utilities and Redux/API error handling. Reuse existing AdminCare notification conventions rather than adding a second alert library. Keep error handling at the smallest affected feature boundary where possible; avoid DOM-removal side effects from a global fallback render.
