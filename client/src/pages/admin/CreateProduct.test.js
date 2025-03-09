import React from "react";
import Layout from "./../../components/Layout";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  findByRole,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import CreateProduct from "./CreateProduct";
import { BrowserRouter } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

jest.mock("axios");
jest.mock("react-hot-toast");

const mockCategories = [
  { _id: "1", name: "Category 1" },
  { _id: "2", name: "Category 2" },
];

const mockAuth = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    phone: "1234-5678",
  },
  token: "mock-token",
};

const mockCart = [];
const mockSearch = {
  keyword: "",
  results: [],
};

jest.mock("../../context/auth", () => ({
  ...jest.requireActual("../../context/auth"),
  useAuth: () => [mockAuth, jest.fn()],
}));

jest.mock("../../context/cart", () => ({
  ...jest.requireActual("../../context/cart"),
  useCart: () => [mockCart, jest.fn()],
}));

jest.mock("../../context/search", () => ({
  ...jest.requireActual("../../context/search"),
  useSearch: () => [mockSearch, jest.fn()],
}));

jest.mock("../../hooks/useCategory", () => ({
  __esModule: true,
  default: jest.fn(() => mockCategories),
}));

jest.mock("antd", () => {
  const ActualAntd = jest.requireActual("antd");
  const MockSelect = ({ children, onChange, value, placeholder }) => {
    const selectedValue = value;
    const handleChange = (val) => {
      onChange(val);
    };
    return (
      <div data-testid="mock-select">
        <span data-testid="select-placeholder">{placeholder}</span>
        {children.map((child) => (
          <div
            key={child.key}
            data-testid={`select-option-${child.key}`}
            onClick={() => handleChange(child.key)}
          >
            {child.props.children}
          </div>
        ))}
      </div>
    );
  };
  return {
    ...ActualAntd,
    Select: MockSelect,
  };
});

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

beforeEach(() => {
  axios.get.mockResolvedValue({
    data: { success: true, category: mockCategories },
  });
  axios.post.mockResolvedValue({ data: { success: true } });
});

afterEach(() => {
  jest.clearAllMocks();
});

test("renders CreateProduct component", async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <CreateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Check if the heading is rendered
  expect(screen.getAllByText("Create Product")[0]).toBeInTheDocument();

  // Check if the form elements are rendered
  expect(screen.getByText("Select a category")).toBeInTheDocument();
  expect(screen.getByText("Upload Photo")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("write a name")).toBeInTheDocument();
  expect(
    screen.getByPlaceholderText("write a description")
  ).toBeInTheDocument();
  expect(screen.getByPlaceholderText("write a Price")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("write a quantity")).toBeInTheDocument();
  expect(screen.getByText("Select Shipping")).toBeInTheDocument();
  expect(screen.getByText("CREATE PRODUCT")).toBeInTheDocument();

  // Wait for the categories to be fetched and displayed
  await waitFor(() => {
    expect(screen.getByTestId("select-option-1")).toBeInTheDocument();
    expect(screen.getByTestId("select-option-2")).toBeInTheDocument();
  });
});

test("handles fetch categories error", async () => {
  axios.get.mockRejectedValueOnce(new Error("Network Error"));

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Check if the error is handled
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith(
      "Something went wrong in getting category"
    );
  });
});

test("handles successful product creation", async () => {
  axios.post.mockResolvedValueOnce({ data: { success: true } });

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Simulate input changes
  fireEvent.change(screen.getByPlaceholderText("write a name"), {
    target: { value: "New Product" },
  });
  fireEvent.change(screen.getByPlaceholderText("write a description"), {
    target: { value: "Product Description" },
  });
  fireEvent.change(screen.getByPlaceholderText("write a Price"), {
    target: { value: "100" },
  });
  fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
    target: { value: "10" },
  });

  // Simulate category selection
  fireEvent.click(screen.getByTestId("select-option-1"));

  // Simulate shipping selection
  fireEvent.click(screen.getByTestId("select-option-1"));

  // Simulate file input change
  const file = new File(["photo"], "photo.png", { type: "image/png" });
  fireEvent.change(screen.getByLabelText("Upload Photo"), {
    target: { files: [file] },
  });

  // Simulate form submission
  const createProductButton = await screen.findByRole("button", {
    name: /CREATE PRODUCT/i,
  });
  fireEvent.click(createProductButton);

  // Check if the product creation is handled
  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith(
      "/api/v1/product/create-product",
      expect.any(FormData)
    );
    expect(toast.success).toHaveBeenCalledWith("Product Created Successfully");
  });
});

