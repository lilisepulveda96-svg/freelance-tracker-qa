# SELECTOR_STRATEGY.md — Freelance Tracker QA Suite

## Why this document exists

The application does not implement `data-testid` attributes, and adding them is out of scope for this repository (no access to the app's source code). This document records which real selectors were found in the DOM and which strategy was chosen for each screen, so that every Page Object in `cypress/pages/` is built on confirmed, inspected selectors — not assumptions.

---

## Selector preference order (from TEST_STRATEGY.md)

1. Semantic form attributes generated automatically by React Admin (`name`, `type`)
2. ARIA attributes (`aria-label`, `role`)
3. Stable MUI / React Admin CSS classes
4. Visible text via `cy.contains()` — last resort

---

## Login screen

**URL inspected:** `https://freelance-tracker-mvp-git-develop-lilibeth-sepulveda-s-projects.vercel.app/#/login`
**Tool used:** SelectorsHub

| Element                         | Selector found           | Type | Notes                                                                   |
| ------------------------------- | ------------------------ | :--: | ----------------------------------------------------------------------- |
| Email input                     | `input[name='username']` |  1   | Native React Admin standard login model mapping attribute.              |
| Password input                  | `input[name='password']` |  1   | Native React Admin secure field attribute mapping.                      |
| Submit button                   | `button[type='submit']`  |  1   | Standard semantic form button; bypasses generic Material UI classes.    |
| Error message (on failed login) | `div[role='alert']`      |  2   | Accessible ARIA element triggered dynamically on bad credentials state. |

---

## Customers — List view

**URL inspected:** `https://freelance-tracker-mvp-git-develop-lilibeth-sepulveda-s-projects.vercel.app/#/customers`
**Tool used:** SelectorsHub

| Element             | Selector found                | Type | Notes                                                                                                               |
| ------------------- | ----------------------------- | :--: | ------------------------------------------------------------------------------------------------------------------- |
| "Create" button     | `a[aria-label='Create']`      |  2   | Accessible routing anchor. Navigates to the creation form.                                                          |
| Table rows          | `table tbody tr`              |  1   | Standard HTML row hierarchy. Used to count items or scope single row instances.                                     |
| Row "Edit" action   | `a[aria-label='Edit']`        |  2   | Multiple elements present. Must be nested inside a specific `table tbody tr` scope to avoid collisions.             |
| Row "Delete" action | `button[aria-label='Delete']` |  2   | Multiple elements present. Scoped inside a targeted row via Cypress `.find()` to guarantee non-destructive actions. |

## Customers — Create/Edit form

| Element       | Selector found          | Type | Notes                                         |
| ------------- | ----------------------- | :--: | --------------------------------------------- |
| Name input    | `input[name="name"]`    |  1   | Native model attribute mapping. Ultra-stable. |
| Email input   | `input[name="email"]`   |  1   | Native model attribute mapping. Ultra-stable. |
| Save button   | `button[type="submit"]` |  1   | Standard form submission control.             |
| Alert message | `div[role='alert']`     |  2   | Accessible ARIA element.                      |

---

## Projects — List view

**URL inspected:** `https://freelance-tracker-mvp-git-develop-lilibeth-sepulveda-s-projects.vercel.app/#/projects`
**Tool used:** SelectorsHub

| Element             | Selector found                | Type | Notes                                                                                                               |
| ------------------- | ----------------------------- | :--: | ------------------------------------------------------------------------------------------------------------------- |
| "Create" button     | `a[aria-label='Create']`      |  2   | Accessible routing anchor.                                                                                          |
| Table rows          | `table tbody tr`              |  1   | Standard HTML row hierarchy. Used to count items or scope single row instances.                                     |
| Row "Edit" action   | `a[aria-label='Edit']`        |  2   | Multiple elements present. Must be nested inside a specific `table tbody tr` scope to avoid collisions.             |
| Row "Delete" action | `button[aria-label='Delete']` |  2   | Multiple elements present. Scoped inside a targeted row via Cypress `.find()` to guarantee non-destructive actions. |

## Projects — Create/Edit form

| Element                            | Selector found                    | Type | Notes                                                       |
| ---------------------------------- | --------------------------------- | :--: | ----------------------------------------------------------- |
| Name input                         | `input[name="name"]`              |  1   | Native form field. Very stable.                             |
| Customer `ReferenceInput` selector | `.MuiSelect-select`               |  3   | Click to open the dropdown menu.                            |
| Customer dropdown options          | `.MuiMenu-root .MuiMenuItem-root` |  3   | Limits search to the open dropdown, avoiding sidebar links. |
| Save button                        | `button[type="submit"]`           |  1   | Standard form submit button.                                |

---

## Time Tracker

**URL inspected:** `https://freelance-tracker-mvp-git-develop-lilibeth-sepulveda-s-projects.vercel.app/#/time-logs`

| Element                 | Selector found          | Type  | Notes                                                                                                                                                                                                                                   |
| ----------------------- | ----------------------- | :---: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project selector        | `div[role='combobox']`  |   2   | Accessible selector to expand the project dropdown.                                                                                                                                                                                     |
| Start button            | `button[type='button']` | **4** | Attribute alone does not disambiguate — all four control buttons share it. Must be targeted via `cy.contains('button', 'Start')`. The attribute itself provides no isolation value here; visible text is the real selector in practice. |
| Pause button            | `button[type='button']` | **4** | Same as above — targeted via `cy.contains('button', 'Pause')`.                                                                                                                                                                          |
| Resume button           | `button[type='button']` | **4** | Same as above — targeted via `cy.contains('button', 'Resume')`.                                                                                                                                                                         |
| Stop button             | `button[type='button']` | **4** | Same as above — targeted via `cy.contains('button', 'Stop')`.                                                                                                                                                                           |
| Time display (HH:MM:SS) | `h3`                    |   1   | Native heading tag. Used to assert the dynamic timer state.                                                                                                                                                                             |

---

## Dashboard

**URL inspected:** `https://freelance-tracker-mvp-git-develop-lilibeth-sepulveda-s-projects.vercel.app/#/`

| Element                   | Selector found                                 | Type | Notes                                                            |
| ------------------------- | ---------------------------------------------- | :--: | ---------------------------------------------------------------- |
| KPI card(s)               | `.MuiPaper-root .MuiCardContent-root p`        |  4   | Targets metrics text inside Material UI card components.         |
| Chart container (`<svg>`) | `.MuiCardContent-root svg[role='application']` |  2   | Uses the accessible ARIA role to identify the main chart canvas. |

---

## Logout

| Element              | Selector found                        | Type | Notes                                                                                                 |
| -------------------- | ------------------------------------- | :--: | ----------------------------------------------------------------------------------------------------- |
| User menu trigger    | `button[aria-label='Profile']`        |  2   | Accessible trigger button to display the user profile dropdown.                                       |
| Logout button/option | `.MuiPopover-paper .MuiMenuItem-root` |  3   | Target item inside the profile dropdown. Filter by text in Cypress (effectively layered with Type 4). |

---

## Risks identified

1. **Shared attributes with no isolation value.** The Time Tracker's Start/Pause/Resume/Stop buttons all share `button[type='button']`, which provides zero disambiguation. The test suite depends entirely on the buttons' visible text. If the UI copy changes (e.g. localization, rewording "Stop" to "End Session"), every tracker test breaks simultaneously. This is the single most fragile point in the current selector set.

2. **MUI version-coupled selectors.** Several selectors rely on Material UI auto-generated class names (`.MuiSelect-select`, `.MuiPopover-paper`, `.MuiCardContent-root`, `.MuiFormHelperText-root.Mui-error`). These classes are stable across patch versions but could change if React Admin or MUI undergo a major version upgrade. If that happens, the affected Page Objects (`ProjectsPage`, `DashboardPage`, the logout flow, and the form validation assertions in `CustomersPage`) would need their selectors re-audited — not the specs themselves, which is precisely the value the POM pattern provides here: the blast radius of a breaking UI change is contained to a handful of Page Object files, not scattered across every spec.

3. **Generic KPI selector requires layered scoping.** `.MuiPaper-root .MuiCardContent-root p` matches every KPI paragraph on the dashboard indiscriminately. Reading a _specific_ KPI (e.g. "Total Hours" vs. a revenue figure) requires first scoping with `cy.contains()` on the card's label text, then reading the value inside that scope. This works, but means the dashboard tests are more sensitive to label wording changes than the selector table alone suggests.

4. **No UI path to delete a time log.** This isn't a selector fragility risk, but a structural one worth recording here since it was discovered during this audit: every E2E test that creates a time log permanently affects the Staging account's historical data, with no automated cleanup possible from this repository.

---

## Decision summary

Type 1 (semantic attributes generated natively by React Admin) was prioritized wherever it was available — logins, form text inputs, and submit buttons all mapped cleanly to `name` and `type` attributes with no extra work. In practice, though, a significant portion of the interactive UI does **not** expose a semantic attribute that disambiguates between similar elements: action buttons, dropdowns, popovers, and the tracker controls. For those, Type 2 (ARIA) and Type 3 (stable MUI classes) were used, and in a few cases (the tracker controls, the KPI cards, the logout menu item) neither was sufficient on its own and the real, practical selector ended up being Type 4 — visible text — layered on top of a Type 2/3 container for scoping.

Roughly half of the elements audited here ended up as Type 2, 3, or 4 rather than Type 1. That is not a deviation from the strategy defined in `TEST_STRATEGY.md` — it's the expected, honest outcome of testing a UI library that doesn't expose `data-testid` and that reuses generic semantic attributes (like `type='button'`) across visually distinct controls. If `data-testid` were ever added to the application in the future, the buttons most worth targeting first would be exactly the ones flagged as fragile above: the four tracker controls and the KPI cards, since those are where a Type 1 attribute would eliminate real, demonstrated ambiguity rather than just being a "nice to have."
