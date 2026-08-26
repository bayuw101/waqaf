# TASK_CONTRACT.md

Feature: **Production backend, multi-project collaboration, and durable finance ledger**
Branch: `not-created`
Worktree: `/home/bayw/Documents/Sosial/Waqaf`
Size: XL
Created: 2026-08-25

## Goal

Replace the in-memory AmanahKas prototype state with a secure Next.js backend backed by Neon PostgreSQL. Support Google-only authentication, multiple projects per user, owner/member collaboration, one-use invitation links, mutable account balances backed by an immutable ledger, complete transaction workflows, audit history, and Cloudflare R2 attachments.

## Scope

### In scope

#### Foundation

- Configure environment management without committing secrets.
- Add Drizzle ORM and the Neon serverless PostgreSQL driver.
- Add explicit database schema and migrations.
- Use PostgreSQL `bigint` for whole-IDR monetary values.
- Deploy-compatible configuration for Vercel and Neon pooled connections.
- Keep current prototype records only as development/test seed data; production projects start empty.

#### Authentication

- Add Auth.js with Google OAuth as the only login provider.
- Store Auth.js users, OAuth accounts, and sessions in PostgreSQL.
- Use secure `httpOnly`, `secure`, `sameSite=lax` session cookies in production.
- Preserve an invitation token safely through the OAuth redirect flow.

#### Projects and membership

- A user can own or join multiple projects.
- Add project onboarding for authenticated users without a project.
- Add a project switcher and persist the active project per user.
- Project fields: name, organization name, currency, timezone, public logo metadata, `allow_negative_balance`, and archive state.
- Default currency is `IDR`; default timezone is `Asia/Jakarta`.
- Roles are `owner` and `member`.
- Every project has exactly one owner.
- Owner can update settings, invite/remove members, archive/restore the project, configure negative balances, and create balance adjustments.
- Member can manage ordinary financial workflows and attachments and view project activity.
- Archived projects are read-only and restorable by the owner.
- Every read and mutation verifies server-side membership in the active project; never trust a client-supplied `projectId` alone.

#### Invitations

- Owner creates a copyable bearer invitation link.
- Invitation expires after seven days, is single-use, and can be revoked by the owner.
- Store only a cryptographic hash of the token; show the plaintext token only when created.
- Any Google-authenticated holder can claim it.
- Claim atomically and consume the invitation even if the claimant is already a member.
- Successful claim sets the invited project active and redirects to it.

#### Accounts, balances, and ledger

- Accounts are project-scoped master data.
- Account fields include name, opening balance, mutable current balance, optimistic-lock version, and active state.
- Used accounts cannot be deleted; they can only be deactivated.
- Every cash-impacting operation creates ledger entries and updates current balances atomically.
- Prevent negative balances unless the project owner enabled `allow_negative_balance`.
- Only owners can create balance adjustments.
- Balance adjustments require a reason and audit record; balances cannot be overwritten directly from the UI.
- Provide a reconciliation check: current balance equals opening balance plus active ledger entries.
- Use row locking and/or version checks to prevent concurrent lost updates.

#### Transactions

- Persist all current transaction types and parent/child workflows: cash in, cash out, transfer, debt, receivable, debt payment, receivable receipt, realization, return, PJ reimbursement, PJ non-cash contribution, adjustment, correction, and cancellation.
- Preserve separate cash, income, and expense semantics and prevent double counting.
- Store responsible party as a name only.
- Store category and related party as text; autocomplete from distinct historical project values and allow creating new values.
- Financial values on finalized transactions cannot be edited directly; use correction/reversal records.
- Nonfinancial metadata may be edited.
- Transactions are never hard-deleted; cancellation requires a reason and audit trail.
- All related transaction, ledger, account balance, and audit writes occur in one database transaction.
- Transaction timestamps are UTC; transaction business dates are user-selected and rendered in the project timezone.

#### Audit activity

- Record actor, timestamp, action, object type/id, and a sanitized change summary.
- Provide a project Activity page visible to all members.
- Never expose credentials, session data, invitation tokens, or internal R2 object keys in activity output.

