import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" }); // Parallel causes weird lag so do in serial

// Mock API responses to better control data that is displayed for consistency
const mockGetAllCategory = {
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
    ],
  }),
};

const mockGetAllProducts = {
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({
    success: true,
    products: [
      {
        _id: "1",
        name: "Nintendo Switch",
        slug: "Nintendo-switch",
        description: "Mock description for nintendo switch.",
        price: 350,
        category: "1",
        quantity: 1,
        createdAt: "2025-03-08T13:06:38.016Z",
        updatedAt: "2025-03-08T13:06:38.016Z",
        __v: 0,
      },
      {
        _id: "2",
        name: "Handheld Mini Fan",
        slug: "Handheld-Mini-Fan",
        description: "Mock description for handheld mini fan.",
        price: 20,
        category: "2",
        quantity: 1,
        createdAt: "2025-02-05T07:20:08.615Z",
        updatedAt: "2025-02-05T07:20:28.767Z",
        __v: 0,
      },
    ],
  }),
};

const mockFilterProduct = {
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({
    success: true,
    products: [
      {
        _id: "1",
        name: "Nintendo Switch",
        slug: "Nintendo-switch",
        description: "Mock description for nintendo switch.",
        price: 350,
        category: "1",
        quantity: 1,
        createdAt: "2025-03-08T13:06:38.016Z",
        updatedAt: "2025-03-08T13:06:38.016Z",
        __v: 0,
      },
    ],
  }),
};

const mockGetTotal = {
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({ success: true, total: 4 }),
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

test("should display 2 products to user", async ({ page }) => {
  // Intercept API requests and provide mock data
  await page.route("**/api/v1/category/get-category", (route) => {
    route.fulfill(mockGetAllCategory);
  });

  await page.route("**/api/v1/product/product-list/1", (route) => {
    route.fulfill(mockGetAllProducts);
  });

  await page.route("**/api/v1/product/product-count", (route) => {
    route.fulfill(mockGetTotal);
  });

  // Go to page
  await page.goto("http://localhost:3000");

  // Check for page headers
  await expect(page.locator("h1.text-center")).toHaveText("All Products");
  await expect(page.locator(".card")).toHaveCount(2);

  // Check 2 products visible
  await expect(
    page.locator(".card-title", { hasText: "Nintendo Switch" })
  ).toBeVisible();
  await expect(
    page.locator(".card-text", {
      hasText: "Mock description for nintendo switch.",
    })
  ).toBeVisible();
  await expect(page.locator(".card-price", { hasText: "$350" })).toBeVisible();

  await expect(
    page.locator(".card-title", { hasText: "Handheld Mini Fan" })
  ).toBeVisible();
  await expect(
    page.locator(".card-text", {
      hasText: "Mock description for handheld mini fan.",
    })
  ).toBeVisible();
  await expect(page.locator(".card-price", { hasText: "$20" })).toBeVisible();
});

test("should allow user to filter products by category", async ({ page }) => {
  // Intercept API requests and provide mock data
  await page.route("**/api/v1/category/get-category", (route) => {
    route.fulfill(mockGetAllCategory);
  });

  await page.route("**/api/v1/product/product-list/1", (route) => {
    route.fulfill(mockGetAllProducts);
  });

  await page.route("**/api/v1/product/product-count", (route) => {
    route.fulfill(mockGetTotal);
  });

  await page.route("**/api/v1/product/product-filters", (route) => {
    route.fulfill(mockFilterProduct);
  });

  // Go to page
  await page.goto("http://localhost:3000");

  // Check for page headers
  await expect(page.locator("h1.text-center")).toHaveText("All Products");

  // Locate checkboxes and check if they are present
  const electronicsCheckbox = page.locator(
    'label:has-text("Electronics") input[type="checkbox"]'
  );
  const lifestyleCheckbox = page.locator(
    'label:has-text("Lifestyle") input[type="checkbox"]'
  );
  await expect(electronicsCheckbox).toBeVisible();
  await expect(lifestyleCheckbox).toBeVisible();

  // Verify checkbox can be clicked
  await electronicsCheckbox.click();
  await expect(electronicsCheckbox).toBeChecked();

  // Wait for filtered products to load and verify there's only 1
  await page.waitForTimeout(2000); // delay here just to be safe
  await expect(page.locator(".card")).toHaveCount(1);
  await expect(
    page.locator(".card-title", { hasText: "Nintendo Switch" })
  ).toBeVisible();
  await expect(
    page.locator(".card-text", {
      hasText: "Mock description for nintendo switch.",
    })
  ).toBeVisible();
  await expect(page.locator(".card-price", { hasText: "$350" })).toBeVisible();
});

test("should allow user to filter products by price", async ({ page }) => {
  // Intercept API requests and provide mock data
  await page.route("**/api/v1/category/get-category", (route) => {
    route.fulfill(mockGetAllCategory);
  });

  await page.route("**/api/v1/product/product-list/1", (route) => {
    route.fulfill(mockGetAllProducts);
  });

  await page.route("**/api/v1/product/product-count", (route) => {
    route.fulfill(mockGetTotal);
  });

  await page.route("**/api/v1/product/product-filters", (route) => {
    route.fulfill(mockFilterProduct);
  });

  // Go to page
  await page.goto("http://localhost:3000");

  // Check for page headers
  await expect(page.locator("h1.text-center")).toHaveText("All Products");

  // Locate radio button and check if present
  const priceRadio = page.locator(
    'label:has-text("$100 or more") input[type="radio"]'
  );
  await expect(priceRadio).toBeVisible();

  // Verify radio can be clicked
  await priceRadio.click();
  await expect(priceRadio).toBeChecked();

  // Wait for filtered products to load and verify there's only 1
  await page.waitForTimeout(2000); // delay here just to be safe
  await expect(page.locator(".card")).toHaveCount(1);
  await expect(
    page.locator(".card-title", { hasText: "Nintendo Switch" })
  ).toBeVisible();
  await expect(
    page.locator(".card-text", {
      hasText: "Mock description for nintendo switch.",
    })
  ).toBeVisible();
  await expect(page.locator(".card-price", { hasText: "$350" })).toBeVisible();
});

test("should allow user to reset filters", async ({ page }) => {
  // Intercept API requests and provide mock data
  await page.route("**/api/v1/category/get-category", (route) => {
    route.fulfill(mockGetAllCategory);
  });

  await page.route("**/api/v1/product/product-list/1", (route) => {
    route.fulfill(mockGetAllProducts);
  });

  await page.route("**/api/v1/product/product-count", (route) => {
    route.fulfill(mockGetTotal);
  });

  await page.route("**/api/v1/product/product-filters", (route) => {
    route.fulfill(mockFilterProduct);
  });

  // Go to page
  await page.goto("http://localhost:3000");

  // Check for page headers
  await expect(page.locator("h1.text-center")).toHaveText("All Products");

  // Locate checkboxes and check if they are present
  const electronicsCheckbox = page.locator(
    'label:has-text("Electronics") input[type="checkbox"]'
  );
  const lifestyleCheckbox = page.locator(
    'label:has-text("Lifestyle") input[type="checkbox"]'
  );
  await expect(electronicsCheckbox).toBeVisible();
  await expect(lifestyleCheckbox).toBeVisible();

  // Verify checkbox can be clicked
  await electronicsCheckbox.click();
  await expect(electronicsCheckbox).toBeChecked();

  // Wait for filtered products to load and verify there's only 1
  await page.waitForTimeout(2000); // delay here just to be safe
  await expect(page.locator(".card")).toHaveCount(1);
  await expect(
    page.locator(".card-title", { hasText: "Nintendo Switch" })
  ).toBeVisible();
  await expect(
    page.locator(".card-text", {
      hasText: "Mock description for nintendo switch.",
    })
  ).toBeVisible();
  await expect(page.locator(".card-price", { hasText: "$350" })).toBeVisible();

  // Click the "RESET FILTERS" button to reset the filters
  await page.locator('button:has-text("RESET FILTERS")').click();

  // Wait for page to load products without filters
  await page.waitForTimeout(2000);

  // Verify checkboxes and radio buttons are unchecked
  await expect(page.locator('input[type="checkbox"]:checked')).toHaveCount(0);
  await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);

  // Verify correct products displayed
  await expect(page.locator(".card")).toHaveCount(2);
});

