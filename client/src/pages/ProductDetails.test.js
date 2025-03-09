/** @jest-environment jsdom */
import React from "react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import axios from "axios";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import ProductDetails from "./ProductDetails";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";

jest.mock("../components/Layout", () => ({children}) => <div>{children}</div>);
jest.mock("axios");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn(() => ({ slug: "test-value" })),
    useNavigate: jest.fn()
}));
jest.mock("../styles/ProductDetailsStyles.css", () => ({}));
jest.mock("react-hot-toast", () => ({
    success: jest.fn()
}));
jest.mock("../context/cart", () => ({
    useCart: jest.fn()
}));

describe("ProductDetails component", () => {
    const mockNavigate = jest.fn();
    let consoleSpy;
    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        useCart.mockReturnValue([[], jest.fn()]);
    })
    afterEach(() => {
        consoleSpy.mockRestore();
    })
    test("renders without calling getProduct and getSimilarProduct if slug is empty", async () => {
        const { useParams } = require("react-router-dom");
        useParams.mockReturnValue({ slug: "" });
        render(
            <MemoryRouter initialEntries={["/product/test-value"]}>
                <Routes>
                    <Route path="/product/:slug" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
          expect(axios.get).not.toHaveBeenCalled();
        });
        useParams.mockReturnValue({ slug: "test-value" });
    });

    test("logs error if getProduct api call fails", async () => {
        axios.get.mockRejectedValueOnce(new Error("getProduct API failure"));

        render(
            <MemoryRouter initialEntries={["/product/test-value"]}>
                <Routes>
                    <Route path="/product/:slug" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/product/get-product/test-value"));
        expect(axios.get).toHaveBeenCalledTimes(1);
        await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(new Error("getProduct API failure")));
    });

    test("logs error if getSimilarProduct api call fails", async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                product: {
                    _id: "66db427fdb0119d9234b27f9",
                    name: "Novel",
                    slug: "novel",
                    description: "A bestselling novel",
                    price: 14.99,
                    category: {
                        _id: "66db427fdb0119d9234b27ef",
                        name: "Book",
                        slug: "book",
                        __v: 0
                    },
                    quantity: 200,
                    shipping: true,
                    createdAt: "2024-09-06T17:57:19.992Z",
                    updatedAt: "2024-09-06T17:57:19.992Z",
                    __v: 0
                }
            }
        }).mockRejectedValueOnce(new Error("getSimilarProduct API failure"));

        render(
            <MemoryRouter initialEntries={["/product/test-value"]}>
                <Routes>
                    <Route path="/product/:slug" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenNthCalledWith(1, "/api/v1/product/get-product/test-value"));
        await waitFor(() => expect(axios.get).toHaveBeenNthCalledWith(2, "/api/v1/product/related-product/66db427fdb0119d9234b27f9/66db427fdb0119d9234b27ef"));
        expect(axios.get).toHaveBeenCalledTimes(2);
        await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(new Error("getSimilarProduct API failure")));    
    });

    test("renders product details correctly, without similar products", async () => {
        axios.get.mockResolvedValueOnce({
          data: {
                success: true,
                message: "Single Product Fetched",
                product: {
                    _id:"66db427fdb0119d9234b27f1",
                    name: "Textbook",
                    slug: "textbook",
                    description: "A comprehensive textbook",
                    price: 79.99,
                    category: {
                        _id: "66db427fdb0119d9234b27ef",
                        name: "Book",
                        slug: "book",
                        __v: 0
                    },
                    quantity: 50,
                    shipping: false,
                    createdAt: "2024-09-06T17:57:19.963Z",
                    updatedAt: "2024-09-06T17:57:19.963Z",
                    __v: 0
                }
              }
        }).mockResolvedValueOnce({
            data: {
                products: []
            }
        });
        render(
            <MemoryRouter initialEntries={["/product/test-value"]}>
                <Routes>
                    <Route path="/product/:slug" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
        );
        await waitFor(() => expect(axios.get).toHaveBeenNthCalledWith(1, "/api/v1/product/get-product/test-value"));
        await waitFor(() => expect(axios.get).toHaveBeenNthCalledWith(2, "/api/v1/product/related-product/66db427fdb0119d9234b27f1/66db427fdb0119d9234b27ef"));
        await expect(axios.get).toHaveBeenCalledTimes(2);
        
        expect(await screen.findByText("Product Details")).toBeInTheDocument();
        expect(await screen.findByText("Name : Textbook")).toBeInTheDocument();
        expect(await screen.findByText("Description : A comprehensive textbook")).toBeInTheDocument();
        expect(await screen.findByText("Price :$79.99")).toBeInTheDocument();
        expect(await screen.findByText("Category : Book")).toBeInTheDocument();
          
        expect(await screen.findByText("Similar Products ➡️")).toBeInTheDocument();
        expect(await screen.findByText("No Similar Products found")).toBeInTheDocument();

        const button = await screen.findAllByRole("button");
        expect(await button).toHaveLength(1);
        expect(await button[0]).toHaveTextContent("ADD TO CART");
        expect(await button[0]).toHaveAttribute("class", "btn btn-secondary ms-1");

        const image = await screen.findAllByRole("img");
        expect(await image).toHaveLength(1);
        expect(await image[0]).toHaveAttribute("src", "/api/v1/product/product-photo/66db427fdb0119d9234b27f1");
        expect(await image[0]).toHaveAttribute("class", "card-img-top");
        expect(await image[0]).toHaveAttribute("alt", "Textbook");
        expect(await image[0]).toHaveAttribute("height", "300");
        expect(await image[0]).toHaveAttribute("width", "350px");
    })

    test("renders product details correctly, with similar products", async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                  success: true,
                  message: "Single Product Fetched",
                  product: {
                    _id: "66db427fdb0119d9234b27f9",
                    name: "Novel",
                    slug: "novel",
                    description: "A bestselling novel",
                    price: 14.99,
                    category: {
                        _id: "66db427fdb0119d9234b27ef",
                        name: "Book",
                        slug: "book",
                        __v: 0
                    },
                    quantity: 200,
                    shipping: true,
                    createdAt: "2024-09-06T17:57:19.992Z",
                    updatedAt: "2024-09-06T17:57:19.992Z",
                    __v: 0
                  }
                }
          }).mockResolvedValueOnce({
              data: {
                success: true,
                products: [
                    {
                        _id: "66db427fdb0119d9234b27f1",
                        name: "Textbook",
                        slug: "textbook",
                        description: "A comprehensive textbook",
                        price: 79.99,
                        category: {
                            _id: "66db427fdb0119d9234b27ef",
                            name: "Book",
                            slug: "book",
                            __v: 0
                        },
                        quantity: 50,
                        shipping: false,
                        createdAt: "2024-09-06T17:57:19.963Z",
                        updatedAt: "2024-09-06T17:57:19.963Z",
                        __v: 0
                    },
                    {
                        _id: "67a2171ea6d9e00ef2ac0229",
                        name: "The Law of Contract in Singapore",
                        slug: "the-law-of-contract-in-singapore",
                        description: "A bestselling book in Singapore",
                        price: 54.99,
                        category: {
                            _id: "66db427fdb0119d9234b27ef",
                            name: "Book",
                            slug: "book",
                            __v: 0
                        },
                        quantity: 200,
                        shipping: true,
                        createdAt: "2024-09-06T17:57:19.992Z",
                        updatedAt: "2024-09-06T17:57:19.992Z",
                        __v: 0
                    }
                ]
              }
          });
          render(
            <MemoryRouter initialEntries={["/product/test-value"]}>
                <Routes>
                    <Route path="/product/:slug" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
            );

        await waitFor(() => expect(axios.get).toHaveBeenNthCalledWith(1, "/api/v1/product/get-product/test-value"));
        await waitFor(() => expect(axios.get).toHaveBeenNthCalledWith(2, "/api/v1/product/related-product/66db427fdb0119d9234b27f9/66db427fdb0119d9234b27ef"));
        expect(axios.get).toHaveBeenCalledTimes(2);
        
        
        expect(await screen.findByText("Product Details")).toBeInTheDocument();
        expect(await screen.findByText("Name : Novel")).toBeInTheDocument();
        expect(await screen.findByText("Description : A bestselling novel")).toBeInTheDocument();
        expect(await screen.findByText("Price :$14.99")).toBeInTheDocument();
        expect(await screen.findByText("Category : Book")).toBeInTheDocument();
        
        expect(await screen.findByText("Similar Products ➡️")).toBeInTheDocument();
        await expect(screen.findByText("No Similar Products found")).rejects.toThrow();

        
        expect(await screen.findByText("Textbook")).toBeInTheDocument();
        expect(await screen.findByText("$79.99")).toBeInTheDocument();
        expect(await screen.findByText("A comprehensive textbook...")).toBeInTheDocument();
        expect(await screen.findByText("The Law of Contract in Singapore")).toBeInTheDocument();
        expect(await screen.findByText("$54.99")).toBeInTheDocument();
        expect(await screen.findByText("A bestselling book in Singapore...")).toBeInTheDocument();
        
        const button = await screen.findAllByRole("button");
        expect(await button).toHaveLength(5);
        expect(await button[0]).toHaveTextContent("ADD TO CART");
        expect(await button[0]).toHaveAttribute("class", "btn btn-secondary ms-1");
        expect(await button[1]).toHaveTextContent("More Details");
        expect(await button[1]).toHaveAttribute("class", "btn btn-info ms-1");
        expect(await button[2]).toHaveTextContent("ADD TO CART");
        expect(await button[2]).toHaveAttribute("class", "btn btn-dark ms-1");
        expect(await button[3]).toHaveTextContent("More Details");
        expect(await button[3]).toHaveAttribute("class", "btn btn-info ms-1");
        expect(await button[4]).toHaveTextContent("ADD TO CART");
        expect(await button[4]).toHaveAttribute("class", "btn btn-dark ms-1");
        
        const image = await screen.findAllByRole("img");
        expect(await image).toHaveLength(3);
        expect(await image[0]).toHaveAttribute("src", "/api/v1/product/product-photo/66db427fdb0119d9234b27f9");
        expect(await image[0]).toHaveClass("card-img-top");
        expect(await image[0]).toHaveAttribute("alt", "Novel");
        expect(await image[0]).toHaveAttribute("height", "300");
        expect(await image[0]).toHaveAttribute("width", "350px");
        expect(await image[1]).toHaveAttribute("src", "/api/v1/product/product-photo/66db427fdb0119d9234b27f1");
        expect(await image[1]).toHaveClass("card-img-top");
        expect(await image[1]).toHaveAttribute("alt", "Textbook");
        expect(await image[2]).toHaveAttribute("src", "/api/v1/product/product-photo/67a2171ea6d9e00ef2ac0229");
        expect(await image[2]).toHaveClass("card-img-top");
        expect(await image[2]).toHaveAttribute("alt", "The Law of Contract in Singapore");
    })

    test("navigates to correct route when More Details button is clicked", async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                  success: true,
                  message: "Single Product Fetched",
                  product: {
                    _id: "66db427fdb0119d9234b27f9",
                    name: "Novel",
                    slug: "novel",
                    description: "A bestselling novel",
                    price: 14.99,
                    category: {
                        _id: "66db427fdb0119d9234b27ef",
                        name: "Book",
                        slug: "book",
                        __v: 0
                    },
                    quantity: 200,
                    shipping: true,
                    createdAt: "2024-09-06T17:57:19.992Z",
                    updatedAt: "2024-09-06T17:57:19.992Z",
                    __v: 0
                  }
                }
          }).mockResolvedValueOnce({
              data: {
                success: true,
                products: [
                    {
                        _id: "67a2171ea6d9e00ef2ac0229",
                        name: "The Law of Contract in Singapore",
                        slug: "the-law-of-contract-in-singapore",
                        description: "A bestselling book in Singapore",
                        price: 54.99,
                        category: {
                            _id: "66db427fdb0119d9234b27ef",
                            name: "Book",
                            slug: "book",
                            __v: 0
                        },
                        quantity: 200,
                        shipping: true,
                        createdAt: "2024-09-06T17:57:19.992Z",
                        updatedAt: "2024-09-06T17:57:19.992Z",
                        __v: 0
                    }
                ]
              }
          });
          render(
            <MemoryRouter initialEntries={["/product/test-value"]}>
                <Routes>
                    <Route path="/product/:slug" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
            );

        await waitFor(() => expect(axios.get).toHaveBeenNthCalledWith(1, "/api/v1/product/get-product/test-value"));
        await waitFor(() => expect(axios.get).toHaveBeenNthCalledWith(2, "/api/v1/product/related-product/66db427fdb0119d9234b27f9/66db427fdb0119d9234b27ef"));
        expect(axios.get).toHaveBeenCalledTimes(2);

        expect(await screen.findByText("The Law of Contract in Singapore")).toBeInTheDocument();

        fireEvent.click(screen.getByText("More Details"));
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/product/the-law-of-contract-in-singapore');
    });

    test("adds product to cart when ADD TO CART button is clicked", async () => {
        const setCart = jest.fn();
        const cart = [];
        useCart.mockReturnValue([cart, setCart]);
        Storage.prototype.setItem = jest.fn();
        axios.get.mockResolvedValueOnce({
            data: {
                  success: true,
                  message: "Single Product Fetched",
                  product: {
                    _id: "66db427fdb0119d9234b27f9",
                    name: "Novel",
                    slug: "novel",
                    description: "A bestselling novel",
                    price: 14.99,
                    category: {
                        _id: "66db427fdb0119d9234b27ef",
                        name: "Book",
                        slug: "book",
                        __v: 0
                    },
                    quantity: 200,
                    shipping: true,
                    createdAt: "2024-09-06T17:57:19.992Z",
                    updatedAt: "2024-09-06T17:57:19.992Z",
                    __v: 0
                  }
                }
          }).mockResolvedValueOnce({
            data: {
              success: true,
              products: [
                  {
                      _id: "67a2171ea6d9e00ef2ac0229",
                      name: "The Law of Contract in Singapore",
                      slug: "the-law-of-contract-in-singapore",
                      description: "A bestselling book in Singapore",
                      price: 54.99,
                      category: {
                          _id: "66db427fdb0119d9234b27ef",
                          name: "Book",
                          slug: "book",
                          __v: 0
                      },
                      quantity: 200,
                      shipping: true,
                      createdAt: "2024-09-06T17:57:19.992Z",
                      updatedAt: "2024-09-06T17:57:19.992Z",
                      __v: 0
                  }
              ]
            }
        });
        render(
        <MemoryRouter initialEntries={["/product/test-value"]}>
            <Routes>
                <Route path="/product/:slug" element={<ProductDetails />} />
            </Routes>
        </MemoryRouter>
        );
        expect(await screen.findByText("The Law of Contract in Singapore")).toBeInTheDocument();

        const button = await screen.findAllByRole("button");
        expect(await button).toHaveLength(3);
        expect(await button[0]).toHaveTextContent("ADD TO CART");
        fireEvent.click(button[0]);

        expect(setCart).toHaveBeenCalledWith([{
            _id: "66db427fdb0119d9234b27f9",
            name: "Novel",
            slug: "novel",
            description: "A bestselling novel",
            price: 14.99,
            category: {
                _id: "66db427fdb0119d9234b27ef",
                name: "Book",
                slug: "book",
                __v: 0
            },
            quantity: 200,
            shipping: true,
            createdAt: "2024-09-06T17:57:19.992Z",
            updatedAt: "2024-09-06T17:57:19.992Z",
            __v: 0
        }]);
        expect(Storage.prototype.setItem).toHaveBeenCalledWith("cart", JSON.stringify([{
            _id: "66db427fdb0119d9234b27f9",
            name: "Novel",
            slug: "novel",
            description: "A bestselling novel",
            price: 14.99,
            category: {
                _id: "66db427fdb0119d9234b27ef",
                name: "Book",
                slug: "book",
                __v: 0
            },
            quantity: 200,
            shipping: true,
            createdAt: "2024-09-06T17:57:19.992Z",
            updatedAt: "2024-09-06T17:57:19.992Z",
            __v: 0
        }]));
        expect(toast.success).toHaveBeenCalledWith("Item Added to cart");

        expect(await button[2]).toHaveTextContent("ADD TO CART");
        fireEvent.click(button[2]);
        expect(setCart).toHaveBeenCalledWith([{
            _id: "67a2171ea6d9e00ef2ac0229",
            name: "The Law of Contract in Singapore",
            slug: "the-law-of-contract-in-singapore",
            description: "A bestselling book in Singapore",
            price: 54.99,
            category: {
                _id: "66db427fdb0119d9234b27ef",
                name: "Book",
                slug: "book",
                __v: 0
            },
            quantity: 200,
            shipping: true,
            createdAt: "2024-09-06T17:57:19.992Z",
            updatedAt: "2024-09-06T17:57:19.992Z",
            __v: 0
        }]);
        expect(Storage.prototype.setItem).toHaveBeenCalledWith("cart", JSON.stringify([{
            _id: "67a2171ea6d9e00ef2ac0229",
            name: "The Law of Contract in Singapore",
            slug: "the-law-of-contract-in-singapore",
            description: "A bestselling book in Singapore",
            price: 54.99,
            category: {
                _id: "66db427fdb0119d9234b27ef",
                name: "Book",
                slug: "book",
                __v: 0
            },
            quantity: 200,
            shipping: true,
            createdAt: "2024-09-06T17:57:19.992Z",
            updatedAt: "2024-09-06T17:57:19.992Z",
            __v: 0
        }]));
        expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
    })
})