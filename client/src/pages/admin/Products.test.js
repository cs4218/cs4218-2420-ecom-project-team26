import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import Products from "./Products";
import { toast } from "react-hot-toast";

// Mock axios and toast
jest.mock("axios");
jest.mock("react-hot-toast");

// Mock Layout and AdminMenu components
jest.mock("../../components/Layout", () => {
  return ({ children }) => <div data-testid="mock-layout">{children}</div>;
});
jest.mock("../../components/AdminMenu", () => {
  return () => <div data-testid="mock-admin-menu">Admin Menu</div>;
});

// Sample product data for testing      
const mockProducts = [
  {
    _id: "1", 
    name: "Test Product 1",
    description: "Test Description 1",
    slug: "test-product-1",
  },
  {
    _id: "2",
    name: "Test Product 2",
    description: "Test Description 2",
    slug: "test-product-2",
  },
];

const renderProducts = () => {
  return render(
    <BrowserRouter>
      <Products />
    </BrowserRouter>
  );
};


describe("Products Component Rendering", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("check if Layout component exist", () => {
    renderProducts();

    expect(screen.getByTestId("mock-layout")).toBeInTheDocument();
  });

  test("check if AdminMenu component exist", () => {
    renderProducts();

    expect(screen.getByTestId("mock-admin-menu")).toBeInTheDocument();
  });

  test("check if All Product list header exist", () => {
    renderProducts();

    expect(screen.getByText("All Products List")).toBeInTheDocument();
  });

  test("check whether the fetching method get called when the page render", async () => {
    axios.get.mockResolvedValueOnce({ data: { products: [] } });

    renderProducts();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/get-product");
    });
  });
});

describe("API call ", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test("successfully fetches and displays products", async () => {
    axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });

    renderProducts();

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.getByText("Test Product 2")).toBeInTheDocument();
      expect(screen.getByText("Test Description 1")).toBeInTheDocument();
      expect(screen.getByText("Test Description 2")).toBeInTheDocument();
    });
  });

  test("handles API error correctly", async () => {
    axios.get.mockRejectedValueOnce(new Error("API Error"));

    renderProducts();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/get-product");
      expect(toast.error).toHaveBeenCalledWith("Something Went Wrong");
    });
  });

  test("product images have correct src and alt attributes", async () => {
    axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });

    renderProducts();

    await waitFor(() => {
      const images = screen.getAllByRole("img");
      expect(images[0]).toHaveAttribute(
        "src",
        "/api/v1/product/product-photo/1"
      );
      expect(images[0]).toHaveAttribute("alt", "Test Product 1");

      expect(images[1]).toHaveAttribute(
        "src",
        "/api/v1/product/product-photo/2"
      );
      expect(images[1]).toHaveAttribute("alt", "Test Product 2");
    });
  });

  test("product link has correct route", async () => {
    const mockProduct = {
      _id: "123",
      name: "Test Product",
      slug: "test-product"
    };

    axios.get.mockResolvedValueOnce({ 
      data: { products: [mockProduct] } 
    });
    
    renderProducts();

    const link = await screen.findByRole('link');
    expect(link).toHaveAttribute('href', '/dashboard/admin/product/test-product');
  });
});
