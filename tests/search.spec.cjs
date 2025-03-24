// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Go to homepage before each test
    await page.goto('http://localhost:3000');
  });

  test('should search for products by keyword and display matching results', async ({ page }) => {
    // Type into the search input field
    await page.getByRole('searchbox', { name: 'Search' }).fill('Novel');
    
    // Submit the search
    await page.getByRole('searchbox', { name: 'Search' }).press('Enter');
    
    // Wait for search results
    await page.waitForURL('**/search');
    
    // Verify search results header and content
    await expect(page.locator('h1')).toContainText('Search Results');
    await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
  });

  test('should display "No Products Found" message when searching for nonexistent items', async ({ page }) => {
    // Search for a nonexistent product
    await page.getByRole('searchbox', { name: 'Search' }).fill('nonexistentproduct12345');
    await page.getByRole('searchbox', { name: 'Search' }).press('Enter');
    
    // Wait for search results page
    await page.waitForURL('**/search');
    
    // Verify "No Products Found" message is displayed
    await expect(page.locator('.container h6')).toContainText('No Products Found');
  });

  test('should navigate to product details page when clicking "More Details" button', async ({ page }) => {
    // Search for a product
    await page.getByRole('searchbox', { name: 'Search' }).fill('Novel');
    await page.getByRole('searchbox', { name: 'Search' }).press('Enter');
    
    // Wait for search results
    await page.waitForURL('**/search');
    
    // Click for more details on the product
    await page.getByRole('button', { name: 'More Details' }).click();

    // Verify product details page is loaded
    await expect(page.locator('h1')).toContainText('Product Details');
  });

  test('should add product to cart from search results and display in cart', async ({ page }) => {
    // Search for a product
    await page.getByRole('searchbox', { name: 'Search' }).fill('Novel');
    await page.getByRole('searchbox', { name: 'Search' }).press('Enter');

    // Wait for search results
    await page.waitForURL('**/search');

    // Add product to cart
    await page.getByRole('button', { name: 'ADD TO CART' }).click();

    // Navigate to cart page
    await page.getByRole('link', { name: 'Cart' }).click();

    // Verify product is in the cart
    await expect(page.getByRole('main')).toContainText('Novel');
  });

  test('should handle search queries with special characters and spaces', async ({ page }) => {
    // Search with special characters
    await page.getByRole('searchbox', { name: 'Search' }).fill('iPhone & accessories');
    await page.getByRole('searchbox', { name: 'Search' }).press('Enter');
    
    // Wait for search results
    await page.waitForURL('**/search');
    
    // Verify search page loads without errors
    await expect(page.locator('h1')).toContainText('Search Results');
    await expect(page.locator('body')).not.toContainText('Error');
  });
  
  test('should display all products when performing an empty search', async ({ page }) => {
    // Perform an empty search
    await page.getByRole('searchbox', { name: 'Search' }).click();
    await page.getByRole('button', { name: 'Search' }).click();
    
    // Verify all product categories are displayed
    const expectedProducts = ['Novel', 'The Law of Contract in Singapore', 'NUS T-shirt', 
                             'Smartphone', 'Laptop', 'Textbook'];
    
    for (const product of expectedProducts) {
      await expect(page.getByRole('main')).toContainText(product);
    }
  });
  
  test('should preserve search results after page refresh', async ({ page }) => {
    // Search for a specific product
    await page.getByRole('searchbox', { name: 'Search' }).fill('iPhone');
    await page.getByRole('searchbox', { name: 'Search' }).press('Enter');
    
    // Wait for search results
    await page.waitForURL('**/search');
    
    // Count initial results
    const initialResultsCount = await page.locator('.card').count();
    
    // Refresh the page
    await page.reload();
    
    // Verify search results persist
    await expect(page.locator('h1')).toContainText('Search Results');
    const afterRefreshCount = await page.locator('.card').count();
    expect(afterRefreshCount).toBe(initialResultsCount);
  });
});
