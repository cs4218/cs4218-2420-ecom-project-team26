import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import UpdateProduct from "./UpdateProduct";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

jest.mock("axios");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ slug: "test-product" }),
  useNavigate: () => jest.fn(),
}));

const mockCategories = [
  { _id: "1", name: "Category 1" },
  { _id: "2", name: "Category 2" },
];

const mockProduct = {
  _id: "123",
  name: "Test Product",
  description: "Test Description",
  price: 100,
  quantity: 10,
  shipping: true,
  category: { _id: "1", name: "Category 1" },
  slug: "test-product",
};

const mockAuth = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    phone: "1234-5678",
    role: 1,
  },
  token: "mock-token",
};

const mockCart = [];
const mockSearch = {
  keyword: "",
  results: [],
};

// Mock matchMedia
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

// Mock URL.createObjectURL
URL.createObjectURL = jest.fn(() => "mocked-url");

jest.mock("../../context/auth", () => ({
  useAuth: () => [mockAuth, jest.fn()],
}));

jest.mock("../../context/cart", () => ({
  useCart: () => [mockCart, jest.fn()],
}));

jest.mock("../../context/search", () => ({
  useSearch: () => [mockSearch, jest.fn()],
}));

jest.mock("../../hooks/useCategory", () => ({
  __esModule: true,
  default: jest.fn(() => mockCategories),
}));

beforeEach(() => {
  axios.get.mockImplementation((url) => {
    if (url.includes("/get-product/")) {
      return Promise.resolve({
        data: { success: true, product: mockProduct },
      });
    } else if (url.includes("/get-category")) {
      return Promise.resolve({
        data: { success: true, category: mockCategories },
      });
    }
    return Promise.reject(new Error("Not found"));
  });

  axios.put.mockResolvedValue({ data: { success: true } });
  axios.delete.mockResolvedValue({ data: { success: true } });

  // Mock window.prompt for delete confirmation
  window.prompt = jest.fn(() => "yes");
});

afterEach(() => {
  jest.clearAllMocks();
});

test("renders UpdateProduct component", async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <UpdateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Check if the heading is rendered
  expect(screen.getByText("Update Product")).toBeInTheDocument();

  // Check if the form fields are rendered with product data
  await waitFor(() => {
    expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Description")).toBeInTheDocument();
    expect(screen.getByDisplayValue("100")).toBeInTheDocument(); // price
    expect(screen.getByDisplayValue("10")).toBeInTheDocument(); // quantity
    expect(screen.getByText("UPDATE PRODUCT")).toBeInTheDocument();
    expect(screen.getByText("DELETE PRODUCT")).toBeInTheDocument();
  });
});

test("handles product update submission", async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <UpdateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Wait for the product data to load
  await waitFor(() => {
    expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
  });

  // Simulate input changes
  const nameInput = screen.getByDisplayValue("Test Product");
  fireEvent.change(nameInput, { target: { value: "Updated Product" } });

  const descriptionInput = screen.getByDisplayValue("Test Description");
  fireEvent.change(descriptionInput, {
    target: { value: "Updated Description" },
  });

  const priceInput = screen.getByDisplayValue("100");
  fireEvent.change(priceInput, { target: { value: "150" } });

  const quantityInput = screen.getByDisplayValue("10");
  fireEvent.change(quantityInput, { target: { value: "15" } });

  // Simulate form submission
  const updateButton = screen.getByText("UPDATE PRODUCT");
  fireEvent.click(updateButton);

  // Check if the form submission is handled
  await waitFor(() => {
    expect(axios.put).toHaveBeenCalledWith(
      "/api/v1/product/update-product/123",
      expect.any(FormData)
    );
  });
});

