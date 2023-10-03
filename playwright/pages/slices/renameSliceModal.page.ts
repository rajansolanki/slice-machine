import { expect, Locator, Page } from "@playwright/test";
import { Modal } from "../Modal.page";

export class RenameSliceModalPage extends Modal {
  readonly nameInput: Locator;

  constructor(page: Page) {
    super(page, "Rename a slice", "Rename");
    this.nameInput = page.getByTestId("slice-name-input");
  }

  async renameSlice(name: string) {
    await expect(this.title).toBeVisible();
    await this.nameInput.fill(name);
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }
}
