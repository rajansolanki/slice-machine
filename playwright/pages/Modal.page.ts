import { Locator, Page } from "@playwright/test";

export class Modal {
  readonly page: Page;
  readonly root: Locator;
  readonly title: Locator;
  readonly closeButton: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page, title: string | RegExp, submitName: string) {
    this.page = page;
    this.root = page.getByRole("dialog");
    this.title = this.root.getByRole("heading", { name: title });
    this.closeButton = this.root.getByRole("button", { name: "Close" });
    this.cancelButton = this.root.getByRole("button", { name: "Cancel" });
    this.submitButton = this.root.getByRole("button", { name: submitName });
  }

}
