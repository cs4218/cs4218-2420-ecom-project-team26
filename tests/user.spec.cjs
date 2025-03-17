import { expect, test } from "@playwright/test";

// Prevent parallel runs
test.describe.configure({ mode: "serial" });

// REGISTER
test.describe("Register Page", () => {
  // TODO: Ensure that this user's email does not exist in mongoDB
  test("user is able to create a new account and login", async ({
    page,
  }, testInfo) => {
    const newUser = {
      name: "CS 4218 Test Account",
      email: `test_${testInfo.project.name}_${new Date()
        .toISOString()
        .replaceAll(":", "_")
        .replaceAll(":", "_")}@test.com`,
      password: "123456",
      phone: "81234567",
      address: "1 Computing Drive",
      dob: "2000-01-01",
      answer: "football",
    };

    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Register" }).click();
    await page.getByPlaceholder("Enter Your Name").click();
    await page.getByPlaceholder("Enter Your Name").fill(newUser.name);
    await page.getByPlaceholder("Enter Your Email").click();
    await page.getByPlaceholder("Enter Your Email").fill(newUser.email);
    await page.getByPlaceholder("Enter Your Password").click();
    await page.getByPlaceholder("Enter Your Password").fill(newUser.password);
    await page.getByPlaceholder("Enter Your Phone").click();
    await page.getByPlaceholder("Enter Your Phone").fill(newUser.phone);
    await page.getByPlaceholder("Enter Your Address").click();
    await page.getByPlaceholder("Enter Your Address").fill(newUser.address);
    await page.getByPlaceholder("Enter Your DOB").click();
    await page.getByPlaceholder("Enter Your DOB").fill(newUser.dob);
    await page.getByPlaceholder("What is Your Favorite sports").click();
    await page
      .getByPlaceholder("What is Your Favorite sports")
      .fill(newUser.answer);
    await page.getByRole("button", { name: "REGISTER" }).click();
    await expect(page.locator("h4", { hasText: "LOGIN FORM" })).toBeVisible();
  });
});

// LOGIN
test.describe("Login Page", () => {
  // TODO: Make sure that the account exist with these info, it's the default admin account
  const user = {
    name: "CS 4218 Test Account",
    email: "cs4218@test.com",
    password: "cs4218@test.com",
    phone: "81234567",
    address: "1 Computing Drive",
    dob: "2000-01-01",
    answer: "password is cs4218@test.com",
  };

  test("user is able to login & see profile info", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByPlaceholder("Enter Your Email").click();
    await page.getByPlaceholder("Enter Your Email").fill(user.email);
    await page.getByPlaceholder("Enter Your Password").click();
    await page.getByPlaceholder("Enter Your Password").fill(user.password);
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page.locator("h3", { hasText: user.name })).toBeVisible();
    await expect(page.locator("h3", { hasText: user.email })).toBeVisible();
    await expect(page.locator("h3", { hasText: user.address })).toBeVisible();
  });

  test("user is able to logout", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByPlaceholder("Enter Your Email").click();
    await page.getByPlaceholder("Enter Your Email").fill(user.email);
    await page.getByPlaceholder("Enter Your Password").click();
    await page.getByPlaceholder("Enter Your Password").fill(user.password);
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Logout" }).click();
    await expect(page.locator("h3", { hasText: user.name })).not.toBeVisible();
    await expect(page.locator("h3", { hasText: user.email })).not.toBeVisible();
    await expect(
      page.locator("h3", { hasText: user.address })
    ).not.toBeVisible();
  });
});

// PROFILE
test.describe("Profile Page", () => {
  // TODO: Make sure that the account exist with these info, it's the default admin account
  const user = {
    name: "CS 4218 Test Account",
    email: "cs4218@test.com",
    password: "cs4218@test.com",
    phone: "81234567",
    address: "1 Computing Drive",
    dob: "2000-01-01",
    answer: "password is cs4218@test.com",
  };

  const newUser = {
    name: "New Account",
    email: "cs4218@test.com",
    password: "NewPassword",
    phone: "99998888",
    address: "New Address",
    dob: "2000-02-02",
    answer: "New Answer",
  };

  test.beforeEach(async ({ page }) => {
    // Login before each test case and access the profile page
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByPlaceholder("Enter Your Email").click();
    await page.getByPlaceholder("Enter Your Email").fill(user.email);
    await page.getByPlaceholder("Enter Your Password").click();
    await page.getByPlaceholder("Enter Your Password").fill(user.password);
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByRole("link", { name: "Profile" }).click();
  });

  test.afterEach(async ({ page }) => {
    // Reset back user information after all each test case
    await page.goto("http://localhost:3000/dashboard/user/profile");
    await page.getByPlaceholder("Enter Your Name").click();
    await page.getByPlaceholder("Enter Your Name").fill(user.name);
    await page.getByPlaceholder("Enter Your Password").click();
    await page.getByPlaceholder("Enter Your Password").fill(user.password);
    await page.getByPlaceholder("Enter Your Phone").click();
    await page.getByPlaceholder("Enter Your Phone").fill(user.phone);
    await page.getByPlaceholder("Enter Your Address").click();
    await page.getByPlaceholder("Enter Your Address").fill(user.address);
    await page.getByRole("button", { name: "UPDATE" }).click();
  });

  test("user is able to update their name", async ({ page }) => {
    await page.getByPlaceholder("Enter Your Name").click();
    await page.getByPlaceholder("Enter Your Name").fill(newUser.name);
    await page.getByRole("button", { name: "UPDATE" }).click();

    // Refresh page
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page.locator("h3", { hasText: newUser.name })).toBeVisible();
    await page.getByRole("link", { name: "Profile" }).click();
    await expect(page.getByPlaceholder("Enter Your Name")).toHaveValue(
      newUser.name
    );
  });

  test("user is able to update their password", async ({ page }) => {
    await page.getByPlaceholder("Enter Your Password").click();
    await page.getByPlaceholder("Enter Your Password").fill(newUser.password);
    await page.getByRole("button", { name: "UPDATE" }).click();

    // Re-log with new password
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Logout" }).click();
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByPlaceholder("Enter Your Email").click();
    await page.getByPlaceholder("Enter Your Email").fill(user.email);
    await page.getByPlaceholder("Enter Your Password").click();
    await page.getByPlaceholder("Enter Your Password").fill(newUser.password);
    await page.getByRole("button", { name: "LOGIN" }).click();

    // Check that we are logged into the right account
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page.locator("h3", { hasText: user.name })).toBeVisible();
    await expect(page.locator("h3", { hasText: user.email })).toBeVisible();
    await expect(page.locator("h3", { hasText: user.address })).toBeVisible();
  });

  test("user is able to update their phone number", async ({ page }) => {
    await page.getByPlaceholder("Enter Your Phone").click();
    await page.getByPlaceholder("Enter Your Phone").fill(newUser.phone);
    await page.getByRole("button", { name: "UPDATE" }).click();

    // Refresh page
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByRole("link", { name: "Profile" }).click();
    await expect(page.getByPlaceholder("Enter Your Phone")).toHaveValue(
      newUser.phone
    );
  });

  test("user is able to update their address", async ({ page }) => {
    await page.getByPlaceholder("Enter Your Address").click();
    await page.getByPlaceholder("Enter Your Address").fill(newUser.address);
    await page.getByRole("button", { name: "UPDATE" }).click();

    // Refresh page
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByRole("link", { name: "Profile" }).click();
    await expect(page.getByPlaceholder("Enter Your Address")).toHaveValue(
      newUser.address
    );
  });
});
