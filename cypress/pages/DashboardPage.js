class DashboardPage {
  #kpiCard = ".MuiCardContent-root";
  #chartContainer = ".recharts-wrapper";
  #chartBar = ".recharts-bar-rectangle";

  visit() {
    cy.visit("#/");
    return this;
  }

  assertIsLandingView() {
    cy.url().should("match", /#\/$/);
    return this;
  }

  assertKpi(title, valueRegex) {
    cy.contains(this.#kpiCard, title)
      .find("h4")
      .should("be.visible")
      .invoke("text")
      .should("match", valueRegex);
    return this;
  }

  assertChartIsRendered() {
    cy.get(this.#chartContainer, { timeout: 8000 }).should("be.visible");
    cy.get(this.#chartBar, { timeout: 8000 }).should("have.length.at.least", 1);
    return this;
  }
}

export default new DashboardPage();
