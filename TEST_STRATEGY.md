# TEST_STRATEGY.md — Freelance Tracker QA MVP

**Version:** 1.0
**Author:** QA Engineer
**Date:** June 2025
**Status:** Active

---

## 1. Introduction and objectives

This document defines the complete testing strategy for **Freelance Tracker**, a SPA that allows freelancers to manage clients, projects, and track worked time.

The goal of this QA MVP is to demonstrate a professional testing strategy applying the **test pyramid**, automation best practices, and a functional CI/CD pipeline — executed from an independent QA repository that does not depend on the application source code.

### Specific objectives

- Verify that critical business flows work correctly across available environments
- Verify that the app correctly handles authentication failure states (invalid credentials, unauthorized access)
- Establish a maintainable and extensible test base using the Page Object Model (POM) pattern
- Measure API performance under concurrent load with a calibrated baseline
- Automate test execution on every push via GitHub Actions

---

## 2. Environments

**Three environments exist. Local and Staging intentionally share one database; Production is fully isolated:**

| Environment    | Frontend URL                                                                       | Backend               | Database                                          |
| -------------- | ---------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------- |
| **Local**      | http://localhost:5173                                                              | http://localhost:3000 | Supabase (shared with Staging)                    |
| **Staging**    | https://freelance-tracker-mvp-git-develop-lilibeth-sepulveda-s-projects.vercel.app | Railway (staging env) | Supabase (shared with Local)                      |
| **Production** | https://freelance-tracker-mvp.vercel.app                                           | Railway (prod env)    | Supabase (dedicated prod project, fully isolated) |

> **Note on Local + Staging sharing a database:** this is a deliberate, reasonable setup for an MVP — there's no value in provisioning a third isolated database just for local development. Both environments point to the same Supabase project, which is **separate from Production**. This means automated tests against Staging never put real user data at risk.

### Environment rules

- **All automated E2E tests run against Staging**, using a dedicated test account pre-loaded with sample data
- Tests are non-destructive on the shared baseline: any record created by a test (customer, project, time log) is deleted by the same test at the end of its run, since a developer may be working locally against the same database at any time
- **No automated test ever deletes or modifies the pre-loaded sample data** belonging to the test account unless that record was created by the test itself
- JMeter load tests run against Staging only — never against Production
- Postman runs full contract tests against Staging and lightweight read-only smoke tests against Production
- Sensitive variables (URLs, credentials) live in `.env` locally and in GitHub Secrets in CI/CD

### Dedicated Test Account Baseline

| Field               | Value                                            | Purpose                         |
| ------------------- | ------------------------------------------------ | ------------------------------- |
| **Email**           | `qa.tester@freelancetracker.com`                 | Primary test account session    |
| **Password**        | _Managed via System Environment/Secrets_         | Secure authentication key       |
| **Pre-loaded Data** | Sample clients, projects, and historic time logs | Used as immutable baseline data |

---

## 3. Scope

### In scope

| Module       | Functionality                                                           | Test type                                  |
| ------------ | ----------------------------------------------------------------------- | ------------------------------------------ |
| Auth         | Login (valid/invalid credentials), logout, route protection             | E2E                                        |
| Auth         | Handling of unauthorized API responses (401)                            | E2E (simulated via `cy.intercept()`)       |
| Customers    | Create, read, update, delete                                            | E2E                                        |
| Projects     | Create, read, update, delete, customer association via `ReferenceInput` | E2E                                        |
| Time Tracker | Stopwatch (start/pause/resume/stop), localStorage persistence           | E2E                                        |
| Time Tracker | Time log appears in the time logs list after stopping                   | E2E (verified via UI, not direct DB query) |
| Dashboard    | KPIs render with numeric values, chart renders                          | E2E                                        |
| Performance  | API response time under concurrent load                                 | JMeter                                     |
| API Contract | Status codes, response schema, headers per endpoint                     | Postman                                    |

### Out of scope (explicitly)

- **Filters on list views** — the current MVP does not implement filters in the `<Datagrid>` components. Not testable; removed from scope rather than left ambiguous.
- **Token expiration (real)** — verifying actual JWT expiry requires either waiting out the token's real lifetime (impractical in CI) or crafting an expired token manually, which requires backend access. This belongs to **integration testing in the app repo**, not E2E in this QA repo. What _is_ tested here is the app's behavior when the API returns a 401 (see Auth scope above).
- Accessibility testing (WCAG)
- Cross-browser compatibility — Chrome only in this iteration
- Internationalization (i18n)
- Mobile/responsive testing
- Offensive security / pentesting
- Direct database verification (RLS, data integrity at the DB level) — belongs to integration tests with direct Supabase access, not this E2E suite

---

## 4. Test pyramid applied to this project

```
         [ JMeter ]            ← load scenarios — slow, run on demand
        [ Postman ]            ← API contract requests
      [ Cypress E2E ]          ← critical user flow tests (this repo)
  [ Unit + Integration ]       ← future: Vitest + Supertest, app repo, includes real token expiry
```

