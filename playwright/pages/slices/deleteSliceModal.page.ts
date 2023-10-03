import { expect, Page } from "@playwright/test";
import { Modal } from "../Modal.page";

export class DeleteSliceModalPage extends Modal {
  constructor(page: Page) {
    super(page, "Delete Slice", "Delete");
  }

  async deleteSlice() {
    await expect(this.title).toBeVisible();
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }
}
