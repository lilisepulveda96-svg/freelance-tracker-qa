class TrackerPage {
  #projectSelector = "div[role='combobox']";
  #projectOption = ".MuiMenu-list .MuiMenuItem-root";
  #timerCard = ".MuiCardContent-root";
  #timeDisplay = "h3";

  selectProject(projectName) {
    cy.get(this.#projectSelector).click();
    cy.contains(this.#projectOption, projectName).click();
    return this;
  }

  waitForLoad() {
    cy.get(this.#projectSelector).should("be.visible");
    return this;
  }

  start() {
    cy.contains("button", "Start").click({ force: true });
    return this;
  }

  pause(projectName) {
    cy.contains(this.#timerCard, projectName).within(() => {
      cy.contains("button", "Pause").click();
    });
    return this;
  }

  resume(projectName) {
    cy.contains(this.#timerCard, projectName).within(() => {
      cy.contains("button", "Resume").click();
    });
    return this;
  }

  setTimerState(projectId, msElapsed) {
    cy.window().then((win) => {
      const timers = JSON.parse(
        win.localStorage.getItem("freelance_tracker_timers"),
      );

      timers[projectId].lastResumeTime = Date.now() - msElapsed;
      win.localStorage.setItem(
        "freelance_tracker_timers",
        JSON.stringify(timers),
      );
    });
    return this;
  }

  assertDisplay(projectName, expectedTime) {
    cy.contains(this.#timerCard, projectName)
      .find(this.#timeDisplay)
      .should("contain.text", expectedTime);
    return this;
  }

  assertPersistedDisplay(projectName, minSeconds) {
    cy.contains(this.#timerCard, projectName)
      .find(this.#timeDisplay)
      .invoke("text")
      .then((text) => {
        const seconds = parseInt(text.split(":").pop());
        expect(seconds).to.be.at.least(minSeconds);
      });
    return this;
  }

  assertDisplayNotEqual(projectName, unexpectedTime) {
    cy.contains(this.#timerCard, projectName)
      .find(this.#timeDisplay)
      .should("not.contain", unexpectedTime);
    return this;
  }
}

export default new TrackerPage();
