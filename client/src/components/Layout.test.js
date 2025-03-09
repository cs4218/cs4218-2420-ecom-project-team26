/** @jest-environment jsdom */
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Layout from "./Layout";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

jest.mock("react-hot-toast", () => ({
    Toaster: () => <div/>,
  }));
  
  jest.mock("react-helmet", () => ({
    Helmet: ({ children }) => <>{children}</>
  }));
  
  jest.mock("./Header", () => () => <header/>);
  jest.mock("./Footer", () => () => <footer/>);
  

describe("Layout component", () => {
    test("renders with correct children", () => {
        render(
            <MemoryRouter>
                <Layout>
                    <div>Test</div>
                </Layout>
            </MemoryRouter>
        )
        expect(screen.getByText("Test")).toBeInTheDocument();
    });

    test("renders with correct default props", () => {
        render(
            <MemoryRouter>
                <Layout />
            </MemoryRouter>
        )
        expect(screen.getByText("Ecommerce app - shop now")).toBeInTheDocument();

        const descriptionMeta = document.querySelector('meta[name="description"]');
        const keywordsMeta = document.querySelector('meta[name="keywords"]');
        const authorMeta = document.querySelector('meta[name="author"]');

        expect(descriptionMeta).toHaveAttribute("content", "mern stack project");
        expect(keywordsMeta).toHaveAttribute("content", "mern,react,node,mongodb");
        expect(authorMeta).toHaveAttribute("content", "Techinfoyt");
    });

    test("renders with correct cusotm props", () => {
        render(
            <MemoryRouter>
                <Layout title="Test title" description="Test description" keywords="Test keywords" author="Test author"/>
            </MemoryRouter>
        )
        expect(screen.getByText("Test title")).toBeInTheDocument();

        const descriptionMeta = document.querySelector('meta[name="description"]');
        const keywordsMeta = document.querySelector('meta[name="keywords"]');
        const authorMeta = document.querySelector('meta[name="author"]');

        expect(descriptionMeta).toHaveAttribute("content", "Test description");
        expect(keywordsMeta).toHaveAttribute("content", "Test keywords");
        expect(authorMeta).toHaveAttribute("content", "Test author");
    });
});