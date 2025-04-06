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

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ slug: "test-product" }),
  useNavigate: () => mockNavigate
}));

test("navigates to product page after successful update", async () => {
  mockNavigate.mockClear();
  
  axios.put.mockResolvedValueOnce({ 
    data: { 
      success: true,
      message: "Product updated successfully" 
    } 
  });

  await act(async () => {
    render(
      <BrowserRouter>
        <UpdateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  await waitFor(() => {
    expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
  });

  const nameInput = screen.getByDisplayValue("Test Product");
  fireEvent.change(nameInput, { target: { value: "Updated Product Name" } });

  const updateButton = screen.getByText("UPDATE PRODUCT");
  
  await act(async () => {
    fireEvent.click(updateButton);
  });

  await new Promise(resolve => setTimeout(resolve, 100));
  
  expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
});

test("displays updated product data on the page after fetch", async () => {
  const updatedProduct = {
    ...mockProduct,
    name: "Recently Updated Product",
    price: 199,
    quantity: 25,
    description: "This is an updated description"
  };
  
  axios.get.mockImplementationOnce((url) => {
    if (url.includes("/get-product/")) {
      return Promise.resolve({
        data: { success: true, product: updatedProduct },
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

  await waitFor(() => {
    expect(screen.getByDisplayValue("Recently Updated Product")).toBeInTheDocument();
    expect(screen.getByDisplayValue("This is an updated description")).toBeInTheDocument();
    expect(screen.getByDisplayValue("199")).toBeInTheDocument(); // updated price
    expect(screen.getByDisplayValue("25")).toBeInTheDocument(); // updated quantity
  });
});

test("verifies form data correctly updates UI state", async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <UpdateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  await waitFor(() => {
    expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
  });

  const nameInput = screen.getByDisplayValue("Test Product");
  const descriptionInput = screen.getByDisplayValue("Test Description");
  const priceInput = screen.getByDisplayValue("100");
  const quantityInput = screen.getByDisplayValue("10");
  
  fireEvent.change(nameInput, { target: { value: "Integration Test Product" } });
  fireEvent.change(descriptionInput, { target: { value: "Integration Test Description" } });
  fireEvent.change(priceInput, { target: { value: "250" } });
  fireEvent.change(quantityInput, { target: { value: "50" } });
  
  expect(screen.getByDisplayValue("Integration Test Product")).toBeInTheDocument();
  expect(screen.getByDisplayValue("Integration Test Description")).toBeInTheDocument();
  expect(screen.getByDisplayValue("250")).toBeInTheDocument();
  expect(screen.getByDisplayValue("50")).toBeInTheDocument();
});

test("redirects to dashboard after successful product deletion", async () => {
  mockNavigate.mockClear();
  
  axios.delete.mockResolvedValueOnce({
    data: { success: true, message: "Product deleted successfully" }
  });

  await act(async () => {
    render(
      <BrowserRouter>
        <UpdateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  await waitFor(() => {
    expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
  });

  const deleteButton = screen.getByText("DELETE PRODUCT");
  
  await act(async () => {
    fireEvent.click(deleteButton);
  });
  
  await new Promise(resolve => setTimeout(resolve, 100));

  expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
});


test("form submission sends correct data to API", async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <UpdateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  await waitFor(() => {
    expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
  });

  fireEvent.change(screen.getByDisplayValue("Test Product"), { 
    target: { value: "API Integration Test Product" } 
  });
  
  fireEvent.change(screen.getByDisplayValue("Test Description"), { 
    target: { value: "API Integration Description" } 
  });
  
  fireEvent.change(screen.getByDisplayValue("100"), { 
    target: { value: "399" } 
  });

  const updateButton = screen.getByText("UPDATE PRODUCT");
  fireEvent.click(updateButton);

  await waitFor(() => {
    const formDataMock = axios.put.mock.calls[0][1];
    expect(formDataMock.get("name")).toBe("API Integration Test Product");
    expect(formDataMock.get("description")).toBe("API Integration Description");
    expect(formDataMock.get("price")).toBe("399");
    expect(axios.put).toHaveBeenCalledWith(
      "/api/v1/product/update-product/123",
      expect.any(FormData)
    );
  });
});