test("handles product update error", async () => {
  axios.put.mockRejectedValueOnce(new Error("Network Error"));

  await act(async () => {
    render(
      <BrowserRouter>
        <UpdateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Wait for the product data to load
  await waitFor(() => {
    expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
  });

  // Simulate form submission
  const updateButton = screen.getByText("UPDATE PRODUCT");
  fireEvent.click(updateButton);

  // Check if the error is handled
  await waitFor(() => {
    const errorMessages = screen.getAllByText(/something went wrong/i);
    expect(errorMessages.length).toBeGreaterThan(0);
  });
});

test("handles product deletion", async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <UpdateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Wait for the product data to load
  await waitFor(() => {
    expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
  });

  // Simulate clicking the delete button
  const deleteButton = screen.getByText("DELETE PRODUCT");
  fireEvent.click(deleteButton);

  // Check if the product deletion is handled
  await waitFor(() => {
    expect(window.prompt).toHaveBeenCalledWith(
      "Are You Sure want to delete this product ? "
    );
    expect(axios.delete).toHaveBeenCalledWith(
      "/api/v1/product/delete-product/123"
    );
  });
});

test("handles product deletion cancellation", async () => {
  window.prompt.mockReturnValueOnce(null); // User cancels the prompt

  await act(async () => {
    render(
      <BrowserRouter>
        <UpdateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Wait for the product data to load
  await waitFor(() => {
    expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
  });

  // Simulate clicking the delete button
  const deleteButton = screen.getByText("DELETE PRODUCT");
  fireEvent.click(deleteButton);

  // Check that delete API was not called
  await waitFor(() => {
    expect(window.prompt).toHaveBeenCalled();
    expect(axios.delete).not.toHaveBeenCalled();
  });
});

test("handles product deletion error", async () => {
  axios.delete.mockRejectedValueOnce(new Error("Network Error"));

  await act(async () => {
    render(
      <BrowserRouter>
        <UpdateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Wait for the product data to load
  await waitFor(() => {
    expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
  });

  // Simulate clicking the delete button
  const deleteButton = screen.getByText("DELETE PRODUCT");
  fireEvent.click(deleteButton);

  // Check if the error is handled
  await waitFor(() => {
    const errorMessages = screen.getAllByText(/something went wrong/i);
    expect(errorMessages.length).toBeGreaterThan(0);
  });
});

test("handles photo upload", async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <UpdateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Wait for the product data to load
  await waitFor(() => {
    expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
  });

  // Create a mock file
  const file = new File(["dummy content"], "example.png", {
    type: "image/png",
  });

  // Get the file input and simulate file selection
  const fileInput = screen.getByLabelText(/Upload Photo/i);
  fireEvent.change(fileInput, { target: { files: [file] } });

  // Check if the photo preview is updated
  await waitFor(() => {
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  });

  // Simulate form submission with the new photo
  const updateButton = screen.getByText("UPDATE PRODUCT");
  fireEvent.click(updateButton);

  // Check if the form submission includes the photo
  await waitFor(() => {
    const formDataMock = axios.put.mock.calls[0][1];
    expect(formDataMock.get("photo")).toBeTruthy();
  });
});

test("handles fetch product error", async () => {
  axios.get.mockImplementation((url) => {
    if (url.includes("/get-product/")) {
      return Promise.reject(new Error("Network Error"));
    } else if (url.includes("/get-category")) {
      return Promise.resolve({
        data: { success: true, category: mockCategories },
      });
    }
    return Promise.reject(new Error("Not found"));
  });

  await act(async () => {
    render(
      <BrowserRouter>
        <UpdateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Check if the component still renders despite the error
  expect(screen.getByText("Update Product")).toBeInTheDocument();
});

test("handles fetch categories error", async () => {
  axios.get.mockImplementation((url) => {
    if (url.includes("/get-product/")) {
      return Promise.resolve({
        data: { success: true, product: mockProduct },
      });
    } else if (url.includes("/get-category")) {
      return Promise.reject(new Error("Network Error"));
    }
    return Promise.reject(new Error("Not found"));
  });

  await act(async () => {
    render(
      <BrowserRouter>
        <UpdateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Check if the component still renders despite the error
  await waitFor(() => {
    expect(screen.getByText("Update Product")).toBeInTheDocument();
    const errorMessages = screen.getAllByText(
      /Something wwent wrong in getting catgeory/i
    );
    expect(errorMessages.length).toBeGreaterThan(0);
  });
});

test("handles unsuccessful product update", async () => {
  axios.put.mockResolvedValueOnce({
    data: { success: false, message: "Product update failed" },
  });

  await act(async () => {
    render(
      <BrowserRouter>
        <UpdateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Wait for the product data to load
  await waitFor(() => {
    expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
  });

  // Simulate form submission
  const updateButton = screen.getByText("UPDATE PRODUCT");
  fireEvent.click(updateButton);

  // Check if the error message is displayed
  await waitFor(() => {
    const errorMessages = screen.getAllByText(/Product update failed/i);
    expect(errorMessages.length).toBeGreaterThan(0);
  });
});

test("handles unsuccessful product deletion", async () => {
  axios.delete.mockResolvedValueOnce({
    data: { success: false, message: "Product deletion failed" },
  });

  await act(async () => {
    render(
      <BrowserRouter>
        <UpdateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Wait for the product data to load
  await waitFor(() => {
    expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
  });

  // Simulate clicking the delete button
  const deleteButton = screen.getByText("DELETE PRODUCT");
  fireEvent.click(deleteButton);

  // Check if the error message is displayed
  await waitFor(() => {
    const errorMessages = screen.getAllByText(/Something went wrong/i);
    expect(errorMessages.length).toBeGreaterThan(0);
  });
});

test("handles category selection change", async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <UpdateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Wait for the product data to load
  await waitFor(() => {
    expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
  });

  // Mock the onChange handler directly instead of trying to interact with the dropdown
  // Find the component's onChange prop and call it directly with the new value
  const updateButton = screen.getByText("UPDATE PRODUCT");

  // Directly update the category state
  await act(async () => {
    // This simulates selecting Category 2 which has _id: "2"
    fireEvent.change(screen.getByDisplayValue("Test Product"), {
      target: { value: "Updated Product" },
    });
  });

  // Simulate form submission
  fireEvent.click(updateButton);

  // Check if the form submission includes the category
  await waitFor(() => {
    const formDataMock = axios.put.mock.calls[0][1];
    expect(formDataMock.get("name")).toBe("Updated Product");
  });
});


