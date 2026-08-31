# AgentSignal — Challenge Prototype Plan

## 1. Product definition

AgentSignal is a drop-in WebMCP feedback service that lets an AI agent report information it could not find, content that was unclear, incomplete, or outdated, and technical problems it encountered while helping a visitor. The visitor reviews and approves the exact report before it is sent. Website owners receive the reports in a calm, business-friendly dashboard that helps them decide what to improve.

### Product promise

> Turn failed AI-assisted visits into clear, privacy-conscious website improvements.

### Primary audience

Business owners and website managers who care about customer needs but do not want to understand WebMCP, LLM telemetry, schemas, or developer tooling.

### Challenge story

1. A visitor asks an agent a question about a fictional event venue.
2. The agent searches the venue site but finds information that is missing, unclear, incomplete, outdated, or technically inaccessible.
3. The agent discovers AgentSignal's WebMCP tool and prepares a generalized report.
4. The visitor sees the exact report and approves it.
5. The venue owner sees the report appear in the AgentSignal dashboard and understands what to improve.

## 2. Scope

### Required prototype

- One polished fictional event-venue website.
- One AgentSignal owner dashboard.
- One reusable drop-in script that registers the WebMCP tool.
- One persistent report API and database.
- One user-review experience before transmission.
- One developer-facing integration page showing how the script works.
- Seeded reports plus live reports created during the demo.
- A public ChatGPT Sites deployment.
- A public MIT-licensed source repository with setup instructions.
- Submission description, test checklist, and a narrated video script under three minutes.

### Deliberately out of scope

- Billing or subscriptions.
- Production-grade multi-tenant accounts.
- Email notifications.
- Paid AI moderation or semantic clustering.
- Verified agent identity.
- Capturing successful visits by default.
- Original prompts, transcripts, visitor profiles, or cross-site context.
- A custom domain.

## 3. Core experiences

### A. Venue visitor experience

The demo venue should feel like a real business rather than a test harness. It will include plausible information about spaces, pricing, accessibility, catering, parking, and booking. At least three intentional gaps will support repeatable demonstrations:

- Missing: whether the stage itself is wheelchair accessible.
- Unclear: whether outside catering is allowed.
- Technical: a deliberately simulated booking-link failure that does not break the rest of the site.

The site remains fully useful to human visitors. AgentSignal supplements it rather than replacing its interface.

### B. Agent reporting experience

The page registers one imperative WebMCP tool:

`agentsignal_report_site_issue`

It is intended only when the agent encounters one of these issue types:

- `missing_information`
- `unclear_information`
- `incomplete_information`
- `outdated_information`
- `technical_problem`

The agent prepares a generalized report, but no network request occurs immediately. Calling the tool opens an on-page review panel containing the exact information proposed for submission. The user can approve or cancel. Approval submits; cancellation stores nothing.

### C. Owner dashboard

The dashboard leads with business questions rather than technical metrics:

- What are visitors unable to find?
- Where are they getting stuck?
- Which issues occur most often?
- Which issues appear most important?
- What has been addressed?

The first viewport shows a concise summary, issue-type distribution, most affected pages, and the newest reports. Owners can filter by issue type and status and mark a report `new`, `reviewing`, or `resolved`.

### D. Integration explanation

A `/learn` page explains AgentSignal without assuming technical expertise, then provides a copyable one-line installation example for developers. It also displays the registered tool's name, purpose, accepted fields, privacy rules, and a sample report.

## 4. Report contract

The report accepts only the minimum information needed to improve a site:

```ts
type SiteIssueReport = {
  issueType:
    | "missing_information"
    | "unclear_information"
    | "incomplete_information"
    | "outdated_information"
    | "technical_problem";
  generalizedNeed: string; // maximum 140 characters
  pagePath: string;        // same-site path only; query and fragment removed
  observation: string;     // maximum 240 characters
  impact: "blocked" | "reduced_confidence" | "extra_effort";
};
```

Example:

```json
{
  "issueType": "missing_information",
  "generalizedNeed": "Determine whether the venue stage is wheelchair accessible",
  "pagePath": "/accessibility",
  "observation": "The page describes accessible entrances and restrooms but not stage access.",
  "impact": "blocked"
}
```

The schema will reject additional fields. It will not include agent name, visitor identity, session ID, referrer, original prompt, conversation excerpt, or information learned from another site.

## 5. Privacy boundary: no personal information

### Policy

AgentSignal does not request, accept, or store personal information. Reports must describe a website-content problem in generalized terms, not describe the visitor.

### Enforcement layers

