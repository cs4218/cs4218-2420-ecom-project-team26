import { expect, test } from "@playwright/test";

// test.describe.configure({ mode: "serial" });

// Mock API response to better control data that is displayed for consistency
const mockResponse = {
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({
    success: true,
    products: [
      {
        _id: "1",
        name: "Nintendo Switch",
        slug: "Nintendo-switch",
        description: "Mock description for nintendo switch",
        price: 350,
        category: {
          _id: "67a3104b554c32e2e3e6f9aa",
          name: "Electronics",
          slug: "electronics",
        },
        quantity: 1,
      },
    ],
    category: {
      _id: "67a3104b554c32e2e3e6f9aa",
      name: "Electronics",
      slug: "electronics",
    },
  }),
};

// Mock APi response mimicking a 'wrong' response if user tries to modify url
const mockEmptyResponse = {
  status: 404,
  contentType: "application/json",
  body: JSON.stringify({
    success: false,
    message: "No products found for this category",
  }),
};

test("should display mocked product", async ({ page }) => {
  // Intercept API request and provide mocked data
  await page.route(
    "**/api/v1/product/product-category/electronics",
    (route) => {
      route.fulfill(mockResponse);
    }
  );

  // Go to page
  await page.goto("http://localhost:3000/category/electronics");

  // Check for page headers
  await expect(page.locator(".category h4.text-center")).toHaveText(
    "Category - Electronics"
  );
  await expect(page.locator(".category h6.text-center")).toHaveText(
    "1 result found"
  );

  // Check product visible
  await expect(
    page.locator(".card-title", { hasText: "Nintendo Switch" })
  ).toBeVisible();
  await expect(
    page.locator(".card-text", {
      hasText: "Mock description for nintendo switch",
    })
  ).toBeVisible();
  await expect(page.locator(".card-price", { hasText: "$350" })).toBeVisible();
});

test("should display 0 result found if user tries to input nonexistent category in url", async ({
  page,
}) => {
  // Intercept API request and provide mocked data
  await page.route("**/api/v1/product/product-category/plants", (route) => {
    route.fulfill(mockEmptyResponse);
  });

  // Go to page
  await page.goto("http://localhost:3000/category/plants");

  // Check for page headers
  await expect(page.locator(".category h4.text-center")).toHaveText(
    "Category - plants"
  );
  await expect(page.locator(".category h6.text-center")).toHaveText(
    "0 result found"
  );
});

test("should navigate to product details page on clicking 'More Details'", async ({
  page,
}) => {
  // Intercept API request and provide mocked data
  await page.route(
    "**/api/v1/product/product-category/electronics",
    (route) => {
      route.fulfill(mockResponse);
    }
  );

  // Go to page
  await page.goto("http://localhost:3000/category/electronics");

  // Wait for product to appear
  const productCard = page.locator(".card", { hasText: "Nintendo Switch" });
  await expect(productCard).toBeVisible();

  // Click the "More Details" button inside the product card
  await productCard
    .locator("button.btn-info", { hasText: "More Details" })
    .click();

  await expect(page).toHaveURL("http://localhost:3000/product/Nintendo-switch");
});