test("should navigate to product details page on clicking 'More Details'", async ({
  page,
}) => {
  // Intercept API requests and provide mock data
  await page.route("**/api/v1/category/get-category", (route) => {
    route.fulfill(mockGetAllCategory);
  });

  await page.route("**/api/v1/product/product-list/1", (route) => {
    route.fulfill(mockGetAllProducts);
  });

  await page.route("**/api/v1/product/product-count", (route) => {
    route.fulfill(mockGetTotal);
  });

  await page.route("**/api/v1/product/product-filters", (route) => {
    route.fulfill(mockFilterProduct);
  });

  // Go to page
  await page.goto("http://localhost:3000");

  // Check for page headers
  await expect(page.locator("h1.text-center")).toHaveText("All Products");

  // Locate checkboxes and check if they are present
  const electronicsCheckbox = page.locator(
    'label:has-text("Electronics") input[type="checkbox"]'
  );
  const lifestyleCheckbox = page.locator(
    'label:has-text("Lifestyle") input[type="checkbox"]'
  );
  await expect(electronicsCheckbox).toBeVisible();
  await expect(lifestyleCheckbox).toBeVisible();

  // Verify checkbox can be clicked
  await electronicsCheckbox.click();
  await expect(electronicsCheckbox).toBeChecked();

  // Click the "More Details" button inside the product card
  const productCard = page.locator(".card", { hasText: "Nintendo Switch" });
  await expect(productCard).toBeVisible();
  await productCard
    .locator("button.btn-info", { hasText: "More Details" })
    .click();

  // Verify page navigation to product detail page
  await expect(page).toHaveURL("http://localhost:3000/product/Nintendo-switch");
});

test("should add product to cart and show success toast", async ({ page }) => {
  await page.route("**/api/v1/category/get-category", (route) =>
    route.fulfill(mockGetAllCategory)
  );

  await page.route("**/api/v1/product/product-list/1", (route) =>
    route.fulfill(mockGetAllProducts)
  );

  await page.route("**/api/v1/product/product-count", (route) =>
    route.fulfill(mockGetTotal)
  );

  await page.goto("http://localhost:3000");

  // Verify products are displayed
  await expect(page.locator(".card")).toHaveCount(2);

  // Click the "Add to Cart" button for first product (Nintendo Switch)
  await page.locator('button:has-text("Add to Cart")').first().click();

  // Verify that success toast message is visible
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Item Added to cart$/ })
      .nth(2)
  ).toBeVisible();

  // Verify cart has been updated
  const cart = await page.evaluate(() => localStorage.getItem("cart"));
  const cartItems = JSON.parse(cart);

  // Verify cart contains the added product
  expect(cartItems).toHaveLength(1);
  expect(cartItems[0]).toMatchObject({
    name: "Nintendo Switch",
    price: 350,
  });
});
