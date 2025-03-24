import { expect, test } from "@playwright/test";

// Prevent parallel runs
test.describe.configure({ mode: "serial" });

const date = new Date().toISOString().replaceAll(":", "_").replaceAll(":", "_");

// REGISTER
test.describe("Register Page", () => {
  // TODO: Ensure that this user's email does not exist in mongoDB
  test("user is able to create a new account", async ({ page }, testInfo) => {
    // arrange
    const newUser = {
      name: "CS 4218 Test Account",
      email: `test_user_${testInfo.project.name}_${date}@test.com`,
      password: "123456",
      phone: "81234567",
      address: "1 Computing Drive",
      dob: "2000-01-01",
      answer: "football",
    };

    // act
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Register" }).click();
    await page.getByPlaceholder("Enter Your Name").isEditable();
    await page.getByPlaceholder("Enter Your Name").fill(newUser.name);
    await page.getByPlaceholder("Enter Your Email").isEditable();
    await page.getByPlaceholder("Enter Your Email").fill(newUser.email);
    await page.getByPlaceholder("Enter Your Password").isEditable();
    await page.getByPlaceholder("Enter Your Password").fill(newUser.password);
    await page.getByPlaceholder("Enter Your Phone").isEditable();
    await page.getByPlaceholder("Enter Your Phone").fill(newUser.phone);
    await page.getByPlaceholder("Enter Your Address").isEditable();
    await page.getByPlaceholder("Enter Your Address").fill(newUser.address);
    await page.getByPlaceholder("Enter Your DOB").isEditable();
    await page.getByPlaceholder("Enter Your DOB").fill(newUser.dob);
    await page.getByPlaceholder("What is Your Favorite sports").click();
    await page
      .getByPlaceholder("What is Your Favorite sports")
      .fill(newUser.answer);
    await page.getByRole("button", { name: "REGISTER" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    // assert
    await expect(page.locator("h4", { hasText: "LOGIN FORM" })).toBeVisible();
  });
});

// LOGIN
test.describe("Login Page", () => {
  let user = {
    name: "CS 4218 Test Account",
    email: "",
    password: "123456",
    phone: "81234567",
    address: "1 Computing Drive",
    dob: "2000-01-01",
    answer: "football",
  };

  test("user is able to login & see profile info", async ({
    page,
  }, testInfo) => {
    // arrange
    user.email = `test_user_${testInfo.project.name}_${date}@test.com`;

    // act
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByPlaceholder("Enter Your Email").isEditable();
    await page.getByPlaceholder("Enter Your Email").fill(user.email);
    await page.getByPlaceholder("Enter Your Password").isEditable();
    await page.getByPlaceholder("Enter Your Password").fill(user.password);
    await page.getByRole("button", { name: "LOGIN" }).click();

    // necessary wait to ensure home page is loaded
    await page.waitForFunction(() => {
      const element = document.querySelector("h1.text-center");
      return element && element.textContent === "All Products";
    });

    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    // assert
    await expect(page.locator("h3", { hasText: user.name })).toBeVisible();
    await expect(page.locator("h3", { hasText: user.email })).toBeVisible();
    await expect(page.locator("h3", { hasText: user.address })).toBeVisible();
  });

  test("user is able to logout", async ({ page }, testInfo) => {
    // arrange
    user.email = `test_user_${testInfo.project.name}_${date}@test.com`;

    // act
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByPlaceholder("Enter Your Email").isEditable();
    await page.getByPlaceholder("Enter Your Email").fill(user.email);
    await page.getByPlaceholder("Enter Your Password").isEditable();
    await page.getByPlaceholder("Enter Your Password").fill(user.password);
    await page.getByRole("button", { name: "LOGIN" }).click();

    // necessary wait to ensure home page is loaded
    await page.waitForFunction(() => {
      const element = document.querySelector("h1.text-center");
      return element && element.textContent === "All Products";
    });

    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Logout" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    // assert
    await expect(page.locator("h3", { hasText: user.name })).not.toBeVisible();
    await expect(page.locator("h3", { hasText: user.email })).not.toBeVisible();
    await expect(
      page.locator("h3", { hasText: user.address })
    ).not.toBeVisible();
  });
});

// PROFILE
test.describe("Profile Page", () => {
  // arrange
  const user = {
    name: "CS 4218 Test Account",
    email: "",
    password: "123456",
    phone: "81234567",
    address: "1 Computing Drive",
    dob: "2000-01-01",
    answer: "football",
  };

  const newUser = {
    name: "New Account",
    email: "",
    password: "NewPassword",
    phone: "99998888",
    address: "New Address",
    dob: "2000-02-02",
    answer: "New Answer",
  };

  test.beforeEach(async ({ page }, testInfo) => {
    // arrange
    user.email = `test_user_${testInfo.project.name}_${date}@test.com`;
    newUser.email = `test_user_${testInfo.project.name}_${date}@test.com`;

    // Login before each test case and access the profile page
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByPlaceholder("Enter Your Email").isEditable();
    await page.getByPlaceholder("Enter Your Email").fill(user.email);
    await page.getByPlaceholder("Enter Your Password").isEditable();
    await page.getByPlaceholder("Enter Your Password").fill(user.password);
    await page.getByRole("button", { name: "LOGIN" }).click();

    // necessary wait to ensure home page is loaded
    await page.waitForFunction(() => {
      const element = document.querySelector("h1.text-center");
      return element && element.textContent === "All Products";
    });

    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    await page.getByRole("link", { name: "Profile" }).click();
  });

  test.afterEach(async ({ page }, testInfo) => {
    // arrange
    user.email = `test_user_${testInfo.project.name}_${date}@test.com`;
    newUser.email = `test_user_${testInfo.project.name}_${date}@test.com`;

    // Reset back user information after all each test case
    await page.goto("http://localhost:3000/dashboard/user/profile");
    await page.getByPlaceholder("Enter Your Name").fill(user.name);
    await page.getByPlaceholder("Enter Your Password").fill(user.password);
    await page.getByPlaceholder("Enter Your Phone").fill(user.phone);
    await page.getByPlaceholder("Enter Your Address").fill(user.address);
    await page.getByRole("button", { name: "UPDATE" }).click();
  });

  test("user is able to update their name", async ({ page }, testInfo) => {
    // arrange
    user.email = `test_user_${testInfo.project.name}_${date}@test.com`;
    newUser.email = `test_user_${testInfo.project.name}_${date}@test.com`;

    // act
    await page.getByPlaceholder("Enter Your Name").click();
    await page.getByPlaceholder("Enter Your Name").fill(newUser.name);
    await page.getByRole("button", { name: "UPDATE" }).click();

    // Refresh page
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    // assert
    await expect(page.locator("h3", { hasText: newUser.name })).toBeVisible();
    await page.getByRole("link", { name: "Profile" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    await expect(page.getByPlaceholder("Enter Your Name")).toHaveValue(
      newUser.name
    );
  });

  test("user is able to update their password", async ({ page }, testInfo) => {
    // arrange
    user.email = `test_user_${testInfo.project.name}_${date}@test.com`;
    newUser.email = `test_user_${testInfo.project.name}_${date}@test.com`;

    // act
    await page.getByPlaceholder("Enter Your Password").click();
    await page.getByPlaceholder("Enter Your Password").fill(newUser.password);
    await page.getByRole("button", { name: "UPDATE" }).click();

    // Re-log with new password
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Logout" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByPlaceholder("Enter Your Email").click();
    await page.getByPlaceholder("Enter Your Email").fill(user.email);
    await page.getByPlaceholder("Enter Your Password").click();
    await page.getByPlaceholder("Enter Your Password").fill(newUser.password);
    await page.getByRole("button", { name: "LOGIN" }).click();

    // necessary wait to ensure home page is loaded
    await page.waitForFunction(() => {
      const element = document.querySelector("h1.text-center");
      return element && element.textContent === "All Products";
    });

    // Check that we are logged into the right account
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();

    // assert
    await expect(page.locator("h3", { hasText: user.name })).toBeVisible();
    await expect(page.locator("h3", { hasText: user.email })).toBeVisible();
    await expect(page.locator("h3", { hasText: user.address })).toBeVisible();
  });

  test("user is able to update their phone number", async ({
    page,
  }, testInfo) => {
    // arrange
    user.email = `test_user_${testInfo.project.name}_${date}@test.com`;
    newUser.email = `test_user_${testInfo.project.name}_${date}@test.com`;

    // act
    await page.getByPlaceholder("Enter Your Phone").click();
    await page.getByPlaceholder("Enter Your Phone").fill(newUser.phone);
    await page.getByRole("button", { name: "UPDATE" }).click();

    // Refresh page
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    await page.getByRole("link", { name: "Profile" }).click();

    // assert
    await expect(page.getByPlaceholder("Enter Your Phone")).toHaveValue(
      newUser.phone
    );
  });

  test("user is able to update their address", async ({ page }, testInfo) => {
    // arrange
    user.email = `test_user_${testInfo.project.name}_${date}@test.com`;
    newUser.email = `test_user_${testInfo.project.name}_${date}@test.com`;

    // act
    await page.getByPlaceholder("Enter Your Address").click();
    await page.getByPlaceholder("Enter Your Address").fill(newUser.address);
    await page.getByRole("button", { name: "UPDATE" }).click();

    // Refresh page
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();

    // delay to be safe
    await page.waitForTimeout(500);

    await page.getByRole("link", { name: "Profile" }).click();

    // assert
    await expect(page.getByPlaceholder("Enter Your Address")).toHaveValue(
      newUser.address
    );
  });
});
