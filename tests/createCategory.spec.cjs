// @ts-check
const { test, expect } = require('@playwright/test');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// Global test timeout
test.setTimeout(30000);

// Admin credentials
const ADMIN_EMAIL = 'admin369@test.com';
const ADMIN_PASSWORD = '123456';

// MongoDB connection string
const MONGO_URI = 'mongodb+srv://jethrosim:mongojet231@cs4218-project.vizxa.mongodb.net/';
const DB_NAME = 'test';

/**
 * Creates a mock admin user in the database if one doesn't exist
 */
async function createMockAdmin() {
  let client;
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGO_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const users = db.collection('users');
    
    // Check if admin already exists
    const adminExists = await users.findOne({ email: ADMIN_EMAIL });
    
    if (!adminExists) {
      // Hash password and create admin user
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      
      await users.insertOne({
        name: 'Test Admin',
        email: ADMIN_EMAIL,
        password: hashedPassword,
        phone: '1234567890',
        address: 'Test Address',
        role: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`Mock admin user (${ADMIN_EMAIL}) created successfully`);
    } else {
      // console.log(`Admin user (${ADMIN_EMAIL}) already exists, continuing with tests`);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw new Error(`Failed to set up admin user: ${error.message}`);
  } finally {
    if (client) await client.close();
  }
}

test.describe('Admin Category Management', () => {
  // Create admin user once before all tests
  test.beforeAll(async () => {
    await createMockAdmin();
  });
  
  // Set up authentication and navigation for each test
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Fill credentials
    await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"], input[name="password"]', ADMIN_PASSWORD);
    
    // Click login and wait for navigation
    await page.click('button:has-text("Login")');
    await page.waitForLoadState('networkidle');
    
    // Directly navigate to category page after login
    await page.goto('http://localhost:3000/dashboard/admin/create-category');
    await page.waitForLoadState('networkidle');
    
    // Check if we're on the right page
    const header = await page.textContent('h1');
    if (header && header.includes('Manage Category')) {
      // console.log('Successfully loaded category management page');
    } else {
      console.error('Failed to load category management page');
      await page.screenshot({ path: 'navigation-error.png' });
      throw new Error('Not on category management page');
    }
  });
  
  // Test: Creating a new category
  test('should create a new category and display it in the list and delete it', async ({ page }) => {
    // Generate a unique category name with timestamp
    const categoryName = `Test Category ${Date.now()}`;
    // console.log(`Creating category: ${categoryName}`);
    
    // Find and fill the category input 
    await page.getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('textbox', { name: 'Enter new category' }).fill(`${categoryName}`);

    // console.log('Category name filled');
    
    // Submit the form
    await page.getByRole('button', { name: 'Submit' }).click();
    // console.log('Submit button clicked');
    
    // Wait for the category to appear in the list
    try {
      await expect(page.locator('tbody')).toContainText(`${categoryName}`);
      // console.log('Category appeared in the list');
    } catch (error) {
      console.error('Category did not appear in the list');
      throw error;
    }
    
    // Verify the category appears in the table
    await expect(page.locator(`text="${categoryName}"`)).toBeVisible();
    // console.log('Successfully verified category was created');
    
    // Test deleting the category we just created
    // Find the row with the category name
    const categoryRow = page.locator(`tr:has-text("${categoryName}")`);
    
    // Click the Delete button for this category
    await categoryRow.getByRole('button', { name: 'Delete' }).click();
    
    // Verify the category has been removed
    await expect(page.locator(`text="${categoryName}"`)).not.toBeVisible({ timeout: 5000 });
    // console.log(`Successfully deleted test category: ${categoryName}`);
    
  });

  // Test: Creating, editing, and deleting a category
  test('should create, edit, and delete a category', async ({ page }) => {
    // Generate unique category names with timestamp
    const timestamp = Date.now();
    const categoryName = `Test Category ${timestamp}`;
    const updatedName = `Updated Category ${timestamp}`;
    
    // console.log(`Creating category: ${categoryName}`);
    
    // Create category
    await page.getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('textbox', { name: 'Enter new category' }).fill(categoryName);
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify the category appears in the table
    await expect(page.locator(`tbody`)).toContainText(categoryName, { timeout: 5000 });
    // console.log('Category created successfully');
    
    // Find the row with the category name
    const categoryRow = page.locator(`tr:has-text("${categoryName}")`);
    
    // Click the Edit button for this category
    await categoryRow.getByRole('button', { name: 'Edit' }).first().click();
    // console.log('Edit button clicked');
    
    // Wait for the edit form to appear
    await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).clear();
    await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill(updatedName);

    // Submit the edit
    await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();
    
    // Verify the updated category appears in the table
    await expect(page.locator(`tbody`)).toContainText(updatedName, { timeout: 5000 });
    // console.log(`Category successfully updated to: ${updatedName}`);
    
    // Find the row with the updated category name
    const updatedRow = page.locator(`tr:has-text("${updatedName}")`);
    
    // Click the Delete button for this category
    await updatedRow.getByRole('button', { name: 'Delete' }).click();
    // console.log('Delete button clicked');
    
    // Verify the category has been removed
    // First wait a moment for the UI to update
    await page.waitForTimeout(3000);
    
    // Then check that the updated name is no longer in the table
    await expect(page.locator(`tbody`)).not.toContainText(updatedName, { timeout: 5000 });
    // console.log('Category successfully deleted');
  });

});

