import { test as base, expect } from "@playwright/test";
import { MenuPage } from "../pages/menu.page";
import { CreateSliceModalPage } from "../pages/slices/createSliceModal.page";
import { RenameSliceModalPage } from "../pages/slices/renameSliceModal.page";
import { CreateTypeModalPage } from "../pages/types/createTypeModal.page";
import { SliceDetailsPage } from "../pages/slices/sliceDetails.page";
import { SliceListPage } from "../pages/slices/sliceList.page";
import { CustomTypesListPage } from "../pages/types/customTypesList.page";
import { PageTypesListPage } from "../pages/types/pageTypesList.page";
import { ChangesPage } from "../pages/changes.page";
import { ChangelogPage } from "../pages/changelog.page";
import { CustomTypesDetailsPage } from "../pages/types/customTypesDetails.page";
import { RenameTypeModalPage } from "../pages/types/renameTypeModal.page";
import { DeleteSliceModalPage } from "../pages/slices/deleteSliceModal.page";

// Declare the types of your fixtures.
type MyFixtures = {
  createSliceModalPage: CreateSliceModalPage;
  deleteSliceModalPage: DeleteSliceModalPage;
  renameSliceModalPage: RenameSliceModalPage;
  sliceDetailsPage: SliceDetailsPage;
  sliceListPage: SliceListPage;
  customTypesListPage: CustomTypesListPage;
  customTypesDetailsPage: CustomTypesDetailsPage;
  createTypeModalPage: CreateTypeModalPage;
  renameTypeModalPage: RenameTypeModalPage;
  pageTypesListPage: PageTypesListPage;
  changesPage: ChangesPage;
  changelogPage: ChangelogPage;
  menu: MenuPage;
  slice: Record<"name", string>;
};

export const test = base.extend<MyFixtures>({
  menu: async ({ page }, use) => {
    await use(new MenuPage(page));
  },
  createSliceModalPage: async ({ page }, use) => {
    await use(new CreateSliceModalPage(page));
  },
  deleteSliceModalPage: async ({ page }, use) => {
    await use(new DeleteSliceModalPage(page));
  },
  renameSliceModalPage: async ({ page }, use) => {
    await use(new RenameSliceModalPage(page));
  },
  sliceDetailsPage: async ({ page }, use) => {
    await use(new SliceDetailsPage(page));
  },
  sliceListPage: async ({ page }, use) => {
    await use(new SliceListPage(page));
  },
  customTypesListPage: async ({ page }, use) => {
    await use(new CustomTypesListPage(page));
  },
  customTypesDetailsPage: async ({ page }, use) => {
    await use(new CustomTypesDetailsPage(page));
  },
  pageTypesListPage: async ({ page }, use) => {
    await use(new PageTypesListPage(page));
  },
  createTypeModalPage: async ({ page }, use) => {
    await use(new CreateTypeModalPage(page));
  },
  renameTypeModalPage: async ({ page }, use) => {
    await use(new RenameTypeModalPage(page));
  },
  changesPage: async ({ page }, use) => {
    await use(new ChangesPage(page));
  },
  changelogPage: async ({ page }, use) => {
    await use(new ChangelogPage(page));
  },

  slice: async (
    { sliceListPage, createSliceModalPage, sliceDetailsPage },
    use
  ) => {
    await sliceListPage.goto();
    await expect(sliceListPage.title).toBeVisible();
    await sliceListPage.openCreateModal();

    const randomInt = Math.floor(Math.random() * 1e9);
    const sliceName = "Slice" + randomInt;
    await createSliceModalPage.createSlice(sliceName);

    await expect(sliceDetailsPage.title).toBeVisible();
    await expect(sliceDetailsPage.title).toContainText(sliceName);

    await expect(sliceDetailsPage.staticZonePlaceholder).toBeVisible();
    await expect(sliceDetailsPage.repeatableZonePlaceholder).toBeVisible();
    await expect(sliceDetailsPage.saveButton).toBeDisabled();

    await use({ name: sliceName });
  },
});

export { expect } from "@playwright/test";
