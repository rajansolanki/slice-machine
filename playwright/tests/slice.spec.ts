import { expect } from "@playwright/test";
import { test } from "../fixtures/onboarded";

test("As an onboarded user, I can only use Pascal case slice names", async ({
  sliceListPage,
  createSliceModalPage,
}) => {
  await sliceListPage.goto();
  await sliceListPage.openCreateModal();

  const { nameInput, submitButton } = createSliceModalPage;

  await nameInput.fill("Invalid Slice Name");
  await expect(submitButton).toBeDisabled();

  await nameInput.clear();
  await nameInput.fill("Invalid_slice_name");
  await expect(submitButton).toBeDisabled();

  await nameInput.clear();
  await nameInput.fill("123SliceName");
  await expect(submitButton).toBeDisabled();

  await nameInput.clear();
  await nameInput.fill("ValidSliceName");
  await expect(submitButton).toBeEnabled();
});

test("Create Slice", async ({
  sliceDetailsPage,
  sliceListPage,
  createSliceModalPage,
}) => {
  await sliceListPage.goto();
  await sliceListPage.openCreateModal();

  const randomInt = Math.floor(Math.random() * 1e9);
  const sliceName = "Slice" + randomInt;
  await createSliceModalPage.createSlice(sliceName);

  await expect(sliceDetailsPage.title).toBeVisible();
  await expect(sliceDetailsPage.title).toContainText(sliceName);

  await expect(sliceDetailsPage.staticZone.getByRole("listitem")).toHaveCount(
    0
  );
  await expect(
    sliceDetailsPage.repeatableZone.getByRole("listitem")
  ).toHaveCount(0);
});


test("Rename slice", async ({
  slice,
  sliceDetailsPage,
  sliceListPage,
  renameSliceModalPage
}) => {
  await sliceListPage.goto();
  await sliceListPage.openActionModal(slice.name, "Rename");

  const newSliceName = `${slice.name}Renamed`;
  await renameSliceModalPage.renameSlice(newSliceName);

  await expect(sliceListPage.getCard(slice.name)).not.toBeVisible();
  await expect(sliceListPage.getCard(newSliceName)).toBeVisible();
  await sliceListPage.clickCard(newSliceName);

  await expect(sliceDetailsPage.title).toContainText(newSliceName);
});


test("Delete slice", async ({
  slice,
  sliceListPage,
  deleteSliceModalPage,
  page
}) => {
  await sliceListPage.goto();
  await sliceListPage.openActionModal(slice.name, "Delete");

  await expect(deleteSliceModalPage.root.getByText(`/${slice.name}/`)).toBeVisible();
  await deleteSliceModalPage.deleteSlice();

  await expect(sliceListPage.getCard(slice.name)).not.toBeVisible();
  await page.reload();
  await expect(sliceListPage.getCard(slice.name)).not.toBeVisible();
});
