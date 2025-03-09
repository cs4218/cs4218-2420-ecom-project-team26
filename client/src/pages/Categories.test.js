import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Categories from "./Categories";
import useCategory from "../hooks/useCategory";
import axios from "axios";
import React from "react";
import CategoryProduct from "./CategoryProduct";

jest.mock("../hooks/useCategory");

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

describe("Categories Page", () => {
  it("should render the Categories page", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/categories"]}>
        <Routes>
          <Route path="/categories" element={<Categories />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("All Categories")).toBeInTheDocument();
  });

  it("should display a list of categories when data is available", async () => {
    useCategory.mockReturnValue([
      { _id: "1", name: "Category 1", slug: "category-1" },
      { _id: "2", name: "Category 2", slug: "category-2" },
    ]);

    const { getByText } = render(
      <MemoryRouter initialEntries={["/categories"]}>
        <Routes>
          <Route path="/categories" element={<Categories />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText("Category 1")).toBeInTheDocument();
      expect(getByText("Category 2")).toBeInTheDocument();
    });

    const categoryLinks = screen.getAllByRole("link");
    expect(categoryLinks).toHaveLength(2);
    expect(categoryLinks[0]).toHaveTextContent("Category 1");
    expect(categoryLinks[1]).toHaveTextContent("Category 2");
  });

  //   IN PROGRESS
  //   it("should navigate to the correct category when a link is clicked", async () => {
  //     useCategory.mockReturnValue([{ _id: "1", name: "books", slug: "books" }]);

  //     const { getByText } = render(
  //       <MemoryRouter initialEntries={["/categories"]}>
  //         <Routes>
  //           <Route path="/categories" element={<Categories />} />
  //           <Route path="/category/books" element={<CategoryProduct />} />
  //         </Routes>
  //       </MemoryRouter>
  //     );

  //     // Check that the category link is rendered
  //     const categoryButton = getByText("books");

  //     fireEvent.click(categoryButton);

  //     // Check that the navigate function was called with the correct path
  //     expect(window.location.pathname).toBe("/category/books");
  //   });

  it("should not render categories if the hook returns an empty array", async () => {
    useCategory.mockReturnValue([]);

    const { getByText } = render(
      <MemoryRouter initialEntries={["/categories"]}>
        <Routes>
          <Route path="/categories" element={<Categories />} />
        </Routes>
      </MemoryRouter>
    );

    const categoryLinks = screen.queryAllByRole("link");
    expect(categoryLinks).toHaveLength(0);
  });
});
