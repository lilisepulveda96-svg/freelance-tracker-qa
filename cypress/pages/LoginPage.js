class LoginPage {
  #emailInput = 'input[name="username"]';
  #passwordInput = 'input[name="password"]';
  #submitBtn = 'button[type="submit"]';

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

  assertLoggedIn() {
    cy.url().should("not.include", "/login");
    return this;
  }
}

export default new LoginPage();
