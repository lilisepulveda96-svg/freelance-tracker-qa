import LoginPage from "../pages/LoginPage";
import NavigationPage from "../pages/NavigationPage";

const email = Cypress.env("TEST_USER_EMAIL");
const password = Cypress.env("TEST_USER_PASSWORD");

describe("[e2e] Route Protection", () => {
  beforeEach(() => {
    cy.clearAppSession();
  });

  it("redirects visiting /customers without a session to /login", () => {
    NavigationPage.customersVisit();
    LoginPage.assertStillOnLogin();
  });

  it("redirects visiting /projects without a session to /login", () => {
    NavigationPage.projectsVisit();
    LoginPage.assertStillOnLogin();
  });

  it("redirects visiting the tracker route without a session to /login", () => {
    NavigationPage.timeLogsVisit();
    LoginPage.assertStillOnLogin();
  });

  it("invalidates the session on logout and redirects a subsequent visit to /login", () => {
    LoginPage.visit();
    LoginPage.login(email, password);
    LoginPage.assertLoggedIn();

    NavigationPage.logout();

    NavigationPage.projectsVisit();
    LoginPage.assertStillOnLogin();
  });
});
