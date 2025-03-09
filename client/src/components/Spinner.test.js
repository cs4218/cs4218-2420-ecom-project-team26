/** @jest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { useLocation } from "react-router-dom";
import Spinner from "./Spinner";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    useLocation: jest.fn(),
}));

describe("Spinner component", () => {
    beforeEach(() => {
        useLocation.mockReturnValue({ pathname: "/login" });
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    test("renders with correct elements", () => {
        render(<Spinner />);

        expect(screen.getByText("redirecting to you in 3 second")).toBeInTheDocument();
        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    test("countdown decreases correctly", async () => {
        jest.useFakeTimers();
        render(<Spinner />);

        jest.advanceTimersByTime(1000);
        expect(await screen.findByText((_, element) => element.textContent === 'redirecting to you in 2 second ')).toBeInTheDocument();
        jest.advanceTimersByTime(1000);
        expect(await screen.findByText((_, element) => element.textContent === 'redirecting to you in 1 second ')).toBeInTheDocument();
        jest.advanceTimersByTime(1000);
        expect(await screen.findByText((_, element) => element.textContent === 'redirecting to you in 0 second ')).toBeInTheDocument();
    });

    test("redirects to correct default login path after 3 seconds", () => {
        render(<Spinner />);
        setTimeout(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/login", { state: "/login" });
        }, 4000);
    });

    test("redirects to correct path after 3 seconds", () => {
        render(<Spinner path="register"/>);
        setTimeout(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/register", { state: "/register" });
        }, 4000);
    });
});