#### Cloudflare R2

- Support a public, cacheable project logo.
- Support private transaction attachments through signed URLs valid for five minutes.
- Allow JPEG, PNG, WebP, and PDF.
- Limit each file to 10 MB and each transaction to 10 active attachments.
- Store original filename, MIME type, size, uploader, timestamps, and private object key.
- All members may soft-delete attachments; record deletion in audit history.
- Clean deleted R2 objects asynchronously so storage failure cannot roll back committed financial data.
- Add R2 only after configuration is supplied; no fake credentials.

### Out of scope

- Email/password, magic-link, or non-Google authentication.
- Roles beyond owner/member.
- Ownership transfer.
- Owner leaving an owned project.
- Permanent project deletion through the UI.
- Accounting period locks.
- Hard deletion of financial transactions.
- Materialized reporting summaries before performance data justifies them.
- Fractional IDR or production support for non-IDR minor-unit rules.
- R2 integration before its configuration is provided.

## Likely Affected Files / Modules

- `package.json`
- `.env.example`
- `.gitignore`
- `drizzle.config.ts`
- `src/db/schema.ts`
- `src/db/index.ts`
- `src/db/migrations/**`
- `src/auth.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/invite/[token]/page.tsx`
- `src/app/onboarding/**`
- `src/app/settings/**`
- `src/app/activity/**`
- `src/app/api/uploads/**`
- `src/lib/auth/**`
- `src/lib/projects/**`
- `src/lib/invitations/**`
- `src/lib/accounts/**`
- `src/lib/transactions/**`
- `src/lib/audit/**`
- `src/lib/storage/**`
- `src/lib/finance.ts`
- `src/lib/finance-provider.tsx` (remove or reduce after server migration)
- `src/components/layout/**`
- `src/components/transactions/**`
- Tests colocated with the domain modules above

Paths are provisional; implementation must follow the existing structure and avoid unrequested architecture.

## Acceptance Criteria

### Security and tenancy

- [ ] Google is the only authentication provider.
- [ ] Unauthenticated protected routes redirect to login.
- [ ] Every project-scoped read and mutation rejects non-members.
- [ ] Owner-only operations reject members.
- [ ] IDs belonging to another project cannot be read or mutated through URL/body substitution.
- [ ] No database, Google, Auth.js, or R2 secret is committed or printed.

### Project collaboration

- [ ] A new authenticated user can create a project and becomes its owner.
- [ ] A user can access multiple projects and switch the active project.
- [ ] Owner can create and revoke invitation links.
- [ ] Invitation claim is atomic, expires after seven days, and succeeds only once.
- [ ] An already-member claimant consumes the invitation and is redirected to the project.
- [ ] Owner can remove a member but cannot remove themselves or leave the project ownerless.
- [ ] Archived projects reject writes and can be restored by the owner.

### Finance

- [ ] Existing prototype transaction workflows persist and reload correctly.
- [ ] Every cash effect produces a ledger entry and atomic current-balance update.
- [ ] Transfer updates source and destination accounts atomically.
- [ ] Insufficient-balance operations are rejected unless negative balances are enabled.
- [ ] Concurrent mutations cannot silently overwrite account balances.
- [ ] Reconciliation detects any difference between stored and ledger-derived balances.
- [ ] Only owner can post balance adjustments, and every adjustment has a reason.
- [ ] Cancellation/correction preserves immutable history and reverses effects correctly.
- [ ] Parent/child transaction semantics do not double-count cash, income, or expense.

### Data and UX

- [ ] Category, related party, and responsible-name autocomplete are project-isolated.
- [ ] Production projects start empty; seed data is development/test only.
- [ ] Loading, empty, error, and success states exist for new server-backed flows.
- [ ] Existing Indonesian copy and integer IDR formatting are retained.
- [ ] Activity page shows sanitized project audit history.

### Attachments

- [ ] Logo and attachment uploads validate MIME type, size, and authorization server-side.
- [ ] A transaction cannot exceed 10 active attachments.
- [ ] Private attachment URLs expire after five minutes.
- [ ] Attachment deletion is soft-deleted and audited before asynchronous R2 cleanup.

