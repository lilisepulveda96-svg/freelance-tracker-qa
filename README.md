# Freelance Tracker — QA Automation Suite

End-to-end, API, and load testing suite for [Freelance Tracker](#), a SPA built with React Admin + Node/Express + Supabase that lets freelancers manage clients, projects, and tracked time.

This repository is **independent from the application's source code**. It tests the app from the outside — the same way a QA engineer joining an existing project would, without access to modify the frontend or backend.

---

## Why this repository exists

Most portfolio testing projects assume a clean, `data-testid`-ready application and a perfectly isolated test environment. This one doesn't. The goal here is to show realistic QA engineering: working with the selectors an app actually exposes, designing around infrastructure constraints that already exist, and documenting the tradeoffs along the way — not just producing a list of green checkmarks.

---

## Stack

| Layer                | Tool                                                      |
| -------------------- | --------------------------------------------------------- |
| E2E testing          | [Cypress](https://www.cypress.io/) (JavaScript)           |
| Design pattern       | Page Object Model (POM)                                   |
| API contract testing | Postman + [Newman](https://github.com/postmanlabs/newman) |
| Load testing         | [Apache JMeter](https://jmeter.apache.org/)               |
| CI/CD                | GitHub Actions                                            |

---

## Environments

Three environments are involved. Local and Staging intentionally share one Supabase database — there's no value in provisioning a third isolated database just for local development. Production has its own dedicated, fully isolated database.

| Environment                                | Database            |
| ------------------------------------------ | ------------------- |
| Local                                      | Shared with Staging |
| **Staging** ← all automated tests run here | Shared with Local   |
| Production                                 | Fully isolated      |

All E2E and load tests run against **Staging**, using a dedicated test account. API contract tests run a full suite against Staging and a lightweight, read-only smoke check against Production.

---

## Project structure

```
cypress/
  e2e/                  # Spec files — one per feature area
  pages/                # Page Objects — selectors and actions, one per screen
  fixtures/             # Test data and expected UI messages
  screenshots/           # Auto-generated on test failure
  support/
    commands.js         # Custom commands (API login, shared assertions, etc.)
    e2e.js               # Global config
```

> Postman collections and the JMeter load test plan will live under `tests/`
> once that part of the suite is added — not included yet. CI/CD workflow
> definitions will live under `.github/workflows/` once added.

### Page Object Model

Every screen has a corresponding class in `cypress/pages/`. Selectors are private to that class; spec files never touch a selector directly — they only call methods on a Page Object:

```js
// cypress/pages/LoginPage.js
class LoginPage {
  #emailInput = 'input[name="username"]';

  login(email, password) {
    cy.get(this.#emailInput).type(email);
    // ...
    return this;
  }
}

export default new LoginPage();
```

```js
// cypress/e2e/auth.cy.js
import LoginPage from "../pages/LoginPage";

it("logs in with valid credentials", () => {
  LoginPage.login(email, password);
  LoginPage.assertLoggedIn();
});
```

If a selector changes, only the Page Object file changes — no spec is touched.

---

## Selector strategy

The application doesn't use `data-testid` attributes, and modifying the app's source is outside this repository's scope. Selectors follow a strict order of preference:

1. **Semantic form attributes** generated natively by React Admin (`input[name="email"]`, `button[type="submit"]`)
2. **ARIA attributes** (`aria-label`, `role`) where present
3. **Stable framework CSS classes** (e.g. Material UI's `.MuiSelect-select`) only when nothing more semantic exists
4. **Visible text** via `cy.contains()` as a last resort — used, for example, for the time tracker's Start/Pause/Resume/Stop buttons, which all share an identical `type="button"` attribute with no other way to tell them apart

Full selector audit available in [`SELECTOR_STRATEGY.md`](./SELECTOR_STRATEGY.md).

---

## Notable engineering decisions

A few things worth highlighting beyond the test code itself:

- **React Admin's optimistic UI**: create/edit/delete actions update the table immediately, but the real network request is delayed until an "undo" notification disappears. Every test that triggers one of these actions waits for the notification to _appear_ and then _disappear_ before asserting on the network call — asserting only "not visible" without first confirming it appeared caused intermittent false passes.
- **A real environment quirk, not an app bug**: Vercel's preview-branch live feedback widget renders with an extremely high `z-index` and occasionally overlaps row action buttons, causing flaky `cy.click()` failures unrelated to the application itself. Documented and fixed by hiding the widget before interacting with affected elements — rather than masking it with `{ force: true }`, which would also hide a genuine future blocking issue.
- **Authenticating without the UI**: a custom `cy.loginViaApi()` command authenticates directly against Supabase's REST endpoint and writes the session into `localStorage` in the exact shape and key (`sb-<project-ref>-auth-token`) that `supabase-js` expects — reverse-engineered by comparing against a real browser session, since an incomplete shape causes the app to silently reject every authenticated request.
- **JMeter thresholds are calibrated, not assumed**: rather than picking generic performance targets up front, an initial exploratory run establishes a real response-time baseline for this specific backend, and thresholds are set from that baseline.

---

## Running the tests locally

```bash
npm install

# E2E (interactive)
npm run cy:open

# E2E (headless)
npm run cy:run

# API contract tests
npm run postman:staging
```

Required environment variables (`.env`, not committed):

```
CYPRESS_TEST_USER_EMAIL=qa.tester@example.com
CYPRESS_TEST_USER_PASSWORD=YOUR_TEST_USER_PASSWORD
CYPRESS_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
CYPRESS_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
CYPRESS_API_URL=https://YOUR_BACKEND_URL
```

---

## CI/CD

Tests run automatically on every push to a branch other than `main`, and on pull requests targeting `main`. The pipeline runs E2E and API contract tests against Staging; load testing is run on demand, not automatically, since it doesn't make sense to run load scenarios on every commit.

---

## Documentation

- [`SELECTOR_STRATEGY.md`](./SELECTOR_STRATEGY.md) — full selector audit, screen by screen
- [`TEST_STRATEGY.md`](./TEST_STRATEGY.md) — scope, environments, risk analysis, and quality thresholds
