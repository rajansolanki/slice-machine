import { expect, Locator, Page } from "@playwright/test";
import { Modal } from "../Modal.page";

export class CreateSliceModalPage extends Modal {
  readonly nameInput: Locator;

  constructor(page: Page) {
    super(page, "Create a new slice", "Create");
    this.nameInput = page.getByTestId("slice-name-input");
  }

  async createSlice(name: string) {
    await expect(this.title).toBeVisible();
    await this.nameInput.fill(name);
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }
}