## Forbidden Changes

- [ ] Do not use or retain the database credential posted in chat; rotate it first.
- [ ] Do not commit `.env.local`, OAuth secrets, Auth.js secret, database URL, or R2 credentials.
- [ ] Do not trust client-supplied project, account, transaction, member, invitation, or attachment ownership.
- [ ] Do not update account balances outside an atomic ledger-posting transaction.
- [ ] Do not hard-delete financial records or audit records.
- [ ] Do not mutate finalized financial values in place.
- [ ] Do not add roles, ownership transfer, period locking, or speculative abstractions outside scope.
- [ ] Do not refactor unrelated UI or edit generated, vendor, `.next`, or `node_modules` files.
- [ ] Do not connect to or migrate the production database until the rotated `DATABASE_URL` is supplied and migration review is approved.

## Required Context

Agent must read:

- `/home/bayw/AGENTS.md`
- `CLAUDE.md`
- `PRD.md`
- `UI-WIREFRAMES.md`
- `.ai/PROJECT_MEMORY.md` if created
- `.ai/TASKS.md` if created
- `.ai/CONTEXT.md` if created
- `.ai/standards/verification.md` if created
- Existing ADRs relevant to auth, tenancy, ledger, or storage

Before API implementation, read the full Postman MCP instructions if Postman tooling is used.

## Required Serena Inspection

- [ ] `serena_get_symbols_overview` on `src/lib/finance.ts` and `src/lib/finance-provider.tsx`.
- [ ] `serena_find_symbol` for finance calculations and mutations being migrated.
- [ ] `serena_find_referencing_symbols` before changing/removing `FinanceProvider` APIs.
- [ ] Inspect every route/component consuming finance context before replacement.
- [ ] `serena_get_diagnostics_for_file` after TypeScript edits when available.

## Implementation Sequence

Each phase should be a separately reviewable task/PR rather than one giant change:

1. Environment, Drizzle/Neon, schema, migrations, and development seed.
2. Auth.js Google login and protected shell.
3. Projects, memberships, onboarding, active project, and switcher.
4. Invitation creation, revocation, OAuth continuation, and atomic claim.
5. Account master data, ledger posting, mutable balances, adjustment, and reconciliation.
6. Persist and migrate all transaction workflows.
7. Audit instrumentation and Activity page.
8. R2 logo/attachments after configuration is supplied.
9. Security hardening, concurrency tests, migration rehearsal, and deployment.

## Verification Commands

### Targeted, per phase

```bash
npm run test
npx tsc --noEmit
```

Add focused tests for each phase, including:

- Authorization and cross-project isolation
- Invitation expiration/revocation/replay/concurrent claim
- Ledger posting and rollback
- Insufficient funds and negative-balance override
- Concurrent balance updates
- Transfer atomicity
- Realization/payment/receipt/correction/cancellation invariants
- Attachment authorization and validation

### Database migration verification

Run only against a disposable development/test database first:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

Required before production migration:

- Review generated SQL.
- Verify backup/recovery path.
- Run migration against a disposable Neon branch.
- Run seed and full test suite against that branch.
- Document rollback or forward-fix plan.

### Full verification

```bash
npm run check
npm run build
npm audit --audit-level=high
```

Before deployment, also perform:

- Google OAuth callback smoke test
- New-user onboarding smoke test
- Invitation claim/replay smoke test
- Cross-project access attempt
- Account balance reconciliation
- Archived-project write rejection
- R2 upload/download/delete smoke test when configured

## Expected Final Report

- Summary by implementation phase
- Changed files via `git diff --stat` when repository metadata is available
- Schema/migration summary
- Every verification command and pass/fail result
- Security and tenant-isolation assessment
- Ledger reconciliation result
- Deployment/environment variables required, by key name only
- Diff risk assessment: expected high until all phases and migration rehearsal pass
- Deferred work and known issues
- Memory/Graphiti updates made
