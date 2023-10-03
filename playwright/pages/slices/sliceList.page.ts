import { Locator, Page } from "@playwright/test";

export class SliceListPage {
  readonly page: Page;
  readonly title: Locator;
  readonly header: Locator;
  readonly body: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.body = page.getByRole("main").first();
    this.header = page.getByRole("banner");
    this.title = this.header.getByLabel("Breadcrumb").getByText("Slices");
    this.createButton = this.header
      .getByRole("button", { name: "Create one" })
      .or(page.getByRole("button", { name: "Create" }));
  }

  async goto() {
    await this.page.goto("/slices");
    await this.title.isVisible();
  }

  getCard(name: string): Locator {
    return this.body.getByRole("button", {
      name: `${name} slice card`,
      exact: true,
    });
  }

  async clickCard(name: string) {
    // Make sure not to accidentaly click on a button that would trigger another action
    await this.getCard(name).getByRole("heading", { name }).click();
  }

  async openCreateModal() {
    await this.createButton.first().click();
  }

  async openActionModal(name: string, action: "Rename" | "Delete") {
    await this.getCard(name).getByTestId("slice-action-icon").click();
    await this.page
      .getByTestId("slice-action-icon-dropdown")
      .getByText(action)
      .click();
  }

  async openScreenshotModal(name: string) {
    await this.getCard(name).getByRole("button", {
      name: "Update Screenshot",
    });
  }
}
