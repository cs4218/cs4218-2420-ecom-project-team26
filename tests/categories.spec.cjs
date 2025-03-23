import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" }); // Parallel causes weird lag so do in serial

// Mock API responses to better control data that is displayed for consistency
const mockGetCategory = {
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({
    success: true,
    message: "All Categories List",
    category: [
      {
        _id: "1",
        name: "Electronics",
        slug: "electronics",
        __v: 0,
      },
      {
        _id: "2",
        name: "Lifestyle",
        slug: "lifestyle",
        __v: 0,
      },
      {
        _id: "3",
        name: "Books",
        slug: "books",
        __v: 0,
      },
    ],
  }),
};

// Mock API response mimicking an empty response
const mockEmptyResponse = {
  status: 404,
  contentType: "application/json",
  body: JSON.stringify({
    success: false,
    message: "This is a mock empty response",
  }),
};

test("should display 3 categories to user", async ({ page }) => {
  // Intercept API requests and provide mock data
  await page.route("**/api/v1/category/get-category", (route) => {
    route.fulfill(mockGetCategory);
  });

  // Go to page
  await page.goto("http://localhost:3000/categories");

  // Verify that 3 categories are displayed
  await expect(page.locator("a.btn.btn-primary")).toHaveCount(3);

  // Check the category names
  await expect(
    page.locator("a.btn.btn-primary", { hasText: "Electronics" })
  ).toBeVisible();
  await expect(
    page.locator("a.btn.btn-primary", { hasText: "Lifestyle" })
  ).toBeVisible();
  await expect(
    page.locator("a.btn.btn-primary", { hasText: "Books" })
  ).toBeVisible();
});

test("should navigate to categoryProduct page on selecting a category", async ({
  page,
}) => {
  // Intercept API requests and provide mock data
  await page.route("**/api/v1/category/get-category", (route) => {
    route.fulfill(mockGetCategory);
  });

  // Go to page
  await page.goto("http://localhost:3000/categories");

  // Verify that 3 categories are displayed
  await expect(page.locator("a.btn.btn-primary")).toHaveCount(3);

  // Wait for Electronics category to be visible and click
  const electronicsButton = page.locator("a.btn.btn-primary", {
    hasText: "Electronics",
  });
  await expect(electronicsButton).toBeVisible();
  await electronicsButton.click();

  // Verify page navigation to category product page
  await expect(page).toHaveURL("http://localhost:3000/category/electronics");
});
