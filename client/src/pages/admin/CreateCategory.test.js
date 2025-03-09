import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import CreateCategory from "./CreateCategory";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Modal } from "antd";
import toast from "react-hot-toast";

// Mock dependencies
jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
  Toaster: () => <div data-testid="mock-toaster" />,
}));

// Mock the Layout and AdminMenu components
jest.mock("./../../components/Layout", () => ({ children, title }) => (
  <div data-testid="mock-layout" title={title}>
    {children}
  </div>
));

jest.mock("./../../components/AdminMenu", () => () => (
  <div data-testid="mock-admin-menu">AdminMenu</div>
));

// Mock the CategoryForm component
jest.mock(
  "../../components/Form/CategoryForm",
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

// Mock the Modal component from antd
jest.mock("antd", () => {
  const originalModule = jest.requireActual("antd");
  return {
    ...originalModule,
    Modal: ({ children, visible, onCancel }) =>
      visible ? (
        <div data-testid="mock-modal" className="ant-modal">
          <button onClick={onCancel}>Cancel</button>
          <div className="ant-modal-content">{children}</div>
        </div>
      ) : null,
  };
});

const mockCategories = [
  {
    _id: "66db427fdb0119d9234b27ed",
    name: "Electronics",
    slug: "electronics",
    __v: 0,
  },
  {
    _id: "66db427fdb0119d9234b27ef",
    name: "Book",
    slug: "book",
    __v: 0,
  },
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

jest.mock("../../context/auth", () => ({
  ...jest.requireActual("../../.context/auth"),
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

beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();

  // Default mock responses
  axios.get.mockResolvedValue({
    data: { success: true, category: mockCategories },
  });

  axios.post.mockResolvedValue({
    data: {
      success: true,
      category: {
        _id: "66db427fdb0119d9234b27ff",
        name: "New Category",
        slug: "new-category",
        __v: 0,
      },
    },
  });

  axios.put.mockResolvedValue({
    data: {
      success: true,
      category: {
        _id: "66db427fdb0119d9234b27ed",
        name: "Updated Electronics",
        slug: "updated-electronics",
        __v: 0,
      },
    },
  });

  axios.delete.mockResolvedValue({
    data: { success: true },
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test("renders CreateCategory component with layout and admin menu", async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
      </BrowserRouter>
    );
  });

  // Check if Layout is rendered with correct title
  expect(screen.getByTestId("mock-layout")).toHaveAttribute(
    "title",
    "Dashboard - Create Category"
  );

  // Check if AdminMenu is rendered
  expect(screen.getByTestId("mock-admin-menu")).toBeInTheDocument();

  // Check if the heading is rendered
  expect(screen.getByText("Manage Category")).toBeInTheDocument();

  // Check if CategoryForm is rendered
  expect(screen.getByTestId("mock-category-form")).toBeInTheDocument();

  // Check if categories are fetched and displayed
  await waitFor(() => {
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Book")).toBeInTheDocument();
  });

  // Check if the table headers are rendered
  expect(screen.getByText("Name")).toBeInTheDocument();
  expect(screen.getByText("Actions")).toBeInTheDocument();

  // Check if Edit and Delete buttons are rendered for each category
  expect(screen.getAllByText("Edit").length).toBe(2);
  expect(screen.getAllByText("Delete").length).toBe(2);
});

test("handles form submission", async () => {
  const payloadSpy = jest.fn();

  // Mock successful response with category data
  axios.post.mockImplementationOnce((url, payload) => {
    payloadSpy(payload);

    return Promise.resolve({
      data: {
        success: true,
        category: {
          _id: "66db427fdb0119d9234b27ff",
          name: "New Category",
          slug: "new-category",
          __v: 0,
        },
        message: "Category created successfully",
      },
    });
  });

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Simulate input change
  const input = screen.getByPlaceholderText("Enter new category");
  fireEvent.change(input, { target: { value: "New Category" } });

  // Submit the form
  const form = screen
    .getByPlaceholderText("Enter new category")
    .closest("form");
  await act(async () => {
    fireEvent.submit(form);
  });

  expect(payloadSpy).toHaveBeenCalledWith({ name: "New Category" });

  await waitFor(() => {
    // Verify success toast is displayed
    expect(toast.success).toHaveBeenCalledWith("New Category is created");

    // Verify input field is updated after successful submission
    expect(input.value).toBe("New Category");
  });
});

test("handles form submission error", async () => {
  axios.post.mockRejectedValueOnce(new Error("Network Error"));

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Simulate input change
  const input = screen.getByPlaceholderText("Enter new category");
  fireEvent.change(input, { target: { value: "New Category" } });

  // Simulate form submission
  const button = screen.getByText("Submit");
  fireEvent.submit(button.closest("form"));

  // Check if the error is handled by verifying the toast function was called
  await waitFor(() => {
    // Note the typo in the actual error message - "somthing" instead of "something"
    expect(toast.error).toHaveBeenCalledWith(
      "Something went wrong in input form"
    );
  });
});

test("handles category update", async () => {
  // Mock successful update response
  axios.put.mockResolvedValueOnce({
    data: {
      success: true,
      category: {
        _id: "66db427fdb0119d9234b27ed",
        name: "Updated Electronics",
        slug: "updated-electronics",
        __v: 0,
      },
    },
  });

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Wait for the categories to be fetched and displayed
  await waitFor(() => {
    expect(screen.getAllByText("Electronics")[0]).toBeInTheDocument();
  });

  // Find and click the Edit button
  const editButtons = screen.getAllByText("Edit");
  await act(async () => {
    fireEvent.click(editButtons[0]);
  });

  // Wait for the modal to appear in the document body
  await waitFor(() => {
    // Look for the modal in the document body
    const modalElement = document.querySelector(".ant-modal");
    expect(modalElement).toBeInTheDocument();

    // Find the form inside the modal
    const form = modalElement.querySelector(
      '[data-testid="mock-category-form"]'
    );
    expect(form).toBeInTheDocument();

    // Find the input inside the form
    const input = form.querySelector('[data-testid="category-input"]');
    expect(input).toHaveValue("Electronics");

    // Update the input value
    fireEvent.change(input, { target: { value: "Updated Electronics" } });

    // Submit the form
    fireEvent.submit(form);
  });

  // Check if the category update is handled
  await waitFor(() => {
    expect(axios.put).toHaveBeenCalledWith(
      "/api/v1/category/update-category/66db427fdb0119d9234b27ed",
      { name: "Updated Electronics" }
    );
  });
});

test("handles category update error", async () => {
  axios.put.mockRejectedValueOnce(new Error("Network Error"));

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Wait for the categories to be fetched and displayed
  await waitFor(() => {
    expect(screen.getAllByText("Electronics")[0]).toBeInTheDocument();
  });

  // Find and click the Edit button
  const editButtons = screen.getAllByText("Edit");
  await act(async () => {
    fireEvent.click(editButtons[0]);
  });

  // Wait for the modal to appear in the document body
  await waitFor(() => {
    // Look for the modal in the document body
    const modalElement = document.querySelector(".ant-modal");
    expect(modalElement).toBeInTheDocument();

    // Find the form inside the modal
    const form = modalElement.querySelector(
      '[data-testid="mock-category-form"]'
    );
    expect(form).toBeInTheDocument();

    // Find the input inside the form
    const input = form.querySelector('[data-testid="category-input"]');
    expect(input).toBeInTheDocument();

    // Update the category name
    fireEvent.change(input, { target: { value: "Updated Electronics" } });

    // Submit the form
    fireEvent.submit(form);
  });

  // Check if the error is handled
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });
});

test("handles category deletion", async () => {
  // Mock successful delete response
  axios.delete.mockResolvedValueOnce({
    data: { success: true },
  });

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Wait for categories to load
  await waitFor(() => {
    expect(screen.getAllByText("Electronics")[0]).toBeInTheDocument();
  });

  // Find and click the Delete button for the first category
  const deleteButtons = screen.getAllByText("Delete");
  await act(async () => {
    fireEvent.click(deleteButtons[0]);
  });

  // Check if the API was called correctly
  await waitFor(() => {
    expect(axios.delete).toHaveBeenCalledWith(
      "/api/v1/category/delete-category/66db427fdb0119d9234b27ed"
    );
  });

  // Check for success toast
  expect(toast.success).toHaveBeenCalledWith("category is deleted");
});

test("handles category deletion error", async () => {
  // Mock failed delete response
  axios.delete.mockRejectedValueOnce(new Error("Network Error"));

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Wait for categories to load
  await waitFor(() => {
    expect(screen.getAllByText("Electronics")[0]).toBeInTheDocument();
  });

  // Find and click the Delete button for the first category
  const deleteButtons = screen.getAllByText("Delete");
  await act(async () => {
    fireEvent.click(deleteButtons[0]);
  });

  // Check if the error is handled
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });
});

