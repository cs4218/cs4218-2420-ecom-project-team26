import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { BrowserRouter } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import { AuthProvider } from "../../context/auth"; 

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

test("renders AdminDashboard component", () => {
  render(
    <AuthProvider>
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    </AuthProvider>
  );

  // Check if the AdminMenu component is rendered
  expect(screen.getByText("Admin Panel")).toBeInTheDocument();

  // Check if the admin details are rendered correctly
  expect(screen.getByText("Admin Name : Admin User")).toBeInTheDocument();
  expect(screen.getByText("Admin Email : admin@example.com")).toBeInTheDocument();
  expect(screen.getByText("Admin Contact : 123-456-7890")).toBeInTheDocument();
});
