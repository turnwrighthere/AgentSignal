# AgentSignal

AgentSignal is a privacy-conscious WebMCP prototype for turning an AI-assisted visitor’s missing, unclear, incomplete, outdated, or broken website experience into an owner-actionable report. Every report is shown to the visitor before submission.

## Managed demo

The default project path is the existing ChatGPT Sites + D1 demo. Run `npm install`, then `npm run dev`. Generate D1 migrations after schema changes with `npm run db:generate`.

## Optional self-hosting

Self-hosting is for an organization that wants to keep its own dashboard and reports on its own server. It is optional: it does not replace, move, or change the managed demo.

The supported first release is one organization, one owner account, and one website domain.

1. Install Docker and Docker Compose on a small server.
2. Copy `.env.example` to `.env` and replace every `replace-with...` value. Set `SITE_ORIGIN` to the one website that will embed AgentSignal.
3. Start it with `docker compose up -d --build`. For a public domain and automatic HTTPS, set `DOMAIN` and use `docker compose --profile https up -d --build` instead.
4. Visit the installation URL and create the owner account using the setup token from `.env`.
5. Sign in, then add this snippet to the configured website (using the actual installation URL and `SITE_ID`):

```html
<script src="https://signal.example.com/agentsignal.js"></script>
<script>
  AgentSignal.init({
    apiOrigin: 'https://signal.example.com',
    siteId: 'my-site'
  });
</script>
```

Use HTTPS in production. The optional Compose HTTPS profile uses [selfhost/Caddyfile](selfhost/Caddyfile) and Caddy to obtain a certificate for `DOMAIN`. To update, pull the new source and rerun the same Compose command. To back up reports, run `docker compose exec db pg_dump -U agentsignal agentsignal > agentsignal-backup.sql`; restore with `psql` into a clean AgentSignal database.

The public `siteId` is an identifier, not a secret. Self-hosted submissions are restricted to the configured website origin, the narrow report schema, and a basic per-process rate limit; add a proxy-level limit if you run more than one app container. Dashboard access is protected by the owner session. Email digests remain “Coming soon” and require separate mail-provider and scheduling work.

Reports contain only issue type, generalized need, same-site path, observation, and impact. The client and API reject extra fields, query strings, fragments, HTML, oversized content, and common personal-information patterns. AgentSignal does not store visitor identifiers, prompts, transcripts, referrers, or profiles.

MIT License.
