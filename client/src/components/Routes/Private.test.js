import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import Private from "./Private";
import { useAuth } from "../../context/auth";

// Mock the required modules
jest.mock("axios");
jest.mock("../../context/auth");

// Mock the Spinner component
jest.mock("../Spinner", () => {
  return function MockSpinner({ path }) {
    return <div data-testid="mock-spinner" data-path={path}>Loading...</div>;
  };
});

// Mock the Outlet component from react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Outlet: () => <div data-testid="mock-outlet">Protected Content</div>,
}));

describe("Private Route Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication Flow", () => {
    test("shows spinner when auth check is in progress", () => {
      // Mock auth context with token
      useAuth.mockReturnValue([{ token: "test-token" }, jest.fn()]);
      
      // Mock API call but don't resolve it yet
      axios.get.mockImplementation(() => new Promise(() => {}));

      render(
        <BrowserRouter>
          <Private />
        </BrowserRouter>
      );

      expect(screen.getByTestId("mock-spinner")).toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    test("renders protected content when user is authenticated", async () => {
      // Mock auth context with token
      useAuth.mockReturnValue([{ token: "test-token" }, jest.fn()]);
      
      // Mock successful auth check
      axios.get.mockResolvedValueOnce({ data: { ok: true } });

      render(
        <BrowserRouter>
          <Private />
        </BrowserRouter>
      );

      // Initially shows spinner
      expect(screen.getByTestId("mock-spinner")).toBeInTheDocument();

      // Then shows protected content
      await waitFor(() => {
        expect(screen.getByTestId("mock-outlet")).toBeInTheDocument();
      });

      expect(screen.getByText("Protected Content")).toBeInTheDocument();

      // Verify API call
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/user-auth");
    });

    test("shows spinner with empty path when authentication fails", async () => {
      // Mock auth context with token
      useAuth.mockReturnValue([{ token: "test-token" }, jest.fn()]);
      
      // Mock failed auth check
      axios.get.mockResolvedValueOnce({ data: { ok: false } });

      render(
        <BrowserRouter>
          <Private />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId("mock-spinner")).toBeInTheDocument();
      });

      const spinner = screen.getByTestId("mock-spinner");
      expect(spinner.getAttribute("data-path")).toBe("");
    });
  });

  describe("Token Handling", () => {
    test("doesn't make auth check when no token is present", () => {
      // Mock auth context without token
      useAuth.mockReturnValue([{}, jest.fn()]);

      render(
        <BrowserRouter>
          <Private />
        </BrowserRouter>
      );

      expect(axios.get).not.toHaveBeenCalled();
      expect(screen.getByTestId("mock-spinner")).toBeInTheDocument();
    });

    test("makes auth check when token becomes available", async () => {
      // Start without token
      const setAuth = jest.fn();
      useAuth.mockReturnValue([{}, setAuth]);

      const { rerender } = render(
        <BrowserRouter>
          <Private />
        </BrowserRouter>
      );

      // Initially no API call
      expect(axios.get).not.toHaveBeenCalled();

      // Update with token
      useAuth.mockReturnValue([{ token: "new-token" }, setAuth]);
      axios.get.mockResolvedValueOnce({ data: { ok: true } });

      rerender(
        <BrowserRouter>
          <Private />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/user-auth");
      });

      await waitFor(() => {
        expect(screen.getByTestId("mock-outlet")).toBeInTheDocument();
      });
    });
  });
}); 