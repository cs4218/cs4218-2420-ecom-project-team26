import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import { useAuth } from "../../context/auth";

// Mock the required modules
jest.mock("../../context/auth");

// Mock Layout component
jest.mock("../../components/Layout", () => {
  return ({ children, title }) => (
    <div data-testid="mock-layout" data-title={title}>
      {children}
    </div>
  );
});

// Mock UserMenu component
jest.mock("../../components/UserMenu", () => {
  return () => <div data-testid="mock-user-menu">User Menu</div>;
});

const mockUser = {
  name: "Test User",
  email: "test@example.com",
  address: "123 Test St"
};

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe("User Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("check if Layout component exist with correct title", () => {
    useAuth.mockReturnValue([{ user: mockUser }]);
    
    renderDashboard();

    const layout = screen.getByTestId("mock-layout");
    expect(layout).toHaveAttribute("data-title", "Dashboard - Ecommerce App");
  });

  test("check if UserMenu component exist", () => {
    useAuth.mockReturnValue([{ user: mockUser }]);
    
    renderDashboard();

    expect(screen.getByTestId("mock-user-menu")).toBeInTheDocument();
  });

  test("displays user information correctly", () => {
    useAuth.mockReturnValue([{ user: mockUser }]);
    
    renderDashboard();
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText(mockUser.address)).toBeInTheDocument();
  });

  test("handles missing user data", () => {
    useAuth.mockReturnValue([{}]);
    
    renderDashboard();

    const layout = screen.getByTestId("mock-layout");
    expect(layout).toBeInTheDocument();
  });
});
