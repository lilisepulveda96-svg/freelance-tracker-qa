import DashboardPage from "../pages/DashboardPage";
import messages from "../fixtures/uiMessages.json";

describe("[e2e] Dashboard Rendering", () => {
  beforeEach(() => {
    cy.loginViaAPI();
    DashboardPage.visit();
  });

  it("verifies the dashboard is the landing view", () => {
    DashboardPage.assertIsLandingView();
  });

  it("verifies KPI cards display correct numeric values", () => {
    DashboardPage.assertKpi(messages.kpiTitles.hoursThisMonth, /\d+h/)
      .assertKpi(messages.kpiTitles.projectedRevenue, /\$\d+/)
      .assertKpi(messages.kpiTitles.totalClients, /\d+/);
  });

  it("verifies the Recharts bar chart renders", () => {
    DashboardPage.assertChartIsRendered();
  });
});
