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
import HomePage from "./HomePage";

jest.mock("axios");
jest.mock("react-hot-toast");

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

describe("Cart Page Integration Tests", () => {
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
    // arrange
    jest.clearAllMocks();
    jest.spyOn(global.console, "log");
    localStorage.setItem("auth", JSON.stringify({ user, token }));
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
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    localStorage.clear();
    global.console.log.mockRestore();
  });

  it("HomePage - items added from HomePage show up in CartPage", async () => {
    // act
    await act(async () => {
      render(
        <AuthProvider>
          <CartProvider>
            <MemoryRouter initialEntries={["/"]}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/cart" element={<CartPage />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </AuthProvider>
      );
    });
    // ensure product items are loaded
    expect(screen.getByText("Novel")).toBeInTheDocument();
    act(() => {
      fireEvent.click(screen.queryByText("ADD TO CART"));
    });
    act(() => {
      fireEvent.click(screen.getByRole("link", { name: "Cart" }));
    });

    // assert
    await waitFor(() => {
      expect(screen.getByText(`Hello ${user.name}`)).toBeInTheDocument();
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
