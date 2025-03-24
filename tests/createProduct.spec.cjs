// @ts-check
const { test, expect } = require('@playwright/test');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Global test timeout
test.setTimeout(15000); 

// Admin credentials
const ADMIN_EMAIL = 'admin369@test.com';
const ADMIN_PASSWORD = '123456';

// MongoDB connection string
const MONGO_URI = 'mongodb+srv://jethrosim:mongojet231@cs4218-project.vizxa.mongodb.net/';
const DB_NAME = 'test';

// Track items created during tests for cleanup
const testProducts = [];
const testCategories = [];

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

/**
 * Deletes a product from the database by name
 */
async function deleteProductFromDB(productName) {
  let client;
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const products = db.collection('products');
    
    // Find the product by name
    const result = await products.deleteOne({ name: productName });
    
    if (result.deletedCount > 0) {
      // console.log(`Successfully deleted product "${productName}" from database`);
      return true;
    } else {
      // console.log(`No product named "${productName}" was found in the database`);
      return false;
    }
  } catch (error) {
    console.error('Error deleting product from database:', error);
    return false;
  } finally {
    if (client) await client.close();
  }
}

/**
 * Deletes a category from the database by name
 */
async function deleteCategoryFromDB(categoryName) {
  let client;
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const categories = db.collection('categories');
    
    // Find the category by name
    const result = await categories.deleteOne({ name: categoryName });
    
    if (result.deletedCount > 0) {
      // console.log(`Successfully deleted category "${categoryName}" from database`);
      return true;
    } else {
      // console.log(`No category named "${categoryName}" was found in the database`);
      return false;
    }
  } catch (error) {
    console.error('Error deleting category from database:', error);
    return false;
  } finally {
    if (client) await client.close();
  }
}

