# Requirements

## Goal
Implement a label QR preview that generates the QR in the browser without server storage, so it can be scanned and open the fixed asset's own page.

## User stories
- As an authorized user, I can preview a label QR for a fixed asset before printing.
- Scanning the QR opens the canonical asset detail page for that asset.
- No QR image/file is uploaded or persisted on the server.

## Constraints
- Use existing QR/frontend conventions where available.
- Encode a stable application URL containing the asset identifier, not sensitive data.
- Preserve RBAC for managing/previewing labels and protect the asset detail route appropriately.
