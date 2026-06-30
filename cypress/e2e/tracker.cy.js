import TrackerPage from "../pages/TrackerPage";
import NavigationPage from "../pages/NavigationPage";

describe("[e2e] Time Tracker — Stopwatch Behavior", () => {
  const uniqueSuffix = Date.now();
  const projectName = `QA Tracker Project ${uniqueSuffix}`;
  let testCustomer;

  before(() => {
    cy.loginViaAPI();

    cy.apiRequest("POST", "customers", {
      name: `QA Tracker Customer ${uniqueSuffix}`,
      email: `tracker_${uniqueSuffix}@email.com`,
    }).then((response) => {
      testCustomer = { id: response.body.id, name: response.body.name };

      cy.apiRequest("POST", "projects", {
        name: projectName,
        hourly_rate: 50,
        customer_id: testCustomer.id,
      }).then((projectResponse) => {
        Cypress.env("trackerTestProjectId", projectResponse.body.id);
      });
    });
  });

  after(() => {
    cy.apiRequest("DELETE", `projects/${Cypress.env("trackerTestProjectId")}`);
    cy.apiRequest("DELETE", `customers/${testCustomer.id}`);
  });

  beforeEach(() => {
    cy.loginViaAPI();
    NavigationPage.timeLogsVisit();
  });

  it("starts the timer and the display begins counting from 00:00:00", () => {
    TrackerPage.waitForLoad();

    cy.clock();
    TrackerPage.selectProject(projectName).start();

    TrackerPage.assertDisplay(projectName, "00:00:00");

    cy.tick(5000);
    TrackerPage.assertDisplay(projectName, "00:00:05");
  });

  it("pauses the timer and freezes the displayed time", () => {
    TrackerPage.waitForLoad();
    cy.clock();
    TrackerPage.selectProject(projectName).start();
    cy.tick(7000);

    TrackerPage.pause(projectName);
    TrackerPage.assertDisplay(projectName, "00:00:07");

    cy.tick(5000);
    TrackerPage.assertDisplay(projectName, "00:00:07");
  });

  it("resumes after a pause and continues counting from the paused value", () => {
    TrackerPage.waitForLoad();
    cy.clock();
    TrackerPage.selectProject(projectName).start();
    cy.tick(4000);
    TrackerPage.pause(projectName);

    TrackerPage.resume(projectName);
    cy.tick(3000);

    TrackerPage.assertDisplay(projectName, "00:00:07");
  });

  it("preserves the elapsed time after a page refresh while running", () => {
    TrackerPage.waitForLoad();

    TrackerPage.selectProject(projectName).start();

    TrackerPage.setTimerState(Cypress.env("trackerTestProjectId"), 25000);

    cy.reload();

    TrackerPage.assertPersistedDisplay(projectName, 25);
  });
});
