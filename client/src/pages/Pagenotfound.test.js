/** @jest-environment jsdom */
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Pagenotfound from "./Pagenotfound";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

jest.mock("../components/Layout", () => ({children}) => <div>{children}</div>);

describe("Pagenotfound component", () => {
    test("renders with required elements", () => {
        render(
            <MemoryRouter initialEntries={["/invalid-route"]}>
                <Routes>
                    <Route path="*" element={<Pagenotfound />} />
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getByText("404")).toBeInTheDocument();
        expect(screen.getByText("Oops ! Page Not Found")).toBeInTheDocument();
    })
    test("has 404 page link correctly linked back to correct route (/)", () => {
        render(
            <MemoryRouter initialEntries={["/invalid-route"]}>
                <Routes>
                    <Route path="*" element={<Pagenotfound />} />
                </Routes>
            </MemoryRouter>
        )

        const link = screen.getByRole("link", { name: "Go Back" });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "/");
    });
});