/** @jest-environment jsdom */
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Link: ({ to, children }) => <a href={to}>{children}</a>
}));

describe("Footer component", () => {
    test("renders with correct footer text", () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        )

        expect(screen.getByText("All Rights Reserved © TestingComp")).toBeInTheDocument();
    })
    test("renders with correct links", () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        )
        expect(screen.getByText("About")).toHaveAttribute("href", "/about");
        expect(screen.getByText("Contact")).toHaveAttribute("href", "/contact");
        expect(screen.getByText("Privacy Policy")).toHaveAttribute("href", "/policy");
    });
})