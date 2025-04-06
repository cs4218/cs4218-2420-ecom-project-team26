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
import React from "react";
import toast from "react-hot-toast";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/auth";
import { CartProvider } from "../context/cart";
import CartPage from "./CartPage";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("braintree-web-drop-in-react", () => ({
  __esModule: true,
  default: function DropIn(props) {
    setTimeout(() => {
      props.onInstance({
        requestPaymentMethod: jest.fn().mockResolvedValue({
          nonce: "fake-payment-nonce-123",
        }),
      });
    }, 0);
    
    return <div data-testid="dropin-container">Braintree DropIn</div>;
  },
}));

const cart = [
  {
    _id: "1",
    name: "Novel",
    description: "A bestselling novel",
    price: 14.99,
    category: "1",
    slug: "novel",
  },
];

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Cart Page Payment Integration Tests", () => {
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
    localStorage.setItem("cart", JSON.stringify(cart));
    
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/product/product-list/1") {
        return Promise.resolve({
          data: {
            products: cart,
            success: true,
          },
        });
      }
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({
          data: {
            succes: true,
            message: "All Categories List",
            category: [
              {
                _id: "1",
                name: "Electronics",
                slug: "electronics",
                __v: 0,
              },
            ],
          },
        });
      }
      if (url === "/api/v1/product/product-count") {
        return Promise.resolve({
          data: {
            total: 1,
            success: true,
          },
        });
      }
      if (url === "/api/v1/product/braintree/token") {
        return Promise.resolve({
          data: {
            clientToken: "fake-client-token-123",
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    axios.post.mockImplementation((url) => {
      if (url === "/api/v1/product/braintree/payment") {
        return Promise.resolve({
          data: {
            ok: true,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    localStorage.clear();
    global.console.log.mockRestore();
  });

  it("should successfully process payment in CartPage", async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <CartProvider>
            <MemoryRouter initialEntries={["/cart"]}>
              <Routes>
                <Route path="/cart" element={<CartPage />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText(`Hello ${user.name}`)).toBeInTheDocument();
      expect(screen.getByText("Novel")).toBeInTheDocument();
      expect(screen.getByText("A bestselling novel")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId("dropin-container")).toBeInTheDocument();
    });

    const paymentButton = screen.getByText("Make Payment");
    expect(paymentButton).toBeInTheDocument();
    expect(paymentButton).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(paymentButton);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/braintree/payment",
        {
          nonce: "fake-payment-nonce-123",
          cart: cart,
        }
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Payment Completed Successfully ");
    });

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/orders");
    
    expect(localStorage.getItem("cart")).toBeNull();
  });

  it("should handle cases where token is not available", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/product/braintree/token") {
        return Promise.resolve({
          data: {}, 
        });
      }
      return Promise.resolve({ data: {} });
    });

    await act(async () => {
      render(
        <AuthProvider>
          <CartProvider>
            <MemoryRouter initialEntries={["/cart"]}>
              <Routes>
                <Route path="/cart" element={<CartPage />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </AuthProvider>
      );
    });

    expect(screen.getByText("Cart Summary")).toBeInTheDocument();
    expect(screen.queryByTestId("dropin-container")).not.toBeInTheDocument();
    expect(screen.queryByText("Make Payment")).not.toBeInTheDocument();
  });

  it("should redirect to profile page when updating address", async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <CartProvider>
            <MemoryRouter initialEntries={["/cart"]}>
              <Routes>
                <Route path="/cart" element={<CartPage />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </AuthProvider>
      );
    });

    // Click on update address button
    const updateAddressButton = screen.getByText("Update Address");
    act(() => {
      fireEvent.click(updateAddressButton);
    });

    // Verify navigation to profile page
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });
});