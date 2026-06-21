describe("[Smoke] Authentication via API", () => {
  beforeEach(() => {
    cy.loginViaAPI();
  });

  it("should access the authenticated dashboard directly", () => {
    cy.visit("/");
    cy.url().should("not.include", "/login");
  });
});
