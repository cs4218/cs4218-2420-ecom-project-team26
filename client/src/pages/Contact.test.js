import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import Contact from "./Contact";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

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

describe("Contact Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders contact page with correct content", async () => {
    const { getByAltText, getByText } = render(
      <MemoryRouter initialEntries={["/contact"]}>
        <Routes>
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("CONTACT US")).toBeInTheDocument();
    expect(
      getByText(
        "For any query or info about product, feel free to call anytime. We are available 24X7."
      )
    ).toBeInTheDocument();
    expect(getByText(/www\.help@ecommerceapp\.com/)).toBeInTheDocument();
    expect(getByText(/012-3456789/)).toBeInTheDocument();
    expect(getByText(/1800-0000-0000 \(toll free\)/)).toBeInTheDocument();
    expect(getByAltText("contactus")).toBeInTheDocument();
  });
});
