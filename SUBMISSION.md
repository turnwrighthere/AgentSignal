# AgentSignal challenge submission

## Description

AgentSignal turns failed AI-assisted website visits into clear, privacy-conscious improvements. A WebMCP-capable agent discovers `agentsignal_report_site_issue`, prepares only a short generalized same-site report, and opens an exact visitor review before any network request. The owner dashboard turns approved signals into a simple improvement queue.

## WebMCP leverage

The integration is a small script and one browser-context tool. The host site remains useful without it. WebMCP is used only to surface a deliberate, consented feedback action at the moment an agent encounters missing, unclear, incomplete, outdated, or technically inaccessible website information.

## Test checklist

- [x] Production build completes.
- [x] D1 migration creates reports and query indexes.
- [x] Extra fields, query strings, fragments, oversized text, HTML, email-like text, phone-like text, addresses, account-like identifiers, and prompt/transcript language are rejected by the shared validator.
- [x] The report drawer presents every field before approval; cancel does not create a client record.
- [x] Approved reports are posted to the reports API and appear in the dashboard.
- [x] Dashboard demonstrates issue/status filtering, lifecycle controls, deletion, empty handling, and seeded/live labeling.
- [x] Public deployment responds successfully.
- [ ] Final browser acceptance: invoke the registered tool in a WebMCP-capable ChatGPT browser, approve the live report, and confirm the persisted result in the deployed dashboard.

## Narration (about 2:30)

**0:00–0:20 — Problem.** Traditional analytics show that an AI-assisted visitor arrived, but not what they could not find. AgentSignal turns those missed moments into useful website improvements.

**0:20–0:35 — Install.** The integration is one small script. It registers a single WebMCP tool, `agentsignal_report_site_issue`, and only for a narrow set of website problems.

**0:35–1:25 — Visitor flow.** On the Aster Hall demo, ask whether the venue stage is wheelchair accessible. The agent can investigate the accessibility page, discover that stage access is not stated, and prepare a generalized report. Crucially, it opens this review instead of sending data: the visitor sees every field, who will receive it, and the rule that this is about the website—not the person or conversation.

**1:25–1:55 — Privacy.** AgentSignal accepts only the issue type, a generalized need, a same-site path, an observation, and impact. It refuses names, prompts, transcripts, account details, query strings, and common personal-information patterns before and after approval.

**1:55–2:25 — Owner value.** On the dashboard, the new report joins related examples. The owner can see that accessibility is building attention, understand that this need blocked a visitor, and move the report through reviewing and resolved as they improve the page.

**2:25–2:35 — Close.** AgentSignal turns failed AI-assisted visits into website improvements—without collecting visitor profiles.
