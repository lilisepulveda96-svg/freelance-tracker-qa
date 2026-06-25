import ProjectsPage from "../pages/ProjectsPage";
import NavigationPage from "../pages/NavigationPage";

describe("[e2e] Project Customer Relation (ReferenceInput)", () => {
  const uniqueSuffix = Date.now();
  const hourlyRate = (Math.random() * 100).toFixed(2);
  let relationCustomer;

  before(() => {
    cy.loginViaAPI();
    cy.apiRequest("POST", "customers", {
      name: `QA Relation Customer ${uniqueSuffix}`,
      email: `relation_${uniqueSuffix}@email.com`,
    }).then((response) => {
      relationCustomer = { id: response.body.id, name: response.body.name };
    });
  });

  after(() => {
    cy.apiRequest("DELETE", `customers/${relationCustomer.id}`);
  });

  beforeEach(() => {
    cy.loginViaAPI();
    NavigationPage.projectsVisit();
  });

  it("shows existing customers in the dropdown options", () => {
    ProjectsPage.openCustomerDropdown();

    ProjectsPage.assertCustomerInDropdown(relationCustomer.name);
  });

  it("creates a project successfully without selecting a customer", () => {
    const projectName = `QA No Customer Project ${uniqueSuffix}`;

    ProjectsPage.createProjectWithoutCustomer(projectName, hourlyRate);
    ProjectsPage.assertProjectInTable(projectName);

    ProjectsPage.clickDeleteForProject(projectName);
  });
});
