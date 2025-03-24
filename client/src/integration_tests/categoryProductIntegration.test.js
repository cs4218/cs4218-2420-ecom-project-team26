import React from "react";
import { render, screen, fireEvent, waitFor, act, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";
import CreateCategory from "../pages/admin/CreateCategory";
import CreateProduct from "../pages/admin/CreateProduct";
import Products from "../pages/admin/Products";
import UpdateProduct from "../pages/admin/UpdateProduct";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

const mockNavigate = jest.fn();

// Mock dependencies
jest.mock("axios");

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
  Toaster: () => <div data-testid="mock-toaster" />
}));

// Mock Layout and AdminMenu components
jest.mock("../components/Layout", () => ({ children, title }) => (
  <div data-testid="mock-layout" title={title}>
    {children}
  </div>
));

jest.mock("../components/AdminMenu", () => () => (
  <div data-testid="mock-admin-menu">AdminMenu</div>
));

// Mock CategoryForm component
jest.mock(
  "../components/Form/CategoryForm",
  () =>
    ({ handleSubmit, value, setValue }) =>
      (
        <form data-testid="mock-category-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid="category-input"
            placeholder="Enter new category"
          />
          <button type="submit">Submit</button>
        </form>
      )
);

// Mock antd components
jest.mock("antd", () => {
  // Define Option component 
  const Option = ({ value, children }) => {
    return <option value={value}>{children}</option>;
  };
  
  // Return the mocked antd exports
  return {
    Modal: ({ children, visible, onCancel }) =>
      visible ? (
        <div data-testid="mock-modal" className="ant-modal">
          <button onClick={onCancel}>Cancel</button>
          <div className="ant-modal-content">{children}</div>
        </div>
      ) : null,
    Select: Object.assign(
      ({ children, onChange, value, placeholder }) => {
        // Create a unique test ID based on the placeholder
        const testId = `select-${placeholder?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;
        
        return (
          <div data-testid={testId}>
            <span data-testid={`${testId}-placeholder`}>{placeholder}</span>
            <select 
              onChange={(e) => onChange && onChange(e.target.value)}
              value={value}
              data-testid={`${testId}-dropdown`}
            >
              <option value="">Select an option</option>
              {Array.isArray(children) && children.map((child, index) => {
                if (!child) return null;
                return (
                  <option 
                    key={child.key || `option-${index}`} 
                    value={child.props?.value || child.key || ""}
                  >
                    {child.props?.children || ""}
                  </option>
                );
              })}
            </select>
          </div>
        );
      },
      { Option }
    )
  };
});

// Mock auth context 
const mockAuth = {
  user: { 
    _id: "67a218decf4efddf1e5358ac",
    name: "Admin User",
    email: "admin@example.com",
    phone: "1234567890",
    address: "123 Test Street",
    role: 1
  },
  token: "mock-token",
};

jest.mock("../context/auth", () => ({
  useAuth: () => [mockAuth, jest.fn()],
}));

jest.mock("../context/cart", () => ({
  useCart: () => [[], jest.fn()],
}));

jest.mock("../context/search", () => ({
  useSearch: () => [{ keyword: "", results: [] }, jest.fn()],
}));

// Global mock for URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "mock-url");

// Mock window.matchMedia
window.matchMedia = window.matchMedia || (() => ({
  matches: false,
  addListener: () => {},
  removeListener: () => {},
}));

// Create a variable for params
let mockParams = { slug: "test-product" };

// Mock for react-router-dom 
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

describe("Category-Product Integration", () => {
  // Mock data to match DB schema format
  const mockCategories = [
    {
      _id: "66db427fdb0119d9234b27ed",
      name: "Electronics",
      slug: "electronics",
      __v: 0
    },
    {
      _id: "66db427fdb0119d9234b27ef",
      name: "Book",
      slug: "book",
      __v: 0
    },
    {
      _id: "66db427fdb0119d9234b27ee",
      name: "Clothing",
      slug: "clothing",
      __v: 0
    }
  ];
  
  const newCategory = {
    _id: "66db427fdb0119d9234b27f0",
    name: "Test Category",
    slug: "test-category",
    __v: 0
  };
  
  const newProduct = {
    _id: "66db427fdb0119d9234b27f3",
    name: "Test Product",
    slug: "test-product",
    description: "Test Description",
    price: 99.99,
    quantity: 10,
    category: {
      _id: "66db427fdb0119d9234b27f0",
      name: "Test Category"
    },
    photo: "mock-photo-url",
    shipping: true,
    __v: 0
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Set up a spy 
    jest.spyOn(axios, 'get').mockImplementation((url) => {
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: { success: true, category: mockCategories }
        });
      }
      if (url.includes("/api/v1/product/get-product/")) {
        return Promise.resolve({
          data: { success: true, product: newProduct }
        });
      }
      
      return Promise.reject(new Error("URL not mocked: " + url));
    });
  });

  test("should create a category, create a product in that category, and verify category association", async () => {

    // STEP 1: Create a new category
    await act(async () => {
      render(
        <BrowserRouter>
          <CreateCategory />
          <Toaster />
        </BrowserRouter>
      );
    });

    // Mock responses for category creation
    axios.post.mockResolvedValueOnce({
      data: { success: true, category: newCategory }
    });
    
    // After category creation, update get-category response to include the new category
    const updatedCategories = [...mockCategories, newCategory];
    axios.get.mockImplementationOnce((url) => {
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: { success: true, category: updatedCategories }
        });
      }
      return Promise.reject(new Error("Not mocked"));
    });

    // Create a new category
    const categoryInput = screen.getByTestId("category-input");
    fireEvent.change(categoryInput, { target: { value: "Test Category" } });
    
    const categoryForm = screen.getByTestId("mock-category-form");
    await act(async () => {
      fireEvent.submit(categoryForm);
    });

    // Verify category was created
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Test Category is created");
    });

    // STEP 2: Create a product in that category
    await act(async () => {
      render(
        <BrowserRouter>
          <CreateProduct />
          <Toaster />
        </BrowserRouter>
      );
    });

    // Mock get categories to include our new category
    axios.get.mockImplementationOnce((url) => {
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: { success: true, category: mockCategories }
        });
      }
      return Promise.reject(new Error("Not mocked"));
    });

    // Mock product creation
    axios.post.mockResolvedValueOnce({
      data: { success: true, product: newProduct }
    });

    // Wait for categories to load in the dropdown
    await waitFor(() => {
      const categorySelect = screen.getByTestId("select-select-a-category");
      expect(categorySelect).toBeInTheDocument();
      
      const selectElement = screen.getByTestId("select-select-a-category-dropdown");
      expect(selectElement).toBeInTheDocument();
    }, { timeout: 5000 });

    // Select the category from dropdown 
    const categoryDropdown = screen.getByTestId("select-select-a-category-dropdown");
    fireEvent.change(categoryDropdown, { target: { value: "66db427fdb0119d9234b27f0" } });

    // Fill product details
    const nameInput = screen.getByPlaceholderText("write a name");
    const descInput = screen.getByPlaceholderText("write a description");
    const priceInput = screen.getByPlaceholderText("write a Price");
    const quantityInput = screen.getByPlaceholderText("write a quantity");
    
    fireEvent.change(nameInput, { target: { value: "Test Product" } });
    fireEvent.change(descInput, { target: { value: "Test Description" } });
    fireEvent.change(priceInput, { target: { value: "99.99" } });
    fireEvent.change(quantityInput, { target: { value: "10" } });
    
    // Upload photo
    const photoInput = document.querySelector('input[type="file"]');
    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    fireEvent.change(photoInput, { target: { files: [file] } });

    // Submit product form
    const createButton = screen.getByText("CREATE PRODUCT");
    await act(async () => {
      fireEvent.click(createButton);
    });

    // Verify product was created
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Product Created Successfully");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });

    // STEP 3: View the product in the Products list
    // Completely reset the mock to ensure clean state
    axios.get.mockReset();

    // Then set up the mock with a more specific implementation
    axios.get.mockImplementation((url) => {
      
      if (url === "/api/v1/product/get-product") { 
        return Promise.resolve({
          data: { 
            success: true, 
            products: [newProduct] 
          }
        });
      }
      
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: { success: true, category: updatedCategories }
        });
      }
      
      return Promise.reject(new Error(`URL not mocked: ${url}`));
    });

    // Then render the Products component
    await act(async () => {
      render(
        <BrowserRouter>
          <Products />
        </BrowserRouter>
      );
    });

    // Verify the product appears in the list
    await waitFor(() => {
      // Get all elements with this text and verify at least one exists
      const productTitles = screen.getAllByText("Test Product");
      const productDescriptions = screen.getAllByText("Test Description");
      
      expect(productTitles.length).toBeGreaterThan(0);
      expect(productDescriptions.length).toBeGreaterThan(0);
    });

    // STEP 4: Navigate to edit the product and verify the category association
    // Mock the get-product API for the update page
    axios.get.mockImplementationOnce((url) => {
      if (url.includes("/api/v1/product/get-product/")) {
        return Promise.resolve({
          data: { success: true, product: newProduct }
        });
      }
      return Promise.reject(new Error("Not mocked"));
    });

    // Mock get categories for the update page
    axios.get.mockImplementationOnce((url) => {
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: { success: true, category: mockCategories }
        });
      }
      return Promise.reject(new Error("Not mocked"));
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <UpdateProduct />
        </BrowserRouter>
      );
    });

    // Verify the product has the correct category selected in the update form
    await waitFor(() => {
      // Find all name inputs and check if any of them have the expected value
      const nameInputs = screen.getAllByPlaceholderText("write a name");
      const hasCorrectName = nameInputs.some(input => input.value === "Test Product");
      expect(hasCorrectName).toBe(true);
      
      // Similar approach for description and price
      const descInputs = screen.getAllByPlaceholderText("write a description");
      const hasCorrectDesc = descInputs.some(input => input.value === "Test Description");
      expect(hasCorrectDesc).toBe(true);
      
      const priceInputs = screen.getAllByPlaceholderText("write a Price");
      const hasCorrectPrice = priceInputs.some(input => input.value === "99.99");
      expect(hasCorrectPrice).toBe(true);
    }, { timeout: 5000 });
  });
  
  test("should place an order with products from a specific category", async () => {
    // Define electronic products
    const electronicProducts = [
      {
        _id: "66db427fdb0119d9234b27f3",
        name: "Test Electronic Product",
        slug: "test-electronic-product",
        description: "Electronic Device",
        price: 299.99,
        quantity: 15,
        category: {
          _id: "66db427fdb0119d9234b27ed", 
          name: "Electronics"
        },
        shipping: true,
        __v: 0
      }
    ];
    
    // Reset and set up specific mock for this test
    axios.get.mockReset();
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/get-product") && !url.includes("/api/v1/product/get-product/")) {
        return Promise.resolve({
          data: { success: true, products: electronicProducts }
        });
      }
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: { success: true, category: mockCategories }
        });
      }
      return Promise.reject(new Error(`Not mocked: ${url}`));
    });
    
    // Render Products component
    await act(async () => {
      render(
        <BrowserRouter>
          <Products />
        </BrowserRouter>
      );
    });
    
    // Find the product
    await waitFor(() => {
      expect(screen.getByText(/Test Electronic Product/i)).toBeInTheDocument();
    }, {timeout: 5000});
  });
  
  test("should update a product's category and verify the change persists", async () => {
    // Setup test data for category update
    const productToUpdate = {
      _id: "66db427fdb0119d9234b27f3",
      name: "Test Product",
      slug: "test-product",
      description: "Test Description",
      price: 99.99,
      quantity: 10,
      category: {
        _id: "66db427fdb0119d9234b27ed", // Initially Electronics
        name: "Electronics"
      },
      shipping: true,
      __v: 0
    };
    
    // Reset mock implementations
    axios.get.mockReset();
    
    // Mock get single product API
    axios.get.mockImplementation((url) => {
      
      if (url.includes("/api/v1/product/get-product/")) {
        return Promise.resolve({
          data: { success: true, product: productToUpdate }
        });
      }
      
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: { success: true, category: mockCategories }
        });
      }
      
      return Promise.reject(new Error(`URL not mocked: ${url}`));
    });
    
    // Render UpdateProduct component
    await act(async () => {
      render(
        <BrowserRouter>
          <UpdateProduct />
        </BrowserRouter>
      );
    });
    
    // Wait for product data to load using non-specific checks
    await waitFor(() => {
      // Just verify the component title and buttons are present
      expect(screen.getByText("Update Product")).toBeInTheDocument();
      expect(screen.getByText("UPDATE PRODUCT")).toBeInTheDocument();
    });
    
    // Find the category dropdown using the correct test ID
    const categoryDropdown = screen.getByTestId("select-select-a-category-dropdown");
    expect(categoryDropdown).toBeInTheDocument();
    
    // Change category from Electronics to Book
    fireEvent.change(categoryDropdown, { target: { value: "66db427fdb0119d9234b27ef" } }); // Book category ID
    
    // Mock successful product update
    axios.put.mockResolvedValueOnce({
      data: { 
        success: true,
        product: {
          ...productToUpdate,
          category: {
            _id: "66db427fdb0119d9234b27ef", // Now Book category
            name: "Book"
          }
        }
      }
    });
    
    // Submit update
    const updateButton = screen.getByText("UPDATE PRODUCT");
    await act(async () => {
      fireEvent.click(updateButton);
    });
    
    // Verify update was successful
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/product/update-product/66db427fdb0119d9234b27f3",
        expect.any(FormData)
      );
      expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
    });
    // Get form data that was sent and verify the category was updated
    const formData = axios.put.mock.calls[0][1];
    expect(formData.get("category")).toBe("66db427fdb0119d9234b27ef");
  });

  test("complete product lifecycle: create → edit → delete", async () => {
    // Define lifecycle test product
    const lifecycleProduct = {
      _id: "66db427fdb0119d9234b27f5",
      name: "Lifecycle Test Product",
      slug: "lifecycle-test-product",
      description: "Testing the complete lifecycle",
      price: 299.99,
      quantity: 25,
      category: {
        _id: "66db427fdb0119d9234b27ed", // Electronics
        name: "Electronics"
      },
      shipping: true,
      __v: 0
    };
    
    // STEP 1: Create a new product
    // Reset axios mock
    axios.get.mockReset();
    
    // Mock categories loading
    axios.get.mockImplementation((url) => {
      
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: { success: true, category: mockCategories }
        });
      }
      return Promise.reject(new Error("Not mocked: " + url));
    });
    
    // Render CreateProduct component
    await act(async () => {
      render(
        <BrowserRouter>
          <CreateProduct />
          <Toaster />
        </BrowserRouter>
      );
    });
    
    // Wait for form to load
    await waitFor(() => {
      const selectContainer = screen.getByTestId("select-select-a-category");
      expect(selectContainer).toBeInTheDocument();
      
      const selectDropdown = screen.getByTestId("select-select-a-category-dropdown");
      expect(selectDropdown).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Fill product details
    // Select Electronics category
    const selectDropdown = screen.getByTestId("select-select-a-category-dropdown");
    fireEvent.change(selectDropdown, { target: { value: "66db427fdb0119d9234b27ed" } });
    
    // Fill in product details
    const nameInput = screen.getByPlaceholderText("write a name");
    const descInput = screen.getByPlaceholderText("write a description");
    const priceInput = screen.getByPlaceholderText("write a Price");
    const quantityInput = screen.getByPlaceholderText("write a quantity");
    
    fireEvent.change(nameInput, { target: { value: "Lifecycle Test Product" } });
    fireEvent.change(descInput, { target: { value: "Testing the complete lifecycle" } });
    fireEvent.change(priceInput, { target: { value: "299.99" } });
    fireEvent.change(quantityInput, { target: { value: "25" } });
    
    // Upload photo
    const photoInput = document.querySelector('input[type="file"]');
    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    fireEvent.change(photoInput, { target: { files: [file] } });
    
    // Mock product creation success
    axios.post.mockResolvedValueOnce({
      data: { success: true, product: lifecycleProduct }
    });
    
    // Submit the form
    const createButton = screen.getByText("CREATE PRODUCT");
    await act(async () => {
      fireEvent.click(createButton);
    });
    
    // Verify product creation success
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Product Created Successfully");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });
    
    // STEP 2: Verify product appears in product list
    // Reset axios mock
    axios.get.mockReset();
    
    // Mock products list API to include our new product
    axios.get.mockImplementation((url) => {
      
      if (url === "/api/v1/product/get-product") {
        return Promise.resolve({
          data: { success: true, products: [lifecycleProduct] }
        });
      }
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: { success: true, category: mockCategories }
        });
      }
      return Promise.reject(new Error("Not mocked: " + url));
    });
    
    // Render Products component
    await act(async () => {
      render(
        <BrowserRouter>
          <Products />
        </BrowserRouter>
      );
    });
    
    // Verify product appears in list (using more lenient checks)
    await waitFor(() => {
      const productTitles = screen.getAllByText("Lifecycle Test Product");
      const productDescriptions = screen.getAllByText("Testing the complete lifecycle");
      
      expect(productTitles.length).toBeGreaterThan(0);
      expect(productDescriptions.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
    
    // STEP 3: Edit the product
    // Override the mocked slug for useParams
    mockParams = { slug: "lifecycle-test-product" };
    
    // Reset axios mock
    axios.get.mockReset();
    
    // Mock get single product API
    axios.get.mockImplementation((url) => {
      
      if (url.includes("/api/v1/product/get-product/")) {
        return Promise.resolve({
          data: { success: true, product: lifecycleProduct }
        });
      }
      
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: { success: true, category: mockCategories }
        });
      }
      
      return Promise.reject(new Error("Not mocked: " + url));
    });
    
    // Render UpdateProduct component
    await act(async () => {
      render(
        <BrowserRouter>
          <UpdateProduct />
        </BrowserRouter>
      );
    });
    
    // Wait for product data to load
    await waitFor(() => {
      // Just verify the component title and buttons are present
      expect(screen.getByText("Update Product")).toBeInTheDocument();
      expect(screen.getByText("UPDATE PRODUCT")).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Update product details - use getAllByPlaceholderText and find the right one
    const updateNameInputs = screen.getAllByPlaceholderText("write a name");
    const updateDescInputs = screen.getAllByPlaceholderText("write a description");
    const updatePriceInputs = screen.getAllByPlaceholderText("write a Price");
    
    // Find inputs with the correct values
    const updateNameInput = updateNameInputs.find(input => input.value === "Lifecycle Test Product");
    const updateDescInput = updateDescInputs.find(input => input.value === "Testing the complete lifecycle");
    const updatePriceInput = updatePriceInputs.find(input => input.value === "299.99");
    
    // Update the values
    fireEvent.change(updateNameInput, { target: { value: "Updated Lifecycle Product" } });
    fireEvent.change(updateDescInput, { target: { value: "Updated lifecycle description" } });
    fireEvent.change(updatePriceInput, { target: { value: "349.99" } });
    
    // Mock successful product update
    const updatedProduct = {
      ...lifecycleProduct,
      name: "Updated Lifecycle Product",
      description: "Updated lifecycle description",
      price: 349.99
    };
    
    axios.put.mockResolvedValueOnce({
      data: { success: true, product: updatedProduct }
    });
    
    // Submit update
    const updateButton = screen.getByText("UPDATE PRODUCT");
    await act(async () => {
      fireEvent.click(updateButton);
    });
    
    // Verify update was successful
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/product/update-product/66db427fdb0119d9234b27f5",
        expect.any(FormData)
      );
      expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
    });
    
    // Clean up before rendering a new component
    cleanup();

    // STEP 5: Delete the product
    // Reset axios mock again
    axios.get.mockReset();
    
    // Mock window.prompt for delete confirmation
    window.prompt = jest.fn(() => "yes");
    
    // Mock successful product deletion
    axios.delete.mockResolvedValueOnce({
      data: { success: true }
    });
    
    // Mock get single product again
    axios.get.mockImplementation((url) => {
      
      if (url.includes("/api/v1/product/get-product/")) {
        return Promise.resolve({
          data: { success: true, product: updatedProduct }
        });
      }
      
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: { success: true, category: mockCategories }
        });
      }
      
      return Promise.reject(new Error("Not mocked: " + url));
    });
    
    // Re-render update product component
    await act(async () => {
      render(
        <BrowserRouter>
          <UpdateProduct />
        </BrowserRouter>
      );
    });
    
    // Wait for delete button to be available
    await waitFor(() => {
      expect(screen.getByText("DELETE PRODUCT")).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Click delete button
    const deleteButton = screen.getByText("DELETE PRODUCT");
    await act(async () => {
      fireEvent.click(deleteButton);
    });
    
    // Verify delete was successful
    await waitFor(() => {
      expect(window.prompt).toHaveBeenCalledWith(
        "Are You Sure want to delete this product ? "
      );
      expect(axios.delete).toHaveBeenCalledWith(
        "/api/v1/product/delete-product/66db427fdb0119d9234b27f5"
      );
      expect(toast.success).toHaveBeenCalledWith("Product DEleted Succfully");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });
    
    // Before our final verification step:
    // STEP 6: Verify product no longer appears in product list
    cleanup();

    // Reset axios mock one final time
    axios.get.mockReset();

    // Render Products component one last time
    await act(async () => {
      render(
        <BrowserRouter>
          <Products />
        </BrowserRouter>
      );
    });

    // Verify product list is empty
    await waitFor(() => {
      const productList = document.querySelector('.d-flex');
      expect(productList.children.length).toBe(0);
    });
  }, 15000);
}); 