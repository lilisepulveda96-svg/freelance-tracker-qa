import CustomersPage from "../pages/CustomersPage";
import NavigationPage from "../pages/NavigationPage";
import messages from "../fixtures/uiMessages.json";
import LoginPage from "../pages/LoginPage";

describe("[e2e] Customers CRUD", () => {
  const uniqueSuffix = Date.now();
  const customerName = `QA Customer ${uniqueSuffix}`;
  const customerEmail = `qa_${uniqueSuffix}@email.com`;
  const editedName = `QA Customer Edited ${uniqueSuffix}`;
  const editedEmail = `qa_edited_${uniqueSuffix}@email.com`;

  beforeEach(() => {
    cy.loginViaAPI();
    NavigationPage.customersVisit();
  });

  it("creates a customer with valid data and displays it in the table", () => {
    CustomersPage.createCustomer(customerName, customerEmail);
    CustomersPage.assertCustomerInTable(customerName);

    CustomersPage.clickDeleteForCustomer(customerName);
  });

  it("edits an existing customer and updates the corresponding table row", () => {
    CustomersPage.createCustomer(customerName, customerEmail);
    CustomersPage.assertCustomerInTable(customerName);

    CustomersPage.clickEditForCustomer(customerName);
    CustomersPage.editCustomer(editedName, editedEmail);

    CustomersPage.assertCustomerInTable(editedName);
    CustomersPage.clickDeleteForCustomer(editedName);
  });

  it("deletes a customer and removes it from the table", () => {
    CustomersPage.createCustomer(customerName, customerEmail);
    CustomersPage.assertCustomerInTable(customerName);

    CustomersPage.clickDeleteForCustomer(customerName);
    CustomersPage.assertCustomerNotInTable(customerName);
  });

  it("disables the save button when the name field is empty", () => {
    CustomersPage.openCreateForm();
    CustomersPage.assertSaveButtonDisabled();
  });

  it("shows a validation error if the name field becomes empty after being touched", () => {
    CustomersPage.triggerEmptyNameValidation();
    CustomersPage.assertNotificationVisible(messages.formValidation);
  });
});
