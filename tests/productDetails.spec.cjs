import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" }); // Parallel causes weird lag so do in serial

// Mock API responses to better control data that is displayed for consistency
const mockGetProduct = {
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({
    success: true,
    message: "Single Product Fetched",
    product: {
      _id: "1",
      name: "Nintendo Switch",
      slug: "Nintendo-switch",
      description: "Mock description for nintendo switch.",
      price: 350,
      category: {
        _id: "2",
        name: "Electronics",
        slug: "electronics",
        __v: 0,
      },
      quantity: 1,
      createdAt: "2025-03-08T13:06:38.016Z",
      updatedAt: "2025-03-08T13:06:38.016Z",
      __v: 0,
    },
  }),
};

const mockGetRelatedProduct = {
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({
    success: true,
    products: [
      {
        _id: "2",
        name: "Macbook Pro",
        slug: "Macbook-Pro",
        description: "Mock description for macbook pro.",
        price: 2000,
        category: {
          _id: "2",
          name: "Electronics",
          slug: "electronics",
          __v: 0,
        },
        quantity: 1,
        createdAt: "2025-02-05T07:17:41.922Z",
        updatedAt: "2025-02-05T07:18:18.020Z",
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

test("should display product details and related products to user", async ({
  page,
}) => {
  // Intercept API requests and provide mock data
  await page.route("**/api/v1/product/get-product/nintendo-switch", (route) => {
    route.fulfill(mockGetProduct);
  });

  await page.route("**/api/v1/product/related-product/1/2", (route) => {
    route.fulfill(mockGetRelatedProduct);
  });

  // Go to page
  await page.goto("http://localhost:3000/product/nintendo-switch");

  // Check page header
  await expect(page.locator("h1.text-center")).toHaveText("Product Details");

  // Check if there are exactly 4 h6 elements for product name, description, price and category
  const h6Elements = page.locator("h6");
  await expect(h6Elements).toHaveCount(4);

  // Verify the content for each product detail
  await expect(h6Elements.nth(0)).toHaveText(`Name : Nintendo Switch`);
  await expect(h6Elements.nth(1)).toHaveText(
    `Description : Mock description for nintendo switch.`
  );
  await expect(h6Elements.nth(2)).toHaveText(`Price :$350.00`);
  await expect(h6Elements.nth(3)).toHaveText(`Category : Electronics`);

  // Check if Add to Cart button is present
  const addToCartButton = page.locator("button.btn.btn-secondary.ms-1", {
    hasText: "ADD TO CART",
  });
  await expect(addToCartButton).toBeVisible();

  // Check if similar products are shown
  await expect(page.locator("h4:not([class])")).toHaveText(
    "Similar Products ➡️"
  );
  await expect(page.locator("h5.card-title").first()).toHaveText("Macbook Pro");
  await expect(page.locator("h5.card-title.card-price")).toHaveText(
    "$2,000.00"
  );
});

test("should let user add product to cart and show success", async ({
  page,
}) => {
  // Intercept API requests and provide mock data
  await page.route("**/api/v1/product/get-product/nintendo-switch", (route) => {
    route.fulfill(mockGetProduct);
  });

  await page.route("**/api/v1/product/related-product/1/2", (route) => {
    route.fulfill(mockGetRelatedProduct);
  });

  // Go to page
  await page.goto("http://localhost:3000/product/nintendo-switch");

  // Check if Add to Cart button is present
  const addToCartButton = page.locator("button.btn.btn-secondary.ms-1", {
    hasText: "ADD TO CART",
  });
  await expect(addToCartButton).toBeVisible();

  // Click the "Add to Cart" button for first product (Nintendo Switch)
  await page.locator('button:has-text("Add to Cart")').first().click();

  // Verify success toast message shows up
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

test("should let user add similar product to cart and show success", async ({
  page,
}) => {
  // Intercept API requests and provide mock data
  await page.route("**/api/v1/product/get-product/nintendo-switch", (route) => {
    route.fulfill(mockGetProduct);
  });

  await page.route("**/api/v1/product/related-product/1/2", (route) => {
    route.fulfill(mockGetRelatedProduct);
  });

  // Go to page
  await page.goto("http://localhost:3000/product/nintendo-switch");

  // Find and click the "ADD TO CART" button for a similar product
  const similarProductButton = page.locator(
    ".similar-products .card .btn-dark"
  );
  await similarProductButton.first().click();

  // Verify success toast message shows up
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
    name: "Macbook Pro",
    price: 2000,
  });
});

test("should navigate to similar product's detail page on clicking 'More Details'", async ({
  page,
}) => {
  // Intercept API requests and provide mock data
  await page.route("**/api/v1/product/get-product/nintendo-switch", (route) => {
    route.fulfill(mockGetProduct);
  });

  await page.route("**/api/v1/product/related-product/1/2", (route) => {
    route.fulfill(mockGetRelatedProduct);
  });

  // Go to page
  await page.goto("http://localhost:3000/product/nintendo-switch");

  // Find and click the "More Details" button for similar product
  const moreDetailsButton = page.locator(".similar-products .card .btn-info");
  await moreDetailsButton.first().click();

  // Verify page navigation to product detail page
  await expect(page).toHaveURL("http://localhost:3000/product/Macbook-Pro");
});
