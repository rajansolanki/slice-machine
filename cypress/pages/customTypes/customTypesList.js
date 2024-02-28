class CustomTypesList {
  get emptyStateButton() {
    return cy.get("[data-testid=empty-state-main-button]");
  }

  getOptionDopDownButton(id) {
    return this.getCustomTypeRow(id).get(
      '[data-testid="edit-custom-type-menu"]',
    );
  }

  get optionDopDownMenu() {
    return cy.get('[data-testid="edit-custom-type-menu-dropdown"]');
  }

  get deleteButton() {
    return this.optionDopDownMenu.contains("Delete");
  }

  get renameButton() {
    return this.optionDopDownMenu.contains("Rename");
  }

  getCustomTypeRow(id) {
    return cy.contains("tr", id);
  }

  getCustomTypeLabel(id) {
    return cy.get(`[data-testid="custom-type-${id}-label"]`);
  }

  goTo() {
    cy.visit("/");
    return this;
  }
}

export const customTypesList = new CustomTypesList();
