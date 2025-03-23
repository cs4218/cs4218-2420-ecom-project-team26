import "@testing-library/jest-dom/extend-expect";
import {
  act,
  fireEvent,
  getAllByAltText,
  render,
  waitFor,
} from "@testing-library/react";
import axios from "axios";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";
import HomePage from "./HomePage";

jest.mock("axios");
jest.mock("react-hot-toast");

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

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

const mockProducts = [
  {
    _id: "1",
    name: "product 1",
    description: "desc 1",
    price: 1.99,
    slug: "product-1",
  },
  {
    _id: "2",
    name: "product 2",
    description: "desc 2",
    price: 2.99,
    slug: "product-2",
  },
  {
    _id: "3",
    name: "product 3",
    description: "desc 3",
    price: 3.99,
    slug: "product-3",
  },
];

describe("HomePage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders home page with correct elements", async () => {
    const { getByAltText, getByText } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText(/Filter By Category/)).toBeInTheDocument();
    expect(getByText(/Filter By Price/)).toBeInTheDocument();
    expect(getByText(/RESET FILTERS/)).toBeInTheDocument();
    expect(getByText(/All Products/)).toBeInTheDocument();
  });
});
