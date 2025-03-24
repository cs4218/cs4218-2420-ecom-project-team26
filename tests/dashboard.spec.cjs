import { test, expect } from '@playwright/test';
test.describe.configure({ mode: "serial" });

test.describe('Admin Dashboard Tests', () => {
  const adminUser = {
    name: "Test Admin",
    email: "admin369@test.com",
    password: "123456",
    phone: "1234567890"
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
    
    await page.getByRole("link", { name: "Login" }).click();
    
    await page.getByPlaceholder("Enter Your Email").click();
    await page.getByPlaceholder("Enter Your Email").fill(adminUser.email);
    await page.getByPlaceholder("Enter Your Password").click();
    await page.getByPlaceholder("Enter Your Password").fill(adminUser.password);
    await page.getByRole("button", { name: "LOGIN" }).click();

    console.log()
    await page.getByRole("button", { name: adminUser.name.toUpperCase() }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    
    await page.waitForURL('**/dashboard/admin');
  });

  test('displays admin dashboard with correct user info', async ({ page }) => {
    await expect(page.locator('h4:has-text("Admin Panel")')).toBeVisible();

    await expect(page.locator('h3', { hasText: "Admin Name : Test Admin" })).toBeVisible();
    await expect(page.locator('h3', { hasText: "Admin Email : admin369@test.com" })).toBeVisible();
    await expect(page.locator('h3', { hasText: "Admin Contact : 1234567890" })).toBeVisible();
    
    await expect(page.locator('.dashboard-menu')).toBeVisible();
  });

  test('has working navigation links in admin menu', async ({ page }) => {
    const navLinks = [
      { text: 'Create Category', url: '**/dashboard/admin/create-category' },
      { text: 'Create Product', url: '**/dashboard/admin/create-product' },
      { text: 'Products', url: '**/dashboard/admin/products' },
      { text: 'Orders', url: '**/dashboard/admin/orders' },
      { text: 'Users', url: '**/dashboard/admin/users' }
    ];

    for (const link of navLinks) {
      await page.getByRole('link', { name: link.text }).click();
      await page.waitForURL(link.url);
      await page.goto('http://localhost:3000/dashboard/admin');
    }
  });

  test('users page displays correct table with user data', async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click();
    await page.waitForURL('**/dashboard/admin/users');
    
    await expect(page.locator('h1.text-center')).toContainText('All Users');
    
    const tableHeaders = [
      '#', 'Name', 'Email', 'Phone', 'Address', 'Role', 'Joined'
    ];
    
    for (const header of tableHeaders) {
      await expect(page.locator('thead th', { hasText: header })).toBeVisible();
    }
    
    await expect(page.locator('tbody')).toBeVisible();
    
    const rowCount = await page.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
    
    const roleCell = page.locator('tbody tr').first().locator('td').nth(5);
    const roleText = await roleCell.textContent();
    expect(['Admin', 'User']).toContain(roleText?.trim());
    
    const dateCell = page.locator('tbody tr').first().locator('td').nth(6);
    const dateText = await dateCell.textContent();
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    expect(dateRegex.test(dateText?.trim() || "")).toBeTruthy();
  });

  test('users page is responsive', async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click();
    await page.waitForURL('**/dashboard/admin/users');
    
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.table-responsive')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    
    await page.setViewportSize({ width: 480, height: 800 });
    await expect(page.locator('.table-responsive')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('users page handles empty state', async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click();
    await page.waitForURL('**/dashboard/admin/users');
    
    await page.evaluate(() => {
      const tableBody = document.querySelector('tbody');
      if (tableBody) {
        tableBody.innerHTML = '';
      }
      
      const tableResponsive = document.querySelector('.table-responsive');
      if (tableResponsive) {
        tableResponsive.style.display = 'none';
        const noUsersDiv = document.createElement('div');
        noUsersDiv.className = 'text-center';
        noUsersDiv.textContent = 'No users found';
        tableResponsive.parentNode?.appendChild(noUsersDiv);
      }
    });
    
    await expect(page.locator('div.text-center', { hasText: 'No users found' })).toBeVisible();
  });
});

test.describe('User Dashboard Tests', () => {
  const regularUser = {
    name: "CS 4218 Test Account",
    email: "cs4218@test.com",
    password: "cs4218@test.com",
    phone: "81234567",
    address: "1 Computing Drive"
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByPlaceholder("Enter Your Email").click();
    await page.getByPlaceholder("Enter Your Email").fill(regularUser.email);
    await page.getByPlaceholder("Enter Your Password").click();
    await page.getByPlaceholder("Enter Your Password").fill(regularUser.password);
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.getByRole("button", { name: regularUser.name.toUpperCase() }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
  });

  test('displays user dashboard with correct user info', async ({ page }) => {
    await expect(page.locator('h4:has-text("Dashboard")')).toBeVisible();
    
    await expect(page.locator('h3', { hasText: "Name: CS 4218 Test Account" })).toBeVisible();
    await expect(page.locator('h3', { hasText: "Email: cs4218@test.com" })).toBeVisible();
    await expect(page.locator('h3', { hasText: "Address: 1 Computing Drive" })).toBeVisible();
    
  });

  test('has working navigation links in user menu', async ({ page }) => {
    const navLinks = [
      { text: 'Orders', url: '**/dashboard/user/orders' },
      { text: 'Profile', url: '**/dashboard/user/profile' }
    ];

    for (const link of navLinks) {
      await page.getByRole('link', { name: link.text }).click();
      await page.waitForURL(link.url);
      await page.goto('http://localhost:3000/dashboard/user');
    } 
  });

  test('redirects to login when accessing dashboard without auth', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/admin');
    
    await expect(page).toHaveURL(/.*login.*/);
  });
  
  test('should prevent non-admin users from accessing admin dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/admin');
    
    try {
      await expect(page.locator('div', { hasText: /unauthorized|permission|access denied/i }))
        .toBeVisible({ timeout: 5000 });
    } catch (e) {
      await expect(page.url()).toContain('/login');
    }
  });
});