### Distribution rationale

**E2E Cypress — top priority for QA portfolio:**
Covers the critical flows a real user would execute: login, create a client, associate a project, track time, view the dashboard. Runs against Staging with a dedicated test account, fully non-destructive on the shared Local/Staging data.

**Postman — API contract:**
Documents the expected behavior of each endpoint with its headers, body, and responses. Full contract verification against Staging; lightweight read-only smoke tests against Production.

**JMeter — load testing:**
Runs on demand against Staging only. Goal: establish a real baseline first, then define thresholds from that baseline rather than from generic assumptions.

**Unit + Integration — future, app repo:**
Vitest (hook logic, utilities) and Supertest (Express endpoints, real JWT expiry handling, Supabase RLS verification at the data level) will be added to the main `freelance-tracker` repo. This is where real token expiration and RLS data-isolation tests belong, since they require access to the backend code and database directly.

---

## 5. Test types and tools

### 5.1 End-to-End Testing (Cypress)

- **Tooling Platform:** Cypress 13+ (JavaScript runtime).
- **Architectural Pattern:** Strict Page Object Model (POM) encapsulation.
- **Session Optimization:** Utilizing `cy.session()` for state caching across specs that do not explicitly target authentication, removing redundant UI login interactions.

#### Non-Negotiable Selector Strategy

Since modifying the application source to inject custom data-attributes is out of scope, the repository enforces a strict hierarchy of preference to locate dynamic nodes:

1. **Semantic React Admin Form Attributes:** Properties auto-generated from the model's `source` element (e.g., `input[name="username"]`, `input[name="password"]`, `button[type="submit"]`).
2. **Accessible ARIA Attributes:** Global semantic nodes like `[aria-label="..."]`.
3. **Stable Component Classes:** Reliable framework layouts (e.g., `.RaLoginForm-input`) utilized only when semantic tags are completely absent.
4. **Text-Based Querying:** Targeted use of `cy.contains()` on visible interactive fields as a final fallback layer.

### 5.2 API Contract — Postman + Newman

**Tool:** Postman (collections exported as JSON) + Newman (CLI)
**What is tested:** Contract of each endpoint — status codes, response schemas, headers
**Environments:** `env.staging.json` (full contract tests) and `env.production.json` (read-only smoke tests); any create/update/delete request against Staging cleans up after itself
**Command:** `npm run postman:staging`
**Integrated in CI:** Yes — runs after E2E in the pipeline

### 5.3 Load tests — JMeter

**Tool:** Apache JMeter
**When it runs:** On demand — not on every push, and only during agreed low-traffic windows
**What is tested:** API behavior under concurrent load
**Target:** Staging backend (Railway) — never Production
**Report:** HTML generated in `tests/jmeter/reports/`

**Methodology:** Thresholds below are **provisional** until a real baseline is captured. The first JMeter run (QA-401) measures actual response times under light load; thresholds are then recalibrated from that baseline rather than assumed in advance. This reflects how performance testing actually works — you measure first, then set realistic targets, not the other way around.

---

## 6. Quality thresholds

### E2E

- All critical flow tests must pass at 100% before merging to `main`
- Zero arbitrary `cy.wait(ms)` — use `cy.clock()`, `cy.intercept()`, or state-based assertions
- Maximum suite time: 5 minutes in CI

### Performance (JMeter against Staging)

| Scenario    | Users         | Duration | p95 threshold                         | Error rate threshold |
| ----------- | ------------- | -------- | ------------------------------------- | -------------------- |
| Normal load | 10            | 60s      | **TBD — set from baseline in QA-401** | **TBD**              |
| Peak load   | 50 (30s ramp) | 60s      | **TBD — set from baseline in QA-401** | **TBD**              |

> These values are intentionally left undefined here. They will be filled in after the first exploratory JMeter run establishes real response-time data for this specific backend (Railway, current plan tier). Setting numeric targets before measuring would be guessing, not testing.

---

## 7. Test data management

### Principles

1. The test account is pre-loaded with sample data (clients, projects, time logs) used as a stable baseline
2. **Every test that creates a record must delete it before the test or describe block ends** — this is non-negotiable since Staging shares its database with Local, where a developer may be working at any time
3. Never hardcode Supabase UUIDs — query or capture them dynamically at runtime
4. Tests must be safe to run repeatedly without manual cleanup between runs

---

## 8. Entry and exit criteria

### Entry criteria

- [ ] Staging environment is accessible and returns 200 on the login page
- [ ] Test account can log in successfully
- [ ] Pre-loaded sample data is present and unmodified
- [ ] Working branch is different from `main`

### Exit criteria (per ticket)

- [ ] All cases in the ticket pass in headless `cy:run`
- [ ] No arbitrary `cy.wait(ms)` in any E2E test
- [ ] Tests are independent — pass in any execution order
- [ ] Any data created during the test is removed by the end of the test
- [ ] Test code follows the naming conventions in Section 9
- [ ] Ticket passes in the CI/CD pipeline

