import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" }); // Parallel causes weird lag so do in serial

test("Footer links are visible and navigate correctly", async ({ page }) => {
  await page.goto("http://localhost:3000");

  // Check footer links are visible
  const aboutLink = page.locator('a[href="/about"]');
  const contactLink = page.locator('a[href="/contact"]');
  const privacyPolicyLink = page.locator('a[href="/policy"]');
  await expect(aboutLink).toBeVisible();
  await expect(contactLink).toBeVisible();
  await expect(privacyPolicyLink).toBeVisible();

  // Check "About" link redirects correctly
  await aboutLink.click();
  await expect(page).toHaveURL("http://localhost:3000/about");
  //   await page.goto("http://localhost:3000");

  // Check "Contact" link redirects correctly
  await contactLink.click();
  await expect(page).toHaveURL("http://localhost:3000/contact");
  //   await page.goto("http://localhost:3000");

  // Check "Privacy Policy" link redirects correctly
  await privacyPolicyLink.click(); // Click the Privacy Policy link
  await expect(page).toHaveURL("http://localhost:3000/policy"); // Check if the page URL is correct
});
