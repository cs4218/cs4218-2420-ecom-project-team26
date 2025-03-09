/** @jest-environment jsdom */
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Policy from "./Policy";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

jest.mock("../components/Layout", () => ({children}) => <div>{children}</div>);

describe("Policy component", () => {
    test("renders with correct image", () => {
        render(
            <MemoryRouter initialEntries={["/policy"]}>
                <Routes>
                    <Route path="/policy" element={<Policy />} />
                </Routes>
            </MemoryRouter>
        )

        const image = screen.getByRole("img");
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "/images/contactus.jpeg");
        expect(image).toHaveAttribute("alt", "contactus");
        expect(image).toHaveAttribute("style", "width: 100%;");
    })
    test("renders with correct text", () => {
        render(
            <MemoryRouter initialEntries={["/policy"]}>
                <Routes>
                    <Route path="/policy" element={<Policy />} />
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getAllByText("add privacy policy")).toHaveLength(7);
    });
})