### Definition of "blocking bug"

A bug is blocking if it affects authentication or the creation/saving of time logs. Any other bug is medium or low priority.

---

## 9. Project structure and naming conventions (POM)

### Folder structure

```
cypress/
  e2e/
    auth.cy.js              ← SPECS live here — one file per module
    customers.cy.js
    projects.cy.js
    tracker.cy.js
    dashboard.cy.js
  pages/                     ← POM classes — one file per page/module
    LoginPage.js
    CustomersPage.js
    ProjectsPage.js
    TrackerPage.js
    DashboardPage.js
  fixtures/
    users.json
    customers.json
    projects.json
  support/
    commands.js              ← cy.loginViaApi(), cy.logout(), etc.
    e2e.js                    ← global config, imports commands.js
```

### The POM pattern, explained

Each file in `pages/` is a class. It holds **all selectors for that page or module** as private fields, plus methods that perform actions or assertions using those selectors. A spec file never touches a selector directly — it only calls methods on the page object.

```js
// cypress/pages/LoginPage.js  — the POM: selectors + methods live here
class LoginPage {
  #emailInput = 'input[name="username"]';
  #passwordInput = 'input[name="password"]';
  #submitBtn = 'button[type="submit"]';

  visit() {
    cy.visit("/login");
    return this;
  }

  login(email, password) {
    cy.get(this.#emailInput).type(email);
    cy.get(this.#passwordInput).type(password);
    cy.get(this.#submitBtn).click();
    return this;
  }

  assertLoggedIn() {
    cy.url().should("not.include", "/login");
    return this;
  }
}

export default new LoginPage();
```

```js
// cypress/e2e/auth.cy.js  — the SPEC: only calls methods, never selectors
import LoginPage from "../pages/LoginPage";

describe("[e2e] Auth", () => {
  it("logs in with valid credentials", () => {
    LoginPage.visit();
    LoginPage.login("qa.tester@freelancetracker.com", "StagingTest123!");
    LoginPage.assertLoggedIn();
  });
});
```

If a selector changes, only the POM file changes — no spec is touched.

### File naming

```
[module].cy.js           ← spec files in cypress/e2e/
[Module]Page.js          ← POM files in cypress/pages/ (PascalCase)
```

### Test naming (describe + it)

```
describe('[e2e] Module — area')
  it('expected, observable result')

Examples:
describe('[e2e] Auth')
  it('logs in with valid credentials and reaches the dashboard')
  it('shows an error message with an incorrect password')
  it('redirects to login when accessing /customers without a session')

describe('[e2e] Customers')
  it('creates a new customer and shows it in the table')
  it('deletes a customer and removes it from the table')
```

---

## 10. CI/CD Pipeline

- **Automation Trigger:** Pushes to any non-main feature branch, or active Pull Request evaluation gates directed at `main`.
- **Workflow Order:** `e2e-tests` (Cypress) $\rightarrow$ `postman-tests` (Newman Contract verification).
- **Execution Fail-Fast:** Any failure encountered in upstream jobs breaks execution instantly to save runner resources.
- **Artifact Strategy:** Failed Cypress executions upload visual screenshots as GitHub Actions Artifacts. Newman contract logs preserve full HTML execution outputs. All artifacts are restricted to a **7-day retention period** to ensure clean workspace hygiene.

---

## 11. Risks and mitigations

| Risk Identified                                                                                            | Likelihood | Impact | Practical Mitigation Strategy                                                                                                   |
| :--------------------------------------------------------------------------------------------------------- | :--------: | :----: | :------------------------------------------------------------------------------------------------------------------------------ |
| **Data Pollution:** Multi-tenant test writes may damage or modify the shared developer database.           |    High    |  High  | Enforce strict create-and-delete validation cycles inside every writing spec hook.                                              |
| **Flaky Stopwatch Assertions:** Native timer ticking can break E2E assertions in headless cloud execution. |    High    | Medium | Use Cypress control utilities (`cy.clock()` / `cy.tick()`) to completely bypass actual system wait times.                       |
| **Brittle MUI Selectors:** Downstream Material UI layout changes could break brittle class mappings.       |   Medium   | Medium | Prioritize framework-native semantic HTML attributes (`name="username"`, `name="password"`) over visual CSS structural classes. |
| **Changing Preview Domains:** Vercel branch builds continuously assign new unique host URLs.               |    Low     | Medium | Bind environments dynamically using a dedicated branch-pinned URL or inject via configuration variables.                        |

---

## 12. Changelog

| Version | Date      | Change                                                                                                                                                                                              |
| ------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | June 2025 | Local and Staging share one database, Production is fully isolated; all automated tests (E2E, Postman, JMeter) target Staging, with Postman also running read-only smoke checks against Production. |
