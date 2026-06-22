class LoginPage {
  #emailInput = 'input[name="username"]';
  #passwordInput = 'input[name="password"]';
  #submitBtn = 'button[type="submit"]';
  #errorMessage = 'div[role="alert"]';

  visit() {
    cy.visit("#/login");
    return this;
  }

  login(email, password) {
    cy.get(this.#emailInput).type(email);
    cy.get(this.#passwordInput).type(password);
    cy.get(this.#submitBtn).click();
    return this;
  }

  submitEmpty() {
    cy.get(this.#submitBtn).click();
    return this;
  }

  assertLoggedIn() {
    cy.url().should("not.include", "/login");
    return this;
  }

  assertStillOnLogin() {
    cy.url().should("include", "/login");
    return this;
  }

  assertElementsVisible() {
    cy.get(this.#emailInput).should("be.visible");
    cy.get(this.#passwordInput).should("be.visible");
    cy.get(this.#submitBtn).should("be.visible");
    return this;
  }

  assertErrorMessageVisible(expectedText) {
    cy.get(this.#errorMessage)
      .should("be.visible")
      .and("contain.text", expectedText);
    return this;
  }
}

export default new LoginPage();
