/** @jest-environment jsdom */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Search from "./Search";
import { useSearch } from "../context/search";
import { useCart } from "../context/cart";
import { toast } from "react-hot-toast";

jest.mock("../components/Layout", () => ({children}) => <div>{children}</div>);
jest.mock("../context/search", () => ({
    useSearch: jest.fn()
}));
jest.mock('react-hot-toast', () => ({
    toast: {
      success: jest.fn(),
    }
  }));
jest.mock("../context/cart", () => ({
    useCart: jest.fn()
}));
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn()
}));

describe("Search component", () => {
    const mockNavigate = jest.fn();
    beforeEach(() => {
            jest.clearAllMocks();
            useCart.mockReturnValue([[], jest.fn()]);
            useNavigate.mockReturnValue(mockNavigate);
        })
    test("renders with required elements", () => {
        const setValues = jest.fn();
        const values = { keyword: "", results: [] };
        useSearch.mockReturnValue([values, setValues]);
        render(
            <MemoryRouter initialEntries={["/search"]}>
                <Routes>
                    <Route path="/search" element={<Search />} />
                </Routes>
            </MemoryRouter>
        ); 

        expect(screen.getByText("Search Results")).toBeInTheDocument();
        expect(screen.getByText("No Products Found")).toBeInTheDocument();
    });

    test("renders with search results", () => {
        const setValues = jest.fn();
        const values = {
            "keyword": "no",
            "results": [
                {
                    "_id": "66db427fdb0119d9234b27f9",
                    "name": "Novel",
                    "slug": "novel",
                    "description": "A bestselling novel",
                    "price": 14.99,
                    "category": "66db427fdb0119d9234b27ef",
                    "quantity": 200,
                    "shipping": true,
                    "createdAt": "2024-09-06T17:57:19.992Z",
                    "updatedAt": "2024-09-06T17:57:19.992Z",
                    "__v": 0
                }
            ]
        }
        useSearch.mockReturnValue([values, setValues]);
        render(
            <MemoryRouter initialEntries={["/search"]}>
                <Routes>
                    <Route path="/search" element={<Search />} />
                </Routes>
            </MemoryRouter>
        ); 

        expect(screen.getByText("Search Results")).toBeInTheDocument();
        expect(screen.getByText("Found 1")).toBeInTheDocument();
        expect(screen.getByText("Novel")).toBeInTheDocument();
        expect(screen.getByText("A bestselling novel...")).toBeInTheDocument();
        expect(screen.getByText("$ 14.99")).toBeInTheDocument();

        const image = screen.getAllByRole("img");
        expect(image).toHaveLength(1);
        expect(image[0]).toHaveAttribute("src", "/api/v1/product/product-photo/66db427fdb0119d9234b27f9");
        expect(image[0]).toHaveAttribute("class", "card-img-top");
        expect(image[0]).toHaveAttribute("alt", "Novel");
    });

    test("navigates to correct route when More Details button is clicked", () => {
        const setValues = jest.fn();
        const values = {
            "keyword": "no",
            "results": [
                {
                    "_id": "66db427fdb0119d9234b27f9",
                    "name": "Novel",
                    "slug": "novel",
                    "description": "A bestselling novel",
                    "price": 14.99,
                    "category": "66db427fdb0119d9234b27ef",
                    "quantity": 200,
                    "shipping": true,
                    "createdAt": "2024-09-06T17:57:19.992Z",
                    "updatedAt": "2024-09-06T17:57:19.992Z",
                    "__v": 0
                }
            ]
        }
        useSearch.mockReturnValue([values, setValues]);
        render(
            <MemoryRouter initialEntries={["/search"]}>
                <Routes>
                    <Route path="/search" element={<Search />} />
                </Routes>
            </MemoryRouter>
        ); 

        fireEvent.click(screen.getByText("More Details"));
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/product/novel');
    });

    test("adds product to cart when ADD TO CART button is clicked", async () => {
        const setCart = jest.fn();
        const cart = [];
        useCart.mockReturnValue([cart, setCart]);
        const setValues = jest.fn();
        const values = {
            "keyword": "no",
            "results": [
                {
                    "_id": "66db427fdb0119d9234b27f9",
                    "name": "Novel",
                    "slug": "novel",
                    "description": "A bestselling novel",
                    "price": 14.99,
                    "category": "66db427fdb0119d9234b27ef",
                    "quantity": 200,
                    "shipping": true,
                    "createdAt": "2024-09-06T17:57:19.992Z",
                    "updatedAt": "2024-09-06T17:57:19.992Z",
                    "__v": 0
                }
            ]
        }
        useSearch.mockReturnValue([values, setValues]);
        Storage.prototype.setItem = jest.fn();
        render(
            <MemoryRouter initialEntries={["/search"]}>
                <Routes>
                    <Route path="/search" element={<Search />} />
                </Routes>
            </MemoryRouter>
        ); 

        fireEvent.click(screen.getByText("ADD TO CART"));
        expect(setCart).toHaveBeenCalledWith([{
            "_id": "66db427fdb0119d9234b27f9",
            "name": "Novel",
            "slug": "novel",
            "description": "A bestselling novel",
            "price": 14.99,
            "category": "66db427fdb0119d9234b27ef",
            "quantity": 200,
            "shipping": true,
            "createdAt": "2024-09-06T17:57:19.992Z",
            "updatedAt": "2024-09-06T17:57:19.992Z",
            "__v": 0
        }]);
        expect(Storage.prototype.setItem).toHaveBeenCalledWith("cart", JSON.stringify([{
            "_id": "66db427fdb0119d9234b27f9",
            "name": "Novel",
            "slug": "novel",
            "description": "A bestselling novel",
            "price": 14.99,
            "category": "66db427fdb0119d9234b27ef",
            "quantity": 200,
            "shipping": true,
            "createdAt": "2024-09-06T17:57:19.992Z",
            "updatedAt": "2024-09-06T17:57:19.992Z",
            "__v": 0
        }]));
        expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
    });
});