test("handles API failure response when creating a category", async () => {
  // Mock an API call that returns a failure response
  axios.post.mockResolvedValueOnce({
    data: {
      success: false,
      message: "Category already exists",
    },
  });

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Find the create category form
  const input = screen.getByPlaceholderText("Enter new category");
  const submitButton = screen.getByText("Submit");

  // Enter a category name and submit
  await act(async () => {
    fireEvent.change(input, { target: { value: "Existing Category" } });
    fireEvent.click(submitButton);
  });

  // Check for error toast with the message from the API
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith("Category already exists");
  });
});

test("handles API failure response when deleting a category", async () => {
  // Mock an API call that returns a failure response
  axios.delete.mockResolvedValueOnce({
    data: {
      success: false,
      message: "Cannot delete category with associated products",
    },
  });

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Wait for categories to load
  await waitFor(() => {
    expect(screen.getAllByText("Electronics")[0]).toBeInTheDocument();
  });

  // Find and click the Delete button
  const deleteButtons = screen.getAllByText("Delete");
  await act(async () => {
    fireEvent.click(deleteButtons[0]);
  });

  // Check for error toast with the message from the API
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith(
      "Cannot delete category with associated products"
    );
  });
});

test("handles empty form submission", async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Submit the form without entering any value
  const form = screen.getByTestId("mock-category-form");
  await act(async () => {
    fireEvent.submit(form);
  });

  // Verify that the API call was made with an empty name
  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith(
      "/api/v1/category/create-category",
      { name: "" }
    );
  });
});

