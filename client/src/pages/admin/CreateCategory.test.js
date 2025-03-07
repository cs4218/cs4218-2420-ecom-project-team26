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

jest.mock("axios");

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
  axios.get.mockResolvedValue({
    data: { success: true, category: mockCategories },
  });
  axios.post.mockResolvedValue({ data: { success: true } });
  axios.put.mockResolvedValue({ data: { success: true } });
  axios.delete.mockResolvedValue({ data: { success: true } });
});

afterEach(() => {
  jest.clearAllMocks();
});

test("renders CreateCategory component", async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Check if the heading is rendered
  expect(screen.getByText("Manage Category")).toBeInTheDocument();

  // Check if the form is rendered
  expect(screen.getByPlaceholderText("Enter new category")).toBeInTheDocument();
  expect(screen.getByText("Submit")).toBeInTheDocument();

  // Wait for the categories to be fetched and displayed
  await waitFor(() => {
    expect(screen.getAllByText("Category 1")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Category 2")[0]).toBeInTheDocument();
  });
});

test("handles form submission", async () => {
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

  // Check if the form submission is handled
  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith(
      "/api/v1/category/create-category",
      { name: "New Category" }
    );
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

  // Check if the error is handled
  await waitFor(() => {
    expect(
      screen.getByText(/something went wrong in input form/i)
    ).toBeInTheDocument();
  });
});

test("handles category update", async () => {
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
    expect(screen.getAllByText("Category 1")[0]).toBeInTheDocument();
  });

  // Simulate clicking the edit button
  const editButton = screen.getAllByRole("button", { name: /edit/i })[0];
  fireEvent.click(editButton);

  // Get the modal element
  const modal = screen.getByRole("dialog");

  // Simulate input change in the modal
  const modalInput = within(modal).getByPlaceholderText("Enter new category");
  fireEvent.change(modalInput, { target: { value: "Updated Category" } });

  // Simulate form submission in the modal
  const modalButton = within(modal).getByText("Submit");
  fireEvent.submit(modalButton.closest("form"));

  // Check if the category update is handled
  await waitFor(() => {
    expect(axios.put).toHaveBeenCalledWith(
      "/api/v1/category/update-category/1",
      { name: "Updated Category" }
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
    expect(screen.getAllByText("Category 1")[0]).toBeInTheDocument();
  });

  // Simulate clicking the edit button
  const editButton = screen.getAllByRole("button", { name: /edit/i })[0];
  fireEvent.click(editButton);

  // Get the modal element
  const modal = screen.getByRole("dialog");

  // Simulate input change in the modal
  const modalInput = within(modal).getByPlaceholderText("Enter new category");
  fireEvent.change(modalInput, { target: { value: "Updated Category" } });

  // Simulate form submission in the modal
  const modalButton = within(modal).getByText("Submit");
  fireEvent.submit(modalButton.closest("form"));

  // Check if the error is handled
  await waitFor(() => {
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});

test("handles category deletion", async () => {
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
    expect(screen.getAllByText("Category 1")[0]).toBeInTheDocument();
  });

  // Simulate clicking the delete button
  const deleteButton = screen.getAllByRole("button", { name: /delete/i })[0];
  fireEvent.click(deleteButton);

  // Check if the category deletion is handled
  await waitFor(() => {
    expect(axios.delete).toHaveBeenCalledWith(
      "/api/v1/category/delete-category/1"
    );
  });
});

test("handles category deletion error", async () => {
  axios.delete.mockRejectedValueOnce(new Error("Network Error"));

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
    expect(screen.getAllByText("Category 1")[0]).toBeInTheDocument();
  });

  // Simulate clicking the delete button
  const deleteButton = screen.getAllByRole("button", { name: /delete/i })[0];
  fireEvent.click(deleteButton);

  // Check if the error is handled
  await waitFor(() => {
    expect(screen.getAllByText(/something went wrong/i)[0]).toBeInTheDocument();
  });
});

test("handles fetch categories error", async () => {
  axios.get.mockRejectedValueOnce(new Error("Network Error"));

  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Check if the error is handled
  await waitFor(() => {
    expect(
      screen.getByText(/something went wrong in getting category/i)
    ).toBeInTheDocument();
  });
});

test("handles update category with no selected category", async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <CreateCategory />
        <Toaster />
      </BrowserRouter>
    );
  });

  // Simulate form submission without selecting a category
  const button = screen.getByText("Submit");
  fireEvent.submit(button.closest("form"));

  // Check if the form submission is handled
  await waitFor(() => {
    expect(axios.put).not.toHaveBeenCalled();
  });
});

test("handles unsuccessful category creation", async () => {
  axios.post.mockResolvedValueOnce({
    data: { success: false, message: "Category creation failed" },
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

  // Simulate form submission
  const button = screen.getByText("Submit");
  fireEvent.submit(button.closest("form"));

  // Check if the error message is displayed
  await waitFor(() => {
    expect(screen.getByText(/category creation failed/i)).toBeInTheDocument();
  });
});

test("handles unsuccessful category update", async () => {
  axios.put.mockResolvedValueOnce({
    data: { success: false, message: "Category update failed" },
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
    expect(screen.getAllByText("Category 1")[0]).toBeInTheDocument();
  });

  // Simulate clicking the edit button
  const editButton = screen.getAllByRole("button", { name: /edit/i })[0];
  fireEvent.click(editButton);

  // Get the modal element
  const modal = screen.getByRole("dialog");

  // Simulate input change in the modal
  const modalInput = within(modal).getByPlaceholderText("Enter new category");
  fireEvent.change(modalInput, { target: { value: "Updated Category" } });

  // Simulate form submission in the modal
  const modalButton = within(modal).getByText("Submit");
  fireEvent.submit(modalButton.closest("form"));

  // Check if the error message is displayed
  await waitFor(() => {
    expect(screen.getByText(/category update failed/i)).toBeInTheDocument();
  });
});

test("handles unsuccessful category deletion", async () => {
  axios.delete.mockResolvedValueOnce({
    data: { success: false, message: "Category deletion failed" },
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
    expect(screen.getAllByText("Category 1")[0]).toBeInTheDocument();
  });

  // Simulate clicking the delete button
  const deleteButton = screen.getAllByRole("button", { name: /delete/i })[0];
  fireEvent.click(deleteButton);

  // Check if the error message is displayed
  await waitFor(() => {
    expect(screen.getByText(/category deletion failed/i)).toBeInTheDocument();
  });
});