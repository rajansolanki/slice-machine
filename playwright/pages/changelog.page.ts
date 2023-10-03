import { Locator, Page } from "@playwright/test";

export class ChangelogPage {
  readonly page: Page;
  readonly title: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole("main").getByText("Changelog");
  }
}
