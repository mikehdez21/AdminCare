# Architecture

Use Laravel session authentication with the existing SQLite database session driver. The browser must receive `/sanctum/csrf-cookie` from the Laravel origin, retain cookies, and send the decoded `XSRF-TOKEN` value as `X-XSRF-TOKEN` on state-changing requests. CORS must allow the exact local React origin with credentials.