test("handles product creation error", async () => {
  axios.post.mockRejectedValueOnce(new Error("Network Error"));

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Simulate input changes
  fireEvent.change(screen.getByPlaceholderText("write a name"), {
    target: { value: "New Product" },
  });
  fireEvent.change(screen.getByPlaceholderText("write a description"), {
    target: { value: "Product Description" },
  });
  fireEvent.change(screen.getByPlaceholderText("write a Price"), {
    target: { value: "100" },
  });
  fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
    target: { value: "10" },
  });

  // Simulate category selection
  fireEvent.click(screen.getByTestId("select-option-1"));

  // Simulate shipping selection
  fireEvent.click(screen.getByTestId("select-option-1"));

  // Simulate file input change
  const file = new File(["photo"], "photo.png", { type: "image/png" });
  fireEvent.change(screen.getByLabelText("Upload Photo"), {
    target: { files: [file] },
  });

  // Simulate form submission
  const createProductButton = await screen.findByRole("button", {
    name: /CREATE PRODUCT/i,
  });
  fireEvent.click(createProductButton);

  // Check if the error is handled
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith("something went wrong");
  });
});

test("handles unsuccessful product creation", async () => {
  axios.post.mockResolvedValueOnce({
    data: { success: false, message: "Product creation failed" },
  });

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Simulate input changes
  fireEvent.change(screen.getByPlaceholderText("write a name"), {
    target: { value: "New Product" },
  });
  fireEvent.change(screen.getByPlaceholderText("write a description"), {
    target: { value: "Product Description" },
  });
  fireEvent.change(screen.getByPlaceholderText("write a Price"), {
    target: { value: "100" },
  });
  fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
    target: { value: "10" },
  });

  // Simulate category selection
  fireEvent.click(screen.getByTestId("select-option-1"));

  // Simulate shipping selection
  fireEvent.click(screen.getByTestId("select-option-1"));

  // Simulate file input change
  const file = new File(["photo"], "photo.png", { type: "image/png" });
  fireEvent.change(screen.getByLabelText("Upload Photo"), {
    target: { files: [file] },
  });

  // Simulate form submission
  const createProductButton = await screen.findByRole("button", {
    name: /CREATE PRODUCT/i,
  });
  fireEvent.click(createProductButton);

  // Check if the error message is displayed
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith("Product creation failed");
  });
});

test("handles form validation errors", async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <CreateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Simulate form submission without filling required fields
  const createProductButton = await screen.findByRole("button", {
    name: /CREATE PRODUCT/i,
  });
  fireEvent.click(createProductButton);

  // Check if the validation errors are handled
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith("something went wrong");
  });
});

test("handles successful category fetching", async () => {
  axios.get.mockResolvedValueOnce({
    data: { success: true, category: mockCategories },
  });

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Check if the categories are fetched and displayed
  await waitFor(() => {
    expect(screen.getByTestId("select-option-1")).toBeInTheDocument();
    expect(screen.getByTestId("select-option-2")).toBeInTheDocument();
  });
});

test("handles unsuccessful category fetching", async () => {
  axios.get.mockRejectedValueOnce(new Error("Network Error"));

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Check if the error is handled
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith(
      "Something went wrong in getting category"
    );
  });
});

test("handles product creation with missing fields", async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <CreateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Simulate input changes with missing fields
  fireEvent.change(screen.getByPlaceholderText("write a name"), {
    target: { value: "New Product" },
  });

  // Simulate form submission
  const createProductButton = await screen.findByRole("button", {
    name: /CREATE PRODUCT/i,
  });
  fireEvent.click(createProductButton);

  // Check if the validation errors are handled
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith("something went wrong");
  });
});

test("handles product creation with invalid data", async () => {
  axios.post.mockResolvedValueOnce({
    data: { success: false, message: "Invalid data" },
  });

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateProduct />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Simulate input changes with invalid data
  fireEvent.change(screen.getByPlaceholderText("write a name"), {
    target: { value: "New Product" },
  });
  fireEvent.change(screen.getByPlaceholderText("write a description"), {
    target: { value: "Product Description" },
  });
  fireEvent.change(screen.getByPlaceholderText("write a Price"), {
    target: { value: "-100" }, // Invalid price
  });
  fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
    target: { value: "-10" }, // Invalid quantity
  });

  // Simulate category selection
  fireEvent.click(screen.getByTestId("select-option-1"));

  // Simulate shipping selection
  fireEvent.click(screen.getByTestId("select-option-1"));

  // Simulate file input change
  const file = new File(["photo"], "photo.png", { type: "image/png" });
  fireEvent.change(screen.getByLabelText("Upload Photo"), {
    target: { files: [file] },
  });

  // Simulate form submission
  const createProductButton = await screen.findByRole("button", {
    name: /CREATE PRODUCT/i,
  });
  fireEvent.click(createProductButton);

  // Check if the error message is displayed
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith("Invalid data");
  });
});
