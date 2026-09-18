# Acceptance

- [ ] Login from `http://localhost:5173` succeeds against `http://127.0.0.1:8000` without CSRF mismatch.
- [ ] `/auth/check` recognizes the logged-in session.
- [ ] Logout succeeds and invalidates the local database session.
- [ ] A failed CSRF bootstrap reports a useful error instead of silently submitting login.
- [ ] No Render configuration is changed by this task.
