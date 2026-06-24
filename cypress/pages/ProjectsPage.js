class ProjectsPage {
  #createProjectButton = 'a[aria-label="Create"]';
  #nameInput = 'input[name="name"]';
  #hourlyRate = 'input[name="hourly_rate"]';
  #referenceInputCustomers = ".MuiSelect-select";
  #customerDropdownMenu = ".MuiMenu-root.MuiModal-root[role='presentation']";
  #customerMenuItem = ".MuiMenuItem-root";
  #saveButton = 'button[type="submit"]';
  #notificationAlert = 'div[role="alert"]';
  #tableRows = "table tbody tr";
  #editButton = 'a[aria-label="Edit"]';
  #deleteButton = 'button[aria-label="Delete"]';

  openCreateForm() {
    cy.get(this.#createProjectButton).should("be.visible").click();
    return this;
  }

  createProject(projectName, hourlyRate, customerName) {
    this.openCreateForm();
    cy.get(this.#nameInput).should("be.visible").type(projectName);
    cy.get(this.#hourlyRate).should("be.visible").type(hourlyRate);
    cy.contains("label", "Customer")
      .parent()
      .find(this.#referenceInputCustomers)
      .click();
    cy.get(this.#customerDropdownMenu)
      .should("be.visible")
      .contains(this.#customerMenuItem, customerName)
      .click();
    cy.get(this.#saveButton).should("be.visible").click();

    cy.get(this.#notificationAlert, { timeout: 8000 }).should("be.visible");
    cy.get(this.#notificationAlert, { timeout: 8000 }).should("not.exist");
    return this;
  }

  editProject(editedProjectName, hourlyRate) {
    cy.intercept("PUT", "**/projects/*").as("editProject");
    cy.get(this.#nameInput)
      .should("be.visible")
      .clear()
      .type(editedProjectName);
    cy.get(this.#hourlyRate).should("be.visible").type(hourlyRate);
    cy.get(this.#saveButton).should("be.visible").click();

    cy.get(this.#notificationAlert, { timeout: 8000 }).should("be.visible");
    cy.get(this.#notificationAlert, { timeout: 8000 }).should("not.exist");
    cy.wait("@editProject")
      .its("response.statusCode")
      .should("be.oneOf", [200, 204]);
    return this;
  }

  clickEditForProject(projectName) {
    cy.contains(this.#tableRows, projectName).find(this.#editButton).click();
    return this;
  }

  clickDeleteForProject(projectName) {
    cy.intercept("DELETE", "**/projects/*").as("deleteProject");
    cy.get("vercel-live-feedback").invoke("css", "display", "none");
    cy.contains(this.#tableRows, projectName).find(this.#deleteButton).click();

    cy.get(this.#notificationAlert, { timeout: 8000 }).should("be.visible");
    cy.get(this.#notificationAlert, { timeout: 8000 }).should("not.exist");

    cy.wait("@deleteProject").its("response.statusCode").should("eq", 204);
    return this;
  }

  triggerEmptyProjectNameValidation() {
    this.openCreateForm();
    cy.get(this.#nameInput).should("be.visible").type("a").clear();
    cy.get(this.#saveButton).should("be.enabled").click();
    return this;
  }

  assertSaveButtonDisabled() {
    cy.get(this.#saveButton).should("be.disabled");
    return this;
  }

  assertNotificationVisible(message) {
    cy.assertMessageVisible(this.#notificationAlert, message);
    return this;
  }

  assertProjectInTable(projectName) {
    cy.contains(this.#tableRows, projectName).should("be.visible");
    return this;
  }

  assertProjectNotInTable(projectName) {
    cy.contains(this.#tableRows, projectName).should("not.exist");
    return this;
  }
  assertProjectHasCustomer(projectName, customerName) {
    cy.contains(this.#tableRows, projectName).should("contain", customerName);
    return this;
  }
}

export default new ProjectsPage();
