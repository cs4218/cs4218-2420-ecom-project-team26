import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import About from "./About";

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

describe("About Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the about page", async () => {
    const { getByAltText, getByText } = render(
      <MemoryRouter initialEntries={["/about"]}>
        <Routes>
          <Route path="/about" element={<About />} />
        </Routes>
      </MemoryRouter>
    );
    const image = getByAltText("contactus");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/about.jpeg");
    expect(getByText("Add text")).toBeInTheDocument();
  });
});
