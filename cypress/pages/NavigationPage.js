class NavigationPage {
  #userMenuTriggerDropdown = 'button[aria-label="Profile"]';
  #logoutButton = ".MuiPopover-paper .MuiMenuItem-root";

  customersVisit() {
    cy.visit("#/customers");
    return this;
  }
  projectsVisit() {
    cy.visit("#/projects");
    return this;
  }
  timeLogsVisit() {
    cy.visit("#/time-logs");
    return this;
  }
  logout() {
    cy.get(this.#userMenuTriggerDropdown).should("be.visible").click();
    cy.get(this.#logoutButton).should("be.visible").click();
    return this;
  }
}
export default new NavigationPage();
