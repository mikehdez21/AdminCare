# Acceptance

- With all four required environment values set, the reset runs before the
  Laravel server command.
- With any required value missing or different, the script exits non-zero and
  does not reset the database.
- With `DB_URL` set to a non-empty value, the script exits non-zero before
  touching or migrating the SQLite database.
- The server uses `0.0.0.0` and `${PORT:-8080}` after initialization.
- Release and start use the same guarded reset implementation.
- Documentation clearly states that each deploy/restart regenerates demo data
  and that the service is not for production.