test.describe('Create Product Functionality', () => {
  // Create admin user once before all tests
  test.beforeAll(async () => {
    await createMockAdmin();
  });
  
  // Clean up any products and categories created during tests
  test.afterEach(async () => {
    // Clean up products first (they reference categories)
    if (testProducts.length > 0) {
      // console.log(`Cleaning up ${testProducts.length} test products from database`);
      
      for (const productName of testProducts) {
        await deleteProductFromDB(productName);
      }
      
      // Clear the array after cleanup
      testProducts.length = 0;
    }
    
    // Then clean up categories
    if (testCategories.length > 0) {
      // console.log(`Cleaning up ${testCategories.length} test categories from database`);
      
      for (const categoryName of testCategories) {
        await deleteCategoryFromDB(categoryName);
      }
      
      // Clear the array after cleanup
      testCategories.length = 0;
    }
  });
  
  // Set up authentication and navigation for each test
  test.beforeEach(async ({ page }) => {
    // console.log('Setting up test: Logging in as admin');
    
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Fill credentials
    await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"], input[name="password"]', ADMIN_PASSWORD);
    
    // Click login and wait for navigation
    await page.click('button:has-text("Login")');
    await page.waitForLoadState('networkidle');
    
    // Navigate to create product page
    await page.goto('http://localhost:3000/dashboard/admin/create-product');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the right page
    const header = await page.textContent('h1');
    if (header && header.includes('Create Product')) {
      // console.log('Successfully loaded create product page');
    } else {
      console.error('Failed to load create product page');
      await page.screenshot({ path: 'navigation-error.png' });
      throw new Error('Not on create product page');
    }
  });
  
  test('should create a new product and verify its appearance in products list', async ({ page }) => {
    // Generate a unique product name with timestamp
    const timestamp = Date.now();
    const productName = `Test Product ${timestamp}`;
    const productDescription = `Description for test product ${timestamp}`;
    const productPrice = '99.99';
    const productQuantity = '10';
    
    // console.log(`Creating product: ${productName}`);
    
    // Track this product for cleanup
    testProducts.push(productName);
    
    // Step 1: Select a category
    // Wait for categories to load
    await page.waitForSelector('.form-select');
    
    // Click on the category dropdown
    await page.locator('div').filter({ hasText: /^Select a category$/ }).first().click();
    
    // Select the electronics category option
    await page.getByTitle('Electronics').locator('div').click();
    
    // Step 2: Upload a test image
    const testImagePath = path.join(__dirname, 'test-img.png');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);
    
    // Step 3: Fill in product details
    await page.getByPlaceholder('write a name').fill(productName);
    await page.getByPlaceholder('write a description').fill(productDescription);
    await page.getByPlaceholder('write a Price').fill(productPrice);
    await page.getByPlaceholder('write a quantity').fill(productQuantity);
    
    // Step 4: Select shipping option
    await page.locator('.mb-3 > .ant-select').click();
    await page.getByTitle('No').click();
    
    // Step 5: Click "CREATE PRODUCT" button
    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    
    // Step 6: Verify redirection to products list page
    await page.waitForURL('**/dashboard/admin/products', { timeout: 10000 });
    
    // Step 7: Verify the product appears in the list
    await expect(page.getByRole('link', { name: productName })).toBeVisible();
    
    // console.log('Successfully verified product was created');
    
  });
  
  // Test for creating a category, creating a product in that category, and verifying the product appears under that category
  test('create category and product', async ({ page }) => {
    // Generate unique test names with timestamp
    const timestamp = Date.now();
    const categoryName = `Test Category ${timestamp}`;
    const productName = `Test Product ${timestamp}`;
    const productDescription = `Description for test product ${timestamp}`;
    const productPrice = '99.99';
    const productQuantity = '10';
    
    // console.log(`Using test category: ${categoryName} and product: ${productName}`);
    
    // Track items for cleanup
    testCategories.push(categoryName);
    testProducts.push(productName);
    
    // STEP 1: Create a new category
    // console.log('Creating new category');
    await page.goto('http://localhost:3000/dashboard/admin/create-category');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the category management page
    const categoryHeader = await page.textContent('h1');
    expect(categoryHeader).toContain('Manage Category');
    
    // Create the category
    await page.getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('textbox', { name: 'Enter new category' }).fill(categoryName);
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify the category appears in the table
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
    
    // STEP 2: Create a new product in that category
    // console.log('Creating new product in the category');
    await page.goto('http://localhost:3000/dashboard/admin/create-product');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the create product page
    const productHeader = await page.textContent('h1');
    expect(productHeader).toContain('Create Product');
    
    // Wait for categories to load
    await page.waitForSelector('.form-select');
    
    // Click on the category dropdown
    await page.locator('div').filter({ hasText: /^Select a category$/ }).first().click();
    
    // Find and select our newly created category
    await page.getByTitle(categoryName).locator('div').click();

    // Upload a test image
    const testImagePath = path.join(__dirname, 'test-img.png');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);
    
    // Fill in product details
    await page.getByPlaceholder('write a name').fill(productName);
    await page.getByPlaceholder('write a description').fill(productDescription);
    await page.getByPlaceholder('write a Price').fill(productPrice);
    await page.getByPlaceholder('write a quantity').fill(productQuantity);
    
    // Select shipping option
    await page.locator('.mb-3 > .ant-select').click();
    await page.getByTitle('Yes').click();
    
    // Create the product
    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    
    // Verify redirection to products list page
    await page.waitForURL('**/dashboard/admin/products', { timeout: 10000 });
    
    // Verify the product appears in the list
    await expect(page.getByRole('link', { name: productName })).toBeVisible();
    // console.log('Product created successfully');
    
    
    // STEP 3: Navigate to the homepage and browse the category
    // console.log('Navigating to home page to browse category');
    await page.getByRole('link', { name: 'Categories' }).click();
    await page.getByRole('link', { name: categoryName }).click();

    // Wait for the page to load
    await page.waitForURL('**/category/**');
    await page.waitForLoadState('networkidle');
    
    // STEP 4: Verify the product appears in this category
    await expect(page.getByRole('heading', { name: productName })).toBeVisible({timeout: 5000});
    // console.log('Successfully verified product appears under the correct category');

  });
});