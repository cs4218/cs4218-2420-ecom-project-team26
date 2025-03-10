import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CategoryForm from "./CategoryForm";

test("renders CategoryForm component", () => {
  const handleSubmit = jest.fn();
  const setValue = jest.fn();
  const value = "Test Category";

  render(
    <CategoryForm
      handleSubmit={handleSubmit}
      value={value}
      setValue={setValue}
    />
  );

  // Check if the input field is rendered with the correct value
  const input = screen.getByPlaceholderText("Enter new category");
  expect(input).toBeInTheDocument();
  expect(input).toHaveValue(value);

  // Check if the button is rendered
  const button = screen.getByText("Submit");
  expect(button).toBeInTheDocument();

  // Simulate input change
  fireEvent.change(input, { target: { value: "New Category" } });
  expect(setValue).toHaveBeenCalledWith("New Category");

  // Simulate form submission
  fireEvent.submit(button.closest("form"));
  expect(handleSubmit).toHaveBeenCalled();
});

test("renders CategoryForm component with empty value", () => {
  const handleSubmit = jest.fn();
  const setValue = jest.fn();
  const value = "";

  render(
    <CategoryForm
      handleSubmit={handleSubmit}
      value={value}
      setValue={setValue}
    />
  );

  // Check if the input field is rendered with the correct value
  const input = screen.getByPlaceholderText("Enter new category");
  expect(input).toBeInTheDocument();
  expect(input).toHaveValue(value);

  // Check if the button is rendered
  const button = screen.getByText("Submit");
  expect(button).toBeInTheDocument();

  // Simulate input change
  fireEvent.change(input, { target: { value: "New Category" } });
  expect(setValue).toHaveBeenCalledWith("New Category");

  // Simulate form submission
  fireEvent.submit(button.closest("form"));
  expect(handleSubmit).toHaveBeenCalled();
});

test("calls setValue on input change", () => {
  const handleSubmit = jest.fn();
  const setValue = jest.fn();
  const value = "";

  render(
    <CategoryForm
      handleSubmit={handleSubmit}
      value={value}
      setValue={setValue}
    />
  );

  // Check if the input field is rendered
  const input = screen.getByPlaceholderText("Enter new category");
  expect(input).toBeInTheDocument();

  // Simulate input change
  fireEvent.change(input, { target: { value: "New Category" } });
  expect(setValue).toHaveBeenCalledWith("New Category");
});

test("calls handleSubmit on form submission with empty input", () => {
  const handleSubmit = jest.fn();
  const setValue = jest.fn();
  const value = "";

  render(
    <CategoryForm
      handleSubmit={handleSubmit}
      value={value}
      setValue={setValue}
    />
  );

  // Check if the button is rendered
  const button = screen.getByText("Submit");
  expect(button).toBeInTheDocument();

  // Simulate form submission
  fireEvent.submit(button.closest("form"));
  expect(handleSubmit).toHaveBeenCalled();
});
