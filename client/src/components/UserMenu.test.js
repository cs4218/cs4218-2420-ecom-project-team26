import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import UserMenu from "./UserMenu";

const renderUserMenu = () => {
  render(
    <BrowserRouter>
      <UserMenu />
    </BrowserRouter>
  );
};

describe("UserMenu Component", () => {
  test("check if header links exist", () => {
    renderUserMenu();
    
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });

  test("check if profile navigation links exist", () => {
    renderUserMenu();
    
    expect(screen.getByRole('link', { name: /orders/i })).toBeInTheDocument();
  });

  test("check if orders navigation links exis", () => {
    renderUserMenu();

    expect(screen.getByRole('link', { name: /orders/i })).toBeInTheDocument();
  });
});

describe("Navigation links", () => {
  test("profile navigation links point to correct routes", () => {
    renderUserMenu();

    expect(screen.getByRole('link', { name: /profile/i }))
      .toHaveAttribute('href', '/dashboard/user/profile');
  });

  test("orders navigation links point to correct routes", () => {
    renderUserMenu();
    
    expect(screen.getByRole('link', { name: /orders/i }))
      .toHaveAttribute('href', '/dashboard/user/orders');
  });
});