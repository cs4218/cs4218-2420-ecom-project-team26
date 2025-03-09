import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, waitFor } from "@testing-library/react";
import axios from "axios";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CategoryProduct from "./CategoryProduct";

jest.mock("axios");

jest.mock("../context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
  }));
  
  jest.mock("../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
  }));
  
  jest.mock("../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
  }));
  
  jest.mock("../hooks/useCategory", () => jest.fn(() => []));

  jest.mock(
    "../components/Layout",
    () =>
      ({ children, title, description, keywords, author }) =>
        (
          <div>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />
            <title>{title}</title>
            <main>{children}</main>
          </div>
        )
  );

  const mockNavigate = jest.fn();
  jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
  }));

  describe("CategoryProduct Component", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("renders category product page with data", async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          category: { name: "Electronics" },
          products: [
            {
              _id: "1",
              name: "Laptop",
              price: 999.99,
              description: "High-performance laptop",
              slug: "laptop",
            },
          ],
        },
      });
  
      const { getByText } = render(
        <MemoryRouter initialEntries={["/category/electronics"]}>
          <Routes>
            <Route path="/category/:slug" element={<CategoryProduct />} />
          </Routes>
        </MemoryRouter>
      );
  
      await waitFor(() => expect(getByText("Category - Electronics")).toBeInTheDocument());
  
      expect(getByText("Laptop")).toBeInTheDocument();
      expect(getByText("$999.99")).toBeInTheDocument();
    });

    it("should navigate to product page on selecting 'More Details'", async () => {
        axios.get.mockResolvedValueOnce({
          data: {
            category: { name: "Electronics" },
            products: [
              {
                _id: "1",
                name: "Laptop",
                price: 999.99,
                description: "High-performance laptop",
                slug: "laptop",
              },
            ],
          },
        });
    
        const { getByText } = render(
          <MemoryRouter initialEntries={["/category/electronics"]}>
            <Routes>
              <Route path="/category/:slug" element={<CategoryProduct />} />
            </Routes>
          </MemoryRouter>
        );
    
        await waitFor(() => expect(getByText("Laptop")).toBeInTheDocument());
    
        const moreDetailsButton = getByText("More Details");
        fireEvent.click(moreDetailsButton);

        expect(mockNavigate).toHaveBeenCalledWith("/product/laptop");
      });

      it("logs an error in console when API call fails", async () => {
        const mockError = new Error("Network Error");
        axios.get.mockRejectedValueOnce(mockError);
    
        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    
        render(
          <MemoryRouter initialEntries={["/category/electronics"]}>
            <Routes>
              <Route path="/category/:slug" element={<CategoryProduct />} />
            </Routes>
          </MemoryRouter>
        );
    
        await waitFor(() => {
          expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
        });
    
        consoleLogSpy.mockRestore();
      });

      it("does not call getPrductsByCat if params.slug is undefined", async () => {
        axios.get.mockResolvedValueOnce({
          data: { category: { name: "Electronics" }, products: [] },
        });
      
        const { queryByText } = render(
          <MemoryRouter initialEntries={["/category/"]}>
            <Routes>
              <Route path="/category/:slug?" element={<CategoryProduct />} />
            </Routes>
          </MemoryRouter>
        );
      
        await waitFor(() => {
          expect(queryByText("Category - Electronics")).not.toBeInTheDocument();
        });
      });
  });