test("handles fetch categories error", async () => {
  // Mock API error for category fetching
  axios.get.mockRejectedValueOnce(new Error("Network Error"));

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Check if the error toast was displayed
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith(
      "Something went wrong in getting category"
    );
  });
});

test("handles updating category with same name", async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Wait for categories to load
  await waitFor(() => {
    expect(screen.getAllByText("Electronics")[0]).toBeInTheDocument();
  });

  // Find and click the Edit button
  const editButtons = screen.getAllByText("Edit");
  await act(async () => {
    fireEvent.click(editButtons[0]);
  });

  // Wait for the modal to appear
  await waitFor(() => {
    const modalElement = document.querySelector(".ant-modal");
    expect(modalElement).toBeInTheDocument();

    // Find the form inside the modal
    const form = modalElement.querySelector(
      '[data-testid="mock-category-form"]'
    );

    // Submit the form without changing the value (same name)
    fireEvent.submit(form);
  });

  // Verify the API call was made with the same name
  await waitFor(() => {
    expect(axios.put).toHaveBeenCalledWith(
      "/api/v1/category/update-category/66db427fdb0119d9234b27ed",
      { name: "Electronics" }
    );
  });
});

test("renders correctly with empty categories array", async () => {
  // Mock empty categories response
  axios.get.mockResolvedValueOnce({
    data: {
      success: true,
      category: [],
    },
  });

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Verify table is rendered but with no category rows
  const table = screen.getByRole("table");
  expect(table).toBeInTheDocument();

  // Check that no category rows are rendered
  const tableBody = table.querySelector("tbody");
  expect(tableBody.children.length).toBe(0);
});

test("handles non-success response when fetching categories", async () => {
  // Mock non-success response
  axios.get.mockResolvedValueOnce({
    data: {
      success: false,
      message: "Failed to fetch categories",
    },
  });

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Verify categories state remains empty
  const table = screen.getByRole("table");
  const tableBody = table.querySelector("tbody");
  expect(tableBody.children.length).toBe(0);
});

test("handles modal visibility state changes", async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Wait for categories to load
  await waitFor(() => {
    expect(screen.getAllByText("Electronics")[0]).toBeInTheDocument();
  });

  // Initially modal should not be visible
  expect(document.querySelector(".ant-modal")).not.toBeInTheDocument();

  // Click edit button to show modal
  const editButton = screen.getAllByText("Edit")[0];
  await act(async () => {
    fireEvent.click(editButton);
  });

  // Modal should now be visible
  await waitFor(() => {
    expect(document.querySelector(".ant-modal")).toBeInTheDocument();
  });

  // Find the Cancel button by its text instead of using the close icon
  const cancelButton = screen.getByText("Cancel");
  await act(async () => {
    fireEvent.click(cancelButton);
  });

  // Modal should be hidden again
  await waitFor(() => {
    expect(document.querySelector(".ant-modal")).not.toBeInTheDocument();
  });
});
