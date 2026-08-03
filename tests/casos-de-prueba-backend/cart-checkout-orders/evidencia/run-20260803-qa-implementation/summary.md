# Backend QA Evidence

- RUN_ID: `run-20260803-qa-implementation`
- Branch: `QA-Implementation`
- Revision: `262a67b555510541c750d87b20375880d41f9527`
- Environment: `shopping-cart-qa`, `http://127.0.0.1:18080`

## Commands and results

| Command | Result |
|---|---|
| `yarn workspace @vps-template/api test` | PASS: 8 files, 29 tests |
| `docker compose --profile ops run --rm migrate` | PASS: 3 migrations applied |
| `docker compose --profile ops run --rm seed` | PASS: seed completed |
| `yarn node tests/qa-commerce-smoke.mjs` | PASS: critical API smoke |

## Live smoke checks

- Health and database connectivity: PASS
- Unauthenticated profile rejection: PASS
- Customer registration: PASS
- Public catalog read: PASS
- Customer admin write rejection: PASS
- Cart add: PASS
- Bodyless checkout: PASS
- Same-key checkout retry returns same order: PASS
- Cart empty after checkout: PASS
- Order history: PASS

## Limitations

- This is API/live smoke evidence, not Playwright browser evidence.
- No secrets, tokens, or session values are stored in this artifact.
