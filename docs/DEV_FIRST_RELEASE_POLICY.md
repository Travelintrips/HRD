# DEV-first release policy — HRD

Every new feature, bugfix, deployment, scheduled job and database migration must go:

`feature/<issue>` → PR to `develop` → CI/test/build → independent DEV deployment → DEV E2E smoke/rollback checks → approved promotion PR to `main` → PROD deploy → PROD smoke.

Mandatory isolation: DEV must have a different Supabase project, credentials, storage, user/test data, payment sandbox, webhooks, WhatsApp devices/numbers and worker identities. Never connect DEV to production DB or destinations. No real payroll, attendance, HR personal data, mass WA messages, payments, accounting postings or migrations in DEV. Test only with synthetic records, mocked notifications, and dry runs.

Fail closed: CI failure, missing DEV endpoint, missing SHA provenance, failed E2E verification, or uncertain DEV/PROD credential separation blocks the PROD promotion. Match deployed DEV git SHA to the commit to be promoted. Review and record all test evidence before non-squash merge into `main`. No direct-to-PROD pushes. Protect `main` with required CI/status checks and approval.

Production: HRD front end. A separate live DEV endpoint must be provisioned and verified before claiming complete operational parity. Branch creation and CI do not themselves create infrastructure.

External Hostinger/Replit/VPS native auto-deploy may bypass GitHub checks: disable production auto-deploy or enforce manual approved releases there. Never assume GitHub workflows alone secure those channels.
