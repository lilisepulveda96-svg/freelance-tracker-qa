class CustomersPage {
  #createCustomerButton = 'a[aria-label="Create"]';
  #nameInput = 'input[name="name"]';
  #emailInput = 'input[name="email"]';
  #saveButton = 'button[type="submit"]';
  #notificationAlert = 'div[role="alert"]';
  #tableRows = "table tbody tr";
  #editButton = 'a[aria-label="Edit"]';
  #deleteButton = 'button[aria-label="Delete"]';

  openCreateForm() {
    cy.get(this.#createCustomerButton).should("be.visible").click();
    return this;
  }

  createCustomer(name, email) {
    this.openCreateForm();
    cy.get(this.#nameInput).should("be.visible").type(name);
    cy.get(this.#emailInput).should("be.visible").type(email);
    cy.get(this.#saveButton).should("be.visible").click();

    cy.get(this.#notificationAlert, { timeout: 8000 }).should("be.visible");
    cy.get(this.#notificationAlert, { timeout: 8000 }).should("not.exist");
    return this;
  }

  editCustomer(name, email) {
    cy.intercept("PUT", "**/customers/*").as("editCustomer");
    cy.get(this.#nameInput).should("be.visible").clear().type(name);
    cy.get(this.#emailInput).should("be.visible").clear().type(email);
    cy.get(this.#saveButton).should("be.visible").click();

    cy.get(this.#notificationAlert, { timeout: 8000 }).should("be.visible");
    cy.get(this.#notificationAlert, { timeout: 8000 }).should("not.exist");
    cy.wait("@editCustomer")
      .its("response.statusCode")
      .should("be.oneOf", [200, 204]);
    return this;
  }

  clickEditForCustomer(customerName) {
    cy.contains(this.#tableRows, customerName).find(this.#editButton).click();
    return this;
  }

  clickDeleteForCustomer(customerName) {
    cy.intercept("DELETE", "**/customers/*").as("deleteCustomer");
    cy.contains(this.#tableRows, customerName).find(this.#deleteButton).click();

    cy.get(this.#notificationAlert, { timeout: 8000 }).should("be.visible");
    cy.get(this.#notificationAlert, { timeout: 8000 }).should("not.exist");

    cy.wait("@deleteCustomer").its("response.statusCode").should("eq", 204);
    return this;
  }

  triggerEmptyNameValidation() {
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

  assertCustomerInTable(name) {
    cy.contains(this.#tableRows, name).should("be.visible");
    return this;
  }

  assertCustomerNotInTable(name) {
    cy.contains(this.#tableRows, name).should("not.exist");
    return this;
  }
}

export default new CustomersPage();
