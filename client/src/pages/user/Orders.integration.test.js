/** @jest-environment jsdom */
import "@testing-library/jest-dom/extend-expect";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import axios from "axios";
import DropIn from "braintree-web-drop-in-react";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../../context/auth";
import CartPage from "../CartPage";
import Dashboard from "./Dashboard";
import Orders from "./Orders";

jest.mock("axios");
jest.mock("react-hot-toast");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const cart = [
  {
    _id: "1",
    name: "Novel",
    description: "A bestselling novel",
    price: 14.99,
  },
];

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [cart, jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("braintree-web-drop-in-react", () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mocked DropIn Component</div>),
}));

describe("Orders Page Integration Tests", () => {
  const user = {
    address: "123 Street",
    email: "test@example.com",
    name: "Admin",
    phone: "81234567",
    role: 0,
    _id: "1",
  };

  const token = 123;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global.console, "log");
    localStorage.setItem("auth", JSON.stringify({ user, token }));
  });

  afterEach(() => {
    localStorage.clear();
    global.console.log.mockRestore();
  });

  it("items ordered from cartPage should appear in orders page", async () => {
    // arrange

    localStorage.setItem("cart", JSON.stringify(cart));

    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/auth/orders") {
        return Promise.resolve({
          data: [
            {
              products: cart,
              payment: {
                success: true,
              },
              buyer: {
                name: user.name,
              },
              status: "Not Process",
              createdAt: "2025-02-09T13:53:54.339Z",
            },
          ],
        });
      }
      if (url === "/api/v1/product/braintree/token") {
        return Promise.resolve({
          data: { clientToken: "mocked-braintree-token" },
        });
      }
      return Promise.resolve({ data: {} });
    });

    axios.post.mockResolvedValue({
      data: { response: "Payment successful!" },
    });

    const mockInstance = {
      requestPaymentMethod: jest
        .fn()
        .mockResolvedValue({ nonce: "fake-nonce" }),
    };

    DropIn.mockImplementation(({ onInstance }) => {
      useEffect(() => {
        onInstance(mockInstance);
      }, [onInstance]);

      return <div>Mocked DropIn Component</div>;
    });

    // act
    await act(async () => {
      render(
        <AuthProvider>
          <MemoryRouter initialEntries={["/cart"]}>
            <Routes>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/dashboard/user" element={<Dashboard />} />
              <Route path="/dashboard/user/orders" element={<Orders />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      );
    });
    // ensure cart items are loaded
    expect(screen.getByText("Novel")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token");
    });
    await waitFor(() => {
      expect(screen.getByText("Make Payment")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Mocked DropIn Component")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Make Payment")).toBeEnabled();
    });
    act(() => {
      fireEvent.click(screen.queryByText("Make Payment"));
    });

    // ensure that navigate has been called
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/orders");
    });
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Payment Completed Successfully "
      );
    });

    // simulate navigation
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: user.name }));
    });
    act(() => {
      fireEvent.click(screen.getByRole("link", { name: "Dashboard" }));
    });
    act(() => {
      fireEvent.click(screen.getByRole("link", { name: "Orders" }));
    });

    // assert
    await waitFor(() => {
      expect(screen.getByText("All Orders")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
    });
    await waitFor(() => {
      expect(screen.getByText("Novel")).toBeInTheDocument();
    });
    expect(screen.getByText("A bestselling novel")).toBeInTheDocument();
    expect(screen.getByText("Price : 14.99")).toBeInTheDocument();
    const novelImage = screen.getByAltText("Novel");
    expect(novelImage).toBeInTheDocument();
    expect(novelImage).toHaveAttribute(
      "src",
      "/api/v1/product/product-photo/1"
    );
  });
});
