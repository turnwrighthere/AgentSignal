# AgentSignal self-hosting plan

## Goal

Offer a private, self-hosted AgentSignal for organizations that want their reports and dashboard on their own infrastructure. The existing ChatGPT Sites + D1 deployment remains the simple managed demo.

The first self-hosted release is intentionally small: **one organization, one owner, one dashboard, and one website domain**. It keeps the existing privacy promise—only generalized, owner-reviewable feedback is stored. No raw conversations, personal data, or email delivery are added.

## What an owner should experience

1. Copy the supplied `.env` example, choose a password and their website domain.
2. Run one Docker Compose command.
3. Open AgentSignal, create the owner account, and copy one embed snippet.
4. Paste that snippet into their website. Reviewed reports then appear in their private dashboard.

Upgrades should be a documented pull-and-restart command. Backups should be a single documented database-dump command. The owner should never need to choose a database, run SQL, or understand Cloudflare D1.

## Product decisions

- Docker Compose is the only supported self-hosted installation path for the first release. It runs AgentSignal and its bundled PostgreSQL database with persistent storage.
- PostgreSQL is an implementation detail. It is included by Compose, so operators do not install or configure it separately.
- The current D1-backed demo stays intact. Internally, its storage code will be separated from the shared product logic so self-hosting can use PostgreSQL without changing the experience.
- First-run setup creates one owner account. There are no default credentials and no email provider requirement.
- One approved website domain is configured during setup. The embed snippet contains the self-hosted API address and a public site identifier; it contains no secret that could be safely copied from a browser page.
- Dashboard access requires the owner to sign in. Public submissions are limited to the configured domain, strict report schema, and rate limits. This prevents the plan from treating a browser-visible “API key” as security.
- Email digest remains visibly “Coming soon,” including in self-hosted installations. It will need separate SMTP/provider and scheduling work later.

## Implementation plan

### 1. Make storage portable without changing the product

- Put report storage behind a small internal interface: create, list, update status, delete, and health-check.
- Keep the existing D1 implementation for the managed demo and add a PostgreSQL implementation for self-hosted mode.
- Keep report validation, privacy filtering, API response shapes, dashboard behavior, and the WebMCP tool shared between both modes.
- Confirm the current app can run in a Node/Docker environment. If Vinext’s current output is not suitable, add only the thin server entry point needed to serve the same routes—do not create a second application.

### 2. Add the minimum self-hosted account model

- Create PostgreSQL migrations for reports plus a tiny installation record: owner account, configured website domain, and public site identifier.
- Add a first-run setup screen protected by an environment-supplied setup secret. The setup flow asks only for an owner email/username, password, and website domain.
- Store passwords securely, use secure session cookies, and require sign-in for the dashboard and report-management APIs.
- Add basic login throttling, CSRF protection for dashboard changes, and a non-sensitive health endpoint.
- Do not build team roles, multiple sites, SSO, or account invitations in this release.

### 3. Keep WebMCP setup copy-and-paste simple

- Update `agentsignal.js` so a host configures just two values: the AgentSignal installation URL and the public site identifier.
- Preserve the current review-and-approve experience. The user sees the generalized report before it is submitted.
- Validate the request body and website origin on the server, then apply rate limits. The dashboard remains inaccessible to that public embed.
- Show the exact snippet and the configured domain in the owner dashboard, with a simple “copy” action and a clear warning if the website domain changes.

### 4. Ship one supported deployment package

- Add a production Dockerfile, `docker-compose.yml`, `.env.example`, and `.dockerignore`.
- Compose starts the app and PostgreSQL, creates a persistent database volume, and applies safe-to-rerun migrations during startup.
- Keep required settings short and plain-language: public URL, website domain, setup secret, and session secret. Provide generation commands for the two secrets.
- Provide one deployment guide for a Docker-capable host behind HTTPS. Include a ready-to-copy Caddy reverse-proxy example rather than asking users to choose between several proxies.
- Provide one upgrade command and one backup/restore recipe. The guide must call out that the owner is responsible for keeping the host, Docker image, and backups current.

### 5. Verify the owner journey

- Start from an empty machine or clean Docker volume and follow the guide exactly.
- Confirm that setup, sign-in, snippet copy, a reviewed WebMCP submission, dashboard status changes, deletion, and an app restart all work without manual database steps.
- Confirm an unauthenticated visitor cannot read or alter reports, and a request from an unconfigured website is rejected.
- Test a backup and restore, then confirm the restored dashboard contains the expected reports.
- Run desktop and mobile browser checks for setup, sign-in, dashboard, and the review flow.

## Deliverables

- One Docker Compose package for an AgentSignal installation.
- First-run owner setup and a private dashboard.
- PostgreSQL storage behind the existing shared report behavior.
- A two-value WebMCP embed snippet and copyable setup instructions.
- A short deployment, upgrade, backup, and restore guide.
- Automated persistence, authorization, and clean-install checks.

## Definition of done

A non-developer who is comfortable following a hosting guide can bring up AgentSignal with Docker, set one domain and one owner password, paste the supplied snippet into their website, and see a reviewed report persist in their dashboard after a restart. The managed demo continues to work unchanged.

## Deferred deliberately

- Multiple organizations, multiple owner accounts, teams, SSO, and billing.
- Email digests, SMTP/provider setup, email verification, and scheduled delivery.
- D1-to-PostgreSQL data migration. A new self-hosted installation starts clean; export/import can be added when customers need it.
- Arbitrary web crawling, cross-installation analytics, or retention of raw agent conversations.
