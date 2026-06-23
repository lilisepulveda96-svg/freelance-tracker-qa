import LoginPage from "../pages/LoginPage";
import messages from "../fixtures/uiMessages.json";

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
describe("[e2e] Auth — negative cases and form validation", () => {
  beforeEach(() => {
    cy.clearAppSession();
    LoginPage.visit();
  });

  it("renders all expected fields before any interaction", () => {
    LoginPage.assertElementsVisible();
  });

  it("shows an error message for an incorrect password and stays on login screen", () => {
    LoginPage.login(email, "WrongPassword123!");
    LoginPage.assertMessageVisible(messages.invalidCredentials);
    LoginPage.assertStillOnLogin();
  });

  it("shows an error message for a non-existent email and stays on login screen", () => {
    LoginPage.login("nobody@freelancetracker.com", "Password123!");
    LoginPage.assertMessageVisible(messages.invalidCredentials);
    LoginPage.assertStillOnLogin();
  });
  it("shows an error message for an empty fields and stays on login screen", () => {
    LoginPage.submitEmpty();
    LoginPage.assertMessageVisible(messages.formValidation);
    LoginPage.assertStillOnLogin();
  });
});
