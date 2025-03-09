/** @jest-environment jsdom */
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import axios from "axios";
import React from "react";
import { AuthProvider, useAuth } from "./auth";

jest.mock("axios");
jest.mock("react-hot-toast");

const MockComponent = () => {
  const [auth] = useAuth();
  return (
    <div>
      <p>{auth.user ? auth.user.name : "User Not Found"}</p>
      <p>{auth.token ? auth.token : "Token Not Found"}</p>
    </div>
  );
};

describe("AuthProvider Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.defaults.headers.common["Authorization"] = undefined;
    Object.defineProperty(window, "localStorage", {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  it("render with default authentication values", async () => {
    const { getByText } = render(
      <AuthProvider>
        <MockComponent />
      </AuthProvider>
    );
    expect(getByText("User Not Found")).toBeInTheDocument();
    expect(getByText("Token Not Found")).toBeInTheDocument();
    expect(axios.defaults.headers.common["Authorization"]).toBe("");
  });

  it("render with authentication values from local storage", async () => {
    Object.defineProperty(window, "localStorage", {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn((key) =>
          key === "auth"
            ? JSON.stringify({
                user: {
                  name: "Admin",
                  email: "test@example.com",
                  phone: "81234567",
                  address: "123 Street",
                },
                token: "123",
              })
            : null
        ),
        removeItem: jest.fn(),
      },
      writable: true,
    });
    const { getByText } = render(
      <AuthProvider>
        <MockComponent />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(getByText("Admin")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(getByText("123")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(axios.defaults.headers.common["Authorization"]).toBe("123");
    });
  });
});
