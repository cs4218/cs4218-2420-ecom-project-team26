import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { render, screen, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Users from "./Users";

jest.mock("../../context/auth", () => ({
  useAuth: () => [{ token: 'test-token', user: { role: 1 } }, jest.fn()],
  AuthProvider: ({ children }) => children
}));

// Mock Layout component
jest.mock("../../components/Layout", () => {
  return ({ children, title }) => (
    <div data-testid="mock-layout" data-title={title}>
      {children}
    </div>
  );
});

// Mock AdminMenu component
jest.mock("../../components/AdminMenu", () => {
  return () => <div data-testid="mock-admin-menu">Admin Menu</div>;
});

const renderUsers = () => {
  return render(
    <BrowserRouter>
      <Users />
    </BrowserRouter>
  );
};

describe("Admin Users Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders with correct layout title", () => {
    renderUsers();
    
    const layout = screen.getByTestId("mock-layout");
    expect(layout).toHaveAttribute("data-title", "Dashboard - All Users");
  });

  test("renders admin menu", () => {
    renderUsers();
    
    expect(screen.getByTestId("mock-admin-menu")).toBeInTheDocument();
  });

  test("displays all users header", () => {
    renderUsers();
    
    expect(screen.getByRole("heading", { name: /all users/i })).toBeInTheDocument();
  });

}); 