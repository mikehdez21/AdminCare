# Requirements

## Goal
Prevent the login page and logout transition from becoming blank after navigation, hot reload or session errors. Resolve the React `removeChild` crash without hiding the real authentication result.

## Contract
- `/login` must render after a failed session restore or logout.
- Logout must clear the server/client session on success and navigate to login.
- A failed logout must not leave the UI in a contradictory authenticated/loading state.
- Do not manually mutate DOM nodes managed by React.
- Preserve the existing SweetAlert error convention and session-expired handling.