1. **Purpose-limited schema:** Only issue type, generalized need, same-site page path, observation, and impact are accepted.
2. **Tool instructions:** The tool description explicitly forbids names, contact details, account information, precise locations, health or financial information, original prompts, conversation text, cross-site context, and unique personal circumstances.
3. **Local minimization:** Query strings and URL fragments are removed. Unknown fields are discarded before a report reaches the review step.
4. **Local privacy screening:** Before the report can be shown for approval, deterministic checks block common personal-information patterns, including email addresses, phone numbers, postal addresses, account identifiers, and text that appears to contain names or sensitive first-person details.
5. **Exact user review:** The user sees every field and must deliberately approve submission. The review explains that the report goes to the website owner and must concern the website, not the visitor.
6. **Server validation:** The API repeats schema, length, origin, path, and privacy-pattern validation. A failed report is rejected in full rather than partially saved.
7. **Storage minimization:** The database stores only the accepted report, its lifecycle status, a coarse creation date, and a generated report ID.
8. **No visitor identifiers:** Application code does not persist IP addresses, cookies, user-agent strings, referrers, fingerprints, authentication identifiers, or precise timestamps with reports.
9. **Safe dashboard display:** Report text is rendered as untrusted plain text and never interpreted as HTML or agent instructions.
10. **Deletion:** The demo owner can delete reports, and seeded reports are visibly labeled as examples.

### Honest limitation

Deterministic validation can strongly prevent common personal-information patterns, but no free-text system can prove that a short sentence is never identifying in context. The prototype will therefore describe itself as designed to prevent personal-information submission, not claim an infallible anonymity guarantee. The combination of a narrowly scoped schema, agent instruction, exact user review, client screening, and server rejection is the strongest no-cost approach appropriate for the challenge.

## 6. Information architecture

- `/` — AgentSignal product introduction and entry into the live demonstration.
- `/venue` — Fictional event-venue website with the embedded integration.
- `/venue/accessibility`, `/venue/events`, `/venue/contact` — Realistic supporting content where the demo questions can be investigated.
- `/review` or an in-page modal/drawer — Exact report review and approval experience. Prefer an in-page drawer so context remains visible.
- `/dashboard` — Business-facing feedback dashboard.
- `/learn` — Installation, WebMCP explanation, privacy model, and sample payload.
- `/privacy` — Concise privacy commitment in plain language.

## 7. Visual and content direction

### AgentSignal

- Serious, composed, and credible, with a small amount of warmth.
- Business language instead of developer language.
- Restrained neutral palette with one confident signal color.
- Dense enough to feel useful, but not like an enterprise administration console.
- Clear issue labels, plain-language summaries, and restrained charts.
- Avoid playful robot imagery, neon AI aesthetics, excessive gradients, and chat bubbles as the primary metaphor.

### Venue

- Visually distinct from AgentSignal so the drop-in nature is obvious.
- Warm hospitality photography and editorial typography.
- Realistic content and navigation.
- AgentSignal branding remains subtle until a report is prepared.

## 8. Technical architecture

### Platform

Use a ChatGPT Sites project created with the standard interface components and D1 capability. The application will use the Sites-compatible React/TypeScript stack and Cloudflare Worker-compatible server output required by the platform.

### Persistence

D1 is the source of truth. Browser storage may hold only a temporary, unsent review draft and must be cleared after approval, cancellation, or navigation.

### Database

One `reports` table is sufficient:

- `id`: generated opaque identifier.
- `issue_type`: constrained issue category.
- `generalized_need`: short validated text.
- `page_path`: normalized same-site path.
- `observation`: short validated text.
- `impact`: constrained impact category.
- `status`: `new`, `reviewing`, or `resolved`.
- `created_day`: coarse UTC calendar date, not a precise visit timestamp.
- `is_seeded`: distinguishes demonstration examples from live submissions.

Indexes should support dashboard filters on `issue_type`, `status`, and `created_day`. Schema changes will be represented by inspected migrations committed with the project.

### API

- `POST /api/reports` validates and creates a report.
- `GET /api/reports` returns dashboard-safe reports and summary counts.
- `PATCH /api/reports/:id` changes lifecycle status.
- `DELETE /api/reports/:id` deletes a report.

For the challenge prototype, mutation controls on dashboard-only actions can use a deployment secret or a clearly labeled demo mode rather than a full account system. Public report creation receives strict origin checks, payload limits, rate limiting where supported, and generic error responses.

### Drop-in script

`/agentsignal.js` will:

- Feature-detect `document.modelContext`.
- Register the tool exactly once.
- Normalize and locally screen proposed input.
- Open the site's AgentSignal review UI.
- Submit only after explicit approval.
- Fail silently without disrupting the host website if WebMCP is unavailable.
- Expose a small initialization surface for a site key and API origin, while the demo uses same-origin defaults.

The project should keep all draft-WebMCP-specific calls behind a small adapter so API changes do not spread throughout the application.

## 9. Implementation sequence

### Milestone 1 — Recognizable product slice

- Initialize the Sites project with interface components and D1 support.
- Establish AgentSignal's theme, typography, metadata, and navigation.
- Build the dashboard's first viewport using representative seeded data.
- Start the local site and hand off the first meaningful preview.

