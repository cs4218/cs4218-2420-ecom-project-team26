import { expect, test } from "@playwright/test";

// Prevent parallel runs
test.describe.configure({ mode: "serial" });

let user;
let date;

test.describe("Cart Page - Logged In", () => {
  user = {
    name: "CS 4218 Test Account",
    email: "",
    password: "123456",
    phone: "81234567",
    address: "1 Computing Drive",
    dob: "2000-01-01",
    answer: "football",
  };

  let context;
  let page;

  date = new Date().toISOString().replaceAll(":", "_").replaceAll(":", "_");

  test.beforeAll(async ({ browser }, testInfo) => {
    // arrange
    user.email = `test_cart_${testInfo.project.name}_${date}@test.com`;

    context = await browser.newContext();
    page = await context.newPage();

    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Register" }).click();
    await page.getByPlaceholder("Enter Your Name").fill(user.name);
    await page.getByPlaceholder("Enter Your Email").fill(user.email);
    await page.getByPlaceholder("Enter Your Password").fill(user.password);
    await page.getByPlaceholder("Enter Your Phone").fill(user.phone);
    await page.getByPlaceholder("Enter Your Address").fill(user.address);
    await page.getByPlaceholder("Enter Your DOB").fill(user.dob);
    await page
      .getByPlaceholder("What is Your Favorite sports")
      .fill(user.answer);
    await page.getByRole("button", { name: "REGISTER" }).click();

    await expect(page.locator("h4", { hasText: "LOGIN FORM" })).toBeVisible();

    await page.getByPlaceholder("Enter Your Email").fill(user.email);
    await page.getByPlaceholder("Enter Your Password").fill(user.password);
    await page.getByRole("button", { name: "LOGIN" }).click();
  });

  test.beforeEach(async () => {
    // Reuse the same logged-in page for each test
    await page.bringToFront();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("user is able to add items to cart and it shows up on cart page", async () => {
    // act
    await page
      .locator(`.card:has-text("Novel")`)
      .getByRole("button", { name: "ADD TO CART" })
      .click();
    await page
      .locator(`.card:has-text("Novel")`)
      .getByRole("button", { name: "ADD TO CART" })
      .click();
    await page
      .locator(`.card:has-text("NUS T-shirt")`)
      .getByRole("button", { name: "ADD TO CART" })
      .click();
    await page.getByRole("link", { name: "Cart" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    // assert - one item has the name appear twice (once in name, once in desc)
    await expect(page.locator("p", { hasText: "Novel" })).toHaveCount(4);
    await expect(page.locator("p", { hasText: "NUS T-shirt" })).toHaveCount(2);
  });

  test("user is able to remove items from cart", async () => {
    // act
    await page
      .locator(`.card:has-text("Novel")`)
      .getByRole("button", { name: "Remove" })
      .first()
      .click();

    // delay to be safe
    await page.waitForTimeout(500);

    // assert
    await expect(page.locator("p", { hasText: "Novel" })).toHaveCount(2);
  });

  test("user is checkout items from cart and it appears in orders", async () => {
    // act
    await page.getByRole("button", { name: "Make Payment" }).click(); // necessary to load braintree
    await page.getByRole("button", { name: "Card" }).click();
    let frame = await page.frameLocator("iframe#braintree-hosted-field-number");
    await frame.locator("#credit-card-number").fill("4242424242424242");
    frame = await page.frameLocator(
      "iframe#braintree-hosted-field-expirationDate"
    );
    await frame.locator("#expiration").fill("02/28");
    frame = await page.frameLocator("iframe#braintree-hosted-field-cvv");
    await frame.locator("#cvv").fill("321");
    await page.getByRole("button", { name: "Make Payment" }).click();

    // delay to be safe
    await page.waitForTimeout(1000);

    // assert
    await expect(page.locator("h1", { hasText: "All Orders" })).toHaveCount(1); // necessary to ensure page loaded
    await expect(page.locator("p", { hasText: "Novel" })).toHaveCount(2);
    await expect(page.locator("p", { hasText: "NUS T-shirt" })).toHaveCount(2);
  });

  test("user is able to access update address page", async () => {
    // act
    await page.getByRole("link", { name: "Cart" }).click();
    await page.getByRole("button", { name: "Update Address" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    // assert
    await expect(page).toHaveURL(
      "http://localhost:3000/dashboard/user/profile"
    );
  });
});

test.describe("Cart Page - Logged Out", () => {
  test("logged out user is able to add items to cart and show up on cart page", async ({
    page,
  }) => {
    // act
    await page.goto("http://localhost:3000/");
    await page
      .locator(`.card:has-text("Novel")`)
      .getByRole("button", { name: "ADD TO CART" })
      .click();
    await page
      .locator(`.card:has-text("Novel")`)
      .getByRole("button", { name: "ADD TO CART" })
      .click();
    await page
      .locator(`.card:has-text("NUS T-shirt")`)
      .getByRole("button", { name: "ADD TO CART" })
      .click();
    await page.getByRole("link", { name: "Cart" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    // assert - one item has the name appear twice (once in name, once in desc)
    await expect(page.locator("p", { hasText: "Novel" })).toHaveCount(4);
    await expect(page.locator("p", { hasText: "NUS T-shirt" })).toHaveCount(2);
  });

  test("logged out user is able to remove items from cart", async ({
    page,
  }) => {
    // act
    await page.goto("http://localhost:3000/");
    await page
      .locator(`.card:has-text("Novel")`)
      .getByRole("button", { name: "ADD TO CART" })
      .click();
    await page
      .locator(`.card:has-text("Novel")`)
      .getByRole("button", { name: "ADD TO CART" })
      .click();
    await page
      .locator(`.card:has-text("NUS T-shirt")`)
      .getByRole("button", { name: "ADD TO CART" })
      .click();
    await page.getByRole("link", { name: "Cart" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    await page
      .locator(`.card:has-text("Novel")`)
      .getByRole("button", { name: "Remove" })
      .first()
      .click();

    // delay to be safe
    await page.waitForTimeout(500);

    // assert
    await expect(page.locator("p", { hasText: "Novel" })).toHaveCount(2);
    await expect(page.locator("p", { hasText: "NUS T-shirt" })).toHaveCount(2);
  });

  test("logged out user is able to press 'Please Login to checkout' button and go to login page", async ({
    page,
  }) => {
    // act
    await page.goto("http://localhost:3000/");
    await page
      .locator(`.card:has-text("Novel")`)
      .getByRole("button", { name: "ADD TO CART" })
      .click();
    await page.getByRole("link", { name: "Cart" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Plase Login to checkout" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    // assert
    await expect(page.locator("h4", { hasText: "LOGIN FORM" })).toHaveCount(1); // necessary to ensure page loaded
  });

  test("logged out user is able to see selected cart items after logging in from 'Please Login to checkout' button", async ({
    page,
  }, testInfo) => {
    // arrange
    user.email = `test_cart_${testInfo.project.name}_${date}@test.com`;

    // act
    await page.goto("http://localhost:3000/");
    await page
      .locator(`.card:has-text("Novel")`)
      .getByRole("button", { name: "ADD TO CART" })
      .click();
    await page
      .locator(`.card:has-text("NUS T-shirt")`)
      .getByRole("button", { name: "ADD TO CART" })
      .click();
    await page.getByRole("link", { name: "Cart" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Plase Login to checkout" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    await page.getByPlaceholder("Enter Your Email").fill(user.email);
    await page.getByPlaceholder("Enter Your Password").fill(user.password);
    await page.getByRole("button", { name: "LOGIN" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    // assert
    await expect(page).toHaveURL("http://localhost:3000/cart"); // necessary to ensure page loaded
    await expect(
      page.locator("h1", { hasText: `Hello ${user.name}` })
    ).toHaveCount(1);
    await expect(page.locator("p", { hasText: "Novel" })).toHaveCount(2);
    await expect(page.locator("p", { hasText: "NUS T-shirt" })).toHaveCount(2);
  });
});
