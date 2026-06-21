import LoginPage from "../pages/LoginPage";

const email = Cypress.env("TEST_USER_EMAIL");
const password = Cypress.env("TEST_USER_PASSWORD");

describe("[e2e] Auth", () => {
  beforeEach(() => {
    cy.clearAppSession();
  });
  it("logs in with valid credentials", () => {
    LoginPage.visit();
    LoginPage.login(email, password);
    LoginPage.assertLoggedIn();
  });
});