**Acceptance:** A nontechnical business owner can identify what AgentSignal does and see actionable example feedback without explanation.

### Milestone 2 — Venue and WebMCP flow

- Build the venue pages and intentional information gaps.
- Implement the WebMCP adapter and registered tool.
- Implement the exact report-review drawer with approve and cancel paths.
- Add no-WebMCP fallback messaging for the `/learn` demonstration.

**Acceptance:** An agent can discover the tool, propose a valid report, and trigger a visible review without transmitting data.

### Milestone 3 — Privacy and persistence

- Define the shared report schema and privacy validator.
- Add D1 schema, migrations, prepared queries, and indexes.
- Implement report creation, reading, status updates, and deletion.
- Apply local and server privacy validation and safe text rendering.

**Acceptance:** Approved valid reports persist; cancelled, malformed, overlong, additional-field, cross-origin, and personal-information-like reports do not persist.

### Milestone 4 — Complete business experience

- Connect the dashboard to live data.
- Add useful filters, summaries, statuses, empty states, errors, and seeded/live labeling.
- Complete `/learn` and `/privacy`.
- Ensure responsive keyboard, touch, and screen-reader behavior.

**Acceptance:** The end-to-end visitor-to-owner story works coherently on desktop and mobile-sized layouts.

### Milestone 5 — Validation and publishing

- Run type checking and production build.
- Run validator unit tests and API integration tests.
- Test the complete WebMCP flow in ChatGPT's in-app browser.
- Verify the deployed database migration and live write/read cycle.
- Publish the validated version through ChatGPT Sites.
- Confirm the public URL, core routes, tool discovery, report approval, persistence, and dashboard rendering.

**Acceptance:** Judges can use the deployed site without local setup and reproduce the core story.

### Milestone 6 — Challenge submission

- Finalize repository README, architecture explanation, privacy model, local setup, and license.
- Write submission copy around WebMCP leverage, user experience, impact, and differentiation from a public guestbook.
- Record a narrated video under three minutes.
- Submit the live URL, public repository, description, and video.

## 10. Validation plan

### Privacy tests

Verify rejection of:

- Email addresses and phone numbers.
- Full names or first-person identifying statements.
- Street addresses and precise locations.
- Account, reservation, ticket, or order identifiers.
- Health, financial, or other sensitive personal circumstances.
- Original-prompt or transcript-like text.
- URLs containing query strings or fragments.
- Extra JSON properties, oversized text, HTML, scripts, and instruction-like payloads.

Verify acceptance of generalized examples such as:

- “Determine whether the venue stage is wheelchair accessible.”
- “Clarify whether outside catering is permitted.”
- “The booking button returned an error.”

### Functional tests

- Tool is registered once and only when WebMCP is available.
- Tool call opens review without sending a request.
- Cancel creates no database record.
- Approval creates exactly one record.
- Dashboard shows a new record and updates filters and counts.
- Status changes and deletion persist.
- Invalid API requests return safe errors and create no records.
- The venue remains usable when the integration fails or WebMCP is unavailable.

### Experience tests

- The user understands who will receive the report before approval.
- The owner dashboard explains visitor needs without technical vocabulary.
- Seeded versus live reports cannot be confused.
- Keyboard focus moves into and out of the review drawer correctly.
- Mobile layouts preserve the review and dashboard flows.

### Acceptance boundary

A successful build and automated tests prove deterministic behavior only. Final acceptance additionally requires a real deployed WebMCP interaction in the ChatGPT browser and confirmation that the resulting report appears in the dashboard.

## 11. Demonstration script outline

Target length: approximately 2 minutes 30 seconds.

1. **Problem (20 seconds):** Traditional analytics show visits, not what an AI-assisted visitor failed to find.
2. **Installability (15 seconds):** Show the one-line AgentSignal integration and registered tool.
3. **Visitor and agent (55 seconds):** Ask about wheelchair access to the venue stage; let the agent investigate and recognize the missing information.
4. **Privacy review (30 seconds):** Show the generalized report, the no-personal-information rule, and explicit user approval.
5. **Owner value (40 seconds):** Open the dashboard, show the live report, related issues, affected page, impact, and resolution workflow.
6. **Close (10 seconds):** “AgentSignal turns failed AI visits into website improvements—without collecting personal information.”

## 12. Definition of done

The prototype is complete when:

- The public site presents a credible event venue and business dashboard.
- A real WebMCP-capable agent can discover and invoke the reporting tool.
- No report is transmitted before the user sees and approves its exact contents.
- Personal-information-like, malformed, and excessive payloads are rejected before storage.
- Approved generalized reports persist and appear in the dashboard.
- The site works without paid services or paid model APIs.
- The repository is public, documented, licensed, and runnable.
- The live URL and under-three-minute demo video satisfy the challenge submission requirements.

