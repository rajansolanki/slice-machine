import { Locator, Page } from "@playwright/test";

export class ChangesPage {
  readonly page: Page;
  readonly title: Locator;
  readonly pushButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByLabel("Breadcrumb").getByText("Changes");
    // this.title = this.root.getByRole("button", { name: "Push Changes" });
  }
}
