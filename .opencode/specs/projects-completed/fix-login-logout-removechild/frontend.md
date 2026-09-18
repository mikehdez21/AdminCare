# Frontend

- Stabilize App/router/Suspense transitions so login and logout do not trigger stale fallback deletion.
- Correct auth restore/logout state transitions and navigation.
- Remove direct DOM manipulation or duplicate React-root rendering if present.
- Preserve SweetAlert for actionable logout failures and a safe visible login state.
