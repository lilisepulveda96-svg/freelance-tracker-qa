// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

Cypress.Commands.add(
  "loginViaAPI",
  (
    email = Cypress.env("TEST_USER_EMAIL"),
    password = Cypress.env("TEST_USER_PASSWORD"),
  ) => {
    cy.session(email, () => {
      cy.request({
        method: "POST",
        url: `${Cypress.env("SUPABASE_URL")}/auth/v1/token?grant_type=password`,
        headers: {
          apikey: Cypress.env("SUPABASE_ANON_KEY"),
        },
        body: { email, password },
      }).then((response) => {
        const {
          access_token,
          refresh_token,
          expires_in,
          expires_at,
          token_type,
          user,
        } = response.body;

        const sessionData = {
          access_token,
          refresh_token,
          expires_in,
          expires_at,
          token_type,
          user,
          weak_password: null,
        };

        const projectRef = Cypress.env("SUPABASE_URL").match(
          /https:\/\/(.+)\.supabase\.co/,
        )[1];
        window.localStorage.setItem(
          `sb-${projectRef}-auth-token`,
          JSON.stringify(sessionData),
        );
      });
    });
  },
);

Cypress.Commands.add("clearAppSession", () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

Cypress.Commands.add("assertMessageVisible", (selector, expectedText) => {
  cy.get(selector).should("be.visible").and("contain", expectedText);
});

Cypress.Commands.add("apiRequest", (method, path, body) => {
  return cy.window().then((win) => {
    const projectRef = Cypress.env("SUPABASE_URL").match(
      /https:\/\/(.+)\.supabase\.co/,
    )[1];
    const session = JSON.parse(
      win.localStorage.getItem(`sb-${projectRef}-auth-token`),
    );

    return cy.request({
      method,
      url: `${Cypress.env("API_URL")}/${path}`,
      headers: { Authorization: `Bearer ${session.access_token}` },
      body,
    });
  });
});
