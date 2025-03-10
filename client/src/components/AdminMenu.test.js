import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { BrowserRouter } from "react-router-dom";
import AdminMenu from "./AdminMenu";

test("renders AdminMenu component", () => {
  render(
    <BrowserRouter>
      <AdminMenu />
    </BrowserRouter>
  );
  // Check if the AdminMenu component renders the heading correctly
  expect(screen.getByText("Admin Panel")).toBeInTheDocument();

  // Check if the AdminMenu component renders the navigation links correctly
  expect(screen.getByText("Create Category")).toBeInTheDocument();
  expect(screen.getByText("Create Product")).toBeInTheDocument();
  expect(screen.getByText("Products")).toBeInTheDocument();
  expect(screen.getByText("Orders")).toBeInTheDocument();

  // Check if the NavLink components have the correct 'to' attributes
  expect(screen.getByText("Create Category").closest("a")).toHaveAttribute(
    "href",
    "/dashboard/admin/create-category"
  );
  expect(screen.getByText("Create Product").closest("a")).toHaveAttribute(
    "href",
    "/dashboard/admin/create-product"
  );
  expect(screen.getByText("Products").closest("a")).toHaveAttribute(
    "href",
    "/dashboard/admin/products"
  );
  expect(screen.getByText("Orders").closest("a")).toHaveAttribute(
    "href",
    "/dashboard/admin/orders"
  );
});
