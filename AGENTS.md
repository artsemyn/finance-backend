# Repository Guidelines

## Project Structure & Module Organization
This repository is a Node.js backend for personal finance features.

- `src/index.js`: app bootstrap, middleware registration, and route mounting.
- `src/routes/`: HTTP route definitions (`auth`, `transactions`, `savings`, `reminders`).
- `src/controllers/`: request/response handlers.
- `src/services/`: business logic and Prisma data access orchestration.
- `src/middlewares/`: auth, async wrapper, and global error handler.
- `src/jobs/`: scheduled jobs (currently `autoSavings.job.js`).
- `lib/prisma.js`: Prisma client initialization.
- `prisma/schema.prisma` and `prisma/migrations/`: database schema and migrations.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: run API locally on port `3000` via `src/index.js`.
- `npx prisma migrate dev`: create/apply migration in development.
- `npx prisma migrate deploy`: apply existing migrations in non-dev environments.
- `npx prisma generate`: regenerate Prisma client after schema changes.
- `npm test`: currently a placeholder and intentionally fails.

## Coding Style & Naming Conventions
- Use CommonJS (`require/module.exports`) consistently.
- Use 4-space indentation and semicolon-free style (match existing code).
- File naming:
  - `*.controller.js`, `*.service.js`, `*.routes.js`, `*.middleware.js`.
- Keep route handlers thin; place validation/business logic in `services`.
- Return JSON errors via `error.middleware` shape: `{ "error": "message" }`.

## Testing Guidelines
No automated test framework is configured yet. For now:
- Validate endpoints manually using Postman/Thunder Client.
- Verify auth-protected routes with `Authorization: Bearer <token>`.
- After schema updates, run migration and sanity-check affected endpoints.

When adding tests, prefer placing them under `src/__tests__/` with `*.test.js` naming.

## Commit & Pull Request Guidelines
Git history is not available in this workspace, so no enforced commit pattern can be inferred. Recommended convention:
- `feat: ...`, `fix: ...`, `refactor: ...`, `docs: ...`, `chore: ...`.

For pull requests, include:
- concise summary of behavior changes,
- impacted routes/files (example: `src/services/transaction.service.js`),
- migration notes if `prisma/` changed,
- sample request/response for API changes.

## Security & Configuration Tips
- Never commit `.env` or real credentials.
- Required env vars: `DATABASE_URL`, `JWT_SECRET`.
- Rotate secrets immediately if exposed and update all environments.

## Agent Change Logging
Any agent that modifies repository files must record the change in this file before finishing the task.

- Add one new line to the `Change Log` section for each task that changes files.
- Include date, agent, files changed, and a short summary.
- Keep entries concise and newest-first.
- If no files are changed, no log entry is required.

## Change Log
- 2026-03-01 | Codex | `src/controllers/auth.controller.js`, `AGENTS.md` | Updated `/auth/register` to return a JWT token for immediate post-registration login and removed the hashed password from the register response.
- 2026-02-25 | Codex | `src/services/transaction.service.js`, `prisma/schema.prisma`, `prisma/migrations/20260225120000_change_transaction_amount_to_decimal/migration.sql`, `src/__tests__/transaction.service.test.js`, `package.json` | Refactored transaction create/update validation for strict amount/type/date handling, switched transaction amount to Decimal with migration, and added unit tests for amount/type/date edge cases.
- 2026-02-23 | Codex | `src/services/autoSavings.service.js`, `src/middlewares/cronAuth.middleware.js`, `src/controllers/internal.controller.js`, `src/routes/internal.routes.js`, `src/app.js`, `src/jobs/autoSavings.job.js`, `vercel.json`, `README.md` | Added secured internal auto-savings trigger endpoint and Vercel Cron schedule, reusing one service for both scheduled and manual execution.
- 2026-02-23 | Codex | `src/app.js`, `src/index.js`, `api/index.js`, `vercel.json`, `README.md` | Added Vercel serverless deployment setup by extracting Express app, adding API handler and routing config, and documenting Vercel deploy flow and cron limitation.
- 2026-02-23 | Codex | `src/index.js` | Added `GET /` and `GET /health` endpoints returning 200 for Railway health checks to prevent startup recycle/502.
- 2026-02-23 | Codex | `package.json`, `README.md` | Fixed Railway Prisma startup issue by adding `postinstall` generate flow, moving runtime deps (`prisma`, `dotenv`) to dependencies, and adding troubleshooting steps.
- 2026-02-23 | Codex | `src/index.js`, `package.json`, `README.md` | Prepared Railway deployment: added `PORT` support, `start`/Prisma scripts, and step-by-step Railway tutorial.
- 2026-02-23 | Codex | `AGENTS.md` | Added mandatory agent change logging policy and log section.
