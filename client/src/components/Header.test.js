/** @jest-environment jsdom */
import React from "react";
import { fireEvent, render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Header from "./Header";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import useCategory from "../hooks/useCategory";
import toast from "react-hot-toast";

jest.mock("../context/auth", () => ({
    useAuth: jest.fn()
}));
jest.mock("../hooks/useCategory", () => jest.fn());
jest.mock("../styles/Header.css", () => ({}));
jest.mock("react-hot-toast", () => ({
    success: jest.fn()
}));
jest.mock("../context/cart", () => ({
    useCart: jest.fn()
}));
jest.mock("./Form/SearchInput", () => jest.fn(() => <div/>));
jest.mock("antd", () => ({
    Badge: ({ count, children }) => (
      <div>
        {children} <span>{count}</span>
      </div>
    ),
}));
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Link: ({ to, children, className }) => <a href={to} className={className}>{children}</a>,
    NavLink: ({ to, children, className, onClick }) => <a href={to} className={className} onClick={onClick}>{children}</a>
}));

describe("Header component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Storage.prototype, 'removeItem').mockClear();
    })
    test("renders with correct elements when user is not logged in", () => {
        const auth = { user: null, token: "" };
        const setAuth = jest.fn();
        useAuth.mockReturnValue([auth, setAuth]);
        const cart = [];
        useCart.mockReturnValue([cart]);
        const categories = [];
        useCategory.mockReturnValue([categories]);
        render(<Header />);

        expect(screen.getByText("🛒 Virtual Vault")).toBeInTheDocument();
        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Categories")).toBeInTheDocument();
        expect(screen.getByText("Register")).toBeInTheDocument();
        expect(screen.getByText("Login")).toBeInTheDocument();
        expect(screen.getByText("Cart")).toBeInTheDocument();
    });

    test("renders with correct elements when user is logged in", () => {
        const auth = { user: { name: "Test User" }, token: "testToken" };
        const setAuth = jest.fn();
        useAuth.mockReturnValue([auth, setAuth]);
        const cart = [];
        useCart.mockReturnValue([cart]);
        const categories = [];
        useCategory.mockReturnValue([categories]);
        render(<Header />);

        expect(screen.getByText("🛒 Virtual Vault")).toBeInTheDocument();
        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Categories")).toBeInTheDocument();
        expect(screen.getByText("Test User")).toBeInTheDocument();
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();
        expect(screen.getByText("Cart")).toBeInTheDocument();
    });

    test("handleLogout function works correctly", async () => {
        const auth = { user: { name: "Test User"}, token: "testToken" };
        const setAuth = jest.fn();
        useAuth.mockReturnValue([auth, setAuth]);
        const cart = [];
        useCart.mockReturnValue([cart]);
        const categories = [];
        useCategory.mockReturnValue(categories);
        render(<Header />);

        expect(screen.getByText("Test User")).toBeInTheDocument();
        await act(async () => {
            fireEvent.click(screen.getByText("Test User"));
        });
        expect(screen.getByText("Logout")).toBeInTheDocument();
        const button = screen.getByText("Logout");
        expect(button).toHaveAttribute("href", "/login");
        await act(async () => {
            fireEvent.click(button);
        });
        expect(setAuth).toHaveBeenCalledWith({ ...auth, user: null, token: "" });

        expect(await Storage.prototype.removeItem).toHaveBeenCalledWith("auth");
        expect(await toast.success).toHaveBeenCalledWith("Logout Successfully");
    });
});


