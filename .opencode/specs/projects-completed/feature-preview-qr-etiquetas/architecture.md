# Architecture

The feature belongs to the fixed-assets labels frontend flow. Generate the QR client-side from the canonical frontend URL using the existing QR library or a small browser-only component. The backend only needs to provide/resolve the asset identifier and detail endpoint; it must not store QR binaries. Reuse existing asset detail, auth and route patterns.
