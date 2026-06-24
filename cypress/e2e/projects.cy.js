import ProjectsPage from "../pages/ProjectsPage";
import NavigationPage from "../pages/NavigationPage";
import messages from "../fixtures/uiMessages.json";

describe("[e2e] Projects CRUD", () => {
  const uniqueSuffix = Date.now();
  const projectName = `QA Project ${uniqueSuffix}`;
  const hourlyRate = (Math.random() * 100).toFixed(2);
  const editedProjectName = `QA Project Edited ${uniqueSuffix}`;
  const editedHourlyRate = (Math.random() * 100).toFixed(2);

  let testCustomer;

  before(() => {
    cy.loginViaAPI();
    cy.apiRequest("POST", "customers", {
      name: `QA Projects Test Customer ${uniqueSuffix}`,
      email: `qa_projects_customer_${uniqueSuffix}@email.com`,
    }).then((response) => {
      testCustomer = { id: response.body.id, name: response.body.name };
    });
  });

  after(() => {
    cy.apiRequest("DELETE", `customers/${testCustomer.id}`);
  });

  beforeEach(() => {
    cy.loginViaAPI();
    NavigationPage.projectsVisit();
  });

  it("creates a project with valid data and displays it in the table", () => {
    ProjectsPage.createProject(projectName, hourlyRate, testCustomer.name);
    ProjectsPage.assertProjectInTable(projectName);
    ProjectsPage.assertProjectHasCustomer(projectName, testCustomer.name);

    ProjectsPage.clickDeleteForProject(projectName);
  });

  it("edits an existing project and updates the corresponding table row", () => {
    ProjectsPage.createProject(projectName, hourlyRate, testCustomer.name);
    ProjectsPage.assertProjectInTable(projectName);

    ProjectsPage.clickEditForProject(projectName);
    ProjectsPage.editProject(editedProjectName, editedHourlyRate);

    ProjectsPage.assertProjectInTable(editedProjectName);
    ProjectsPage.clickDeleteForProject(editedProjectName);
  });

  it("deletes a project and removes it from the table", () => {
    ProjectsPage.createProject(projectName, hourlyRate, testCustomer.name);
    ProjectsPage.assertProjectInTable(projectName);

    ProjectsPage.clickDeleteForProject(projectName);
    ProjectsPage.assertProjectNotInTable(projectName);
  });

  it("disables the save button when the name field is empty", () => {
    ProjectsPage.openCreateForm();
    ProjectsPage.assertSaveButtonDisabled();
  });

  it("shows a validation error if the name field becomes empty after being touched", () => {
    ProjectsPage.triggerEmptyProjectNameValidation();
    ProjectsPage.assertNotificationVisible(messages.formValidation);
  });
});
