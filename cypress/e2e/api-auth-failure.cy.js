import LoginPage from "../pages/LoginPage";
import NavigationPage from "../pages/NavigationPage";

describe("[e2e] API Authorization Failure Handling", () => {
  it("redirects to /login when the backend rejects a request as unauthorized (401)", () => {
    cy.loginViaAPI();

    cy.intercept("GET", "**/customers*", {
      statusCode: 401,
      body: { error: "Unauthorized access - Token expired or invalid" },
    }).as("unauthorizedRequest");

    NavigationPage.customersVisit();

    cy.wait("@unauthorizedRequest");

    LoginPage.assertStillOnLogin();
  });
});
