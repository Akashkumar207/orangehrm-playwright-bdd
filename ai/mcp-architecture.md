# MCP Architecture

## What MCP actually is here

MCP (Model Context Protocol) is a protocol that lets an AI agent host (an
IDE assistant, a chat client) call tools exposed by a separate MCP server —
in this context, a **Playwright MCP server**, which exposes browser actions
(navigate, click, fill, take an accessibility snapshot, screenshot) as
callable tools.

MCP is **not** a library this framework imports, and it is **not** part of
the test execution path. It's a development-time and maintenance-time
channel between an AI agent and a real browser, used for *investigation* —
inspecting the live application, proposing a locator, gathering failure
evidence — never for running the actual test suite. `npx playwright test`
never touches MCP; it uses `@playwright/test` directly, exactly as built in
Phases 3–13.

```
AI Agent (e.g. an assistant in an editor)
      │  calls tools over MCP: navigate(url), snapshot(), click(ref), screenshot()
      ▼
Playwright MCP Server
      │  drives a real browser via the Playwright library
      ▼
Browser
      │
      ▼
OrangeHRM
```

## Where this was already used, honestly

Every locator in this framework (`LoginPage`, `DashboardPage`,
`ForgotPasswordPage`, `PIMPage`, `AddEmployeePage`) was verified against the
**real, running application** before being written into a Page Object —
documented at each phase (e.g. discovering that "Forgot your password?" is
a plain `<p>` with no ARIA role, or that Add Employee's name fields use
`getByPlaceholder` directly rather than a container-filter pattern).

In *this* session, that inspection was done with small Node scripts calling
the Playwright library directly (`chromium.launch()`, `page.goto()`,
`page.getByRole(...).count()`) — not through an MCP server, because no
Playwright MCP server is connected in this environment (checked directly:
no browser-automation MCP tool is available here). Functionally, this is
the same activity an MCP-based workflow performs — navigate, inspect,
propose a locator, verify it actually matches — just invoked directly
instead of through the MCP protocol layer. Where a Playwright MCP server
**is** connected (e.g. Claude Code with `playwright-mcp` configured), the
same investigation happens through its `browser_navigate`, `browser_snapshot`,
`browser_click`, etc. tools instead of ad-hoc scripts — the workflow and its
guardrails, described below, don't change.

## How MCP and `ai/agents/` fit together

`LocatorAnalysisAgent` (Phase 14) takes an `elementDescription` string as
input — in a manual workflow, an engineer pastes that in by hand. In an
MCP-enabled workflow, that string is populated directly from a Playwright
MCP server's `browser_snapshot` (its accessibility-tree output), so the
agent reasons over the same real accessibility data a person would read.
`FailureAnalysisAgent`'s evidence (screenshot, URL, logs) could equally be
gathered by an MCP server driving the browser to reproduce a failure
interactively, rather than only from `ScreenshotUtils`/`Logger` output
already on disk.

MCP is the **delivery mechanism** for real, live evidence into these
agents. It does not change what the agents do with that evidence, and it
does not grant them any new authority — the same human-in-the-loop
workflow from Phase 14 still applies:

```
AI Agent (via MCP: inspects live page, proposes a locator/fix)
      ↓
Recommendation (never applied automatically)
      ↓
QA Engineer reviews
      ↓
Code change → Pull Request → Jenkins → CI
```

## What MCP is explicitly NOT

- **Not self-healing.** An MCP-connected agent can *suggest* that
  `loginButton` should change from `getByRole('button', { name: 'Login' })`
  to something else because the UI changed — it does not rewrite
  `LoginPage.ts` itself. `TestMaintenanceAgent` (Phase 14) is built the
  same way: `changeDetected` + `recommendation`, never a file edit.
- **Not part of CI.** Jenkins (Phase 17) runs `npx playwright test`. It has
  no MCP server, no AI agent, and no network dependency on an LLM. A
  pipeline failing has nothing to do with MCP being unavailable — it's
  purely Playwright against the live app, deterministic and self-contained.
- **Not a replacement for verifying locators before committing them.**
  Every locator in every Page Object in this framework was proven against
  the real app with an actual browser run before being written down. MCP
  (or the ad-hoc scripts used here in its place) is *how* that verification
  happens efficiently — it doesn't change the requirement that it happens
  at all.
