# AgentSignal

AgentSignal is a privacy-conscious WebMCP prototype for turning an AI-assisted visitor’s missing, unclear, incomplete, outdated, or broken website experience into an owner-actionable report. Every report is shown to the visitor before submission.

Run `npm install`, then `npm run dev`. Generate D1 migrations after schema changes with `npm run db:generate`.

Reports contain only issue type, generalized need, same-site path, observation, and impact. The client and API reject extra fields, query strings, fragments, HTML, oversized content, and common personal-information patterns. AgentSignal does not store visitor identifiers, prompts, transcripts, referrers, or profiles.

MIT License.
