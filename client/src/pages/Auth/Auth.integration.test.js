/** @jest-environment jsdom */
import "@testing-library/jest-dom/extend-expect";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import axios from "axios";
import React from "react";
import toast from "react-hot-toast";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../../context/auth";
import Login from "./Login";
import Register from "./Register";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

describe("Login and Register Page Integration Tests", () => {
  const user = {
    name: "tester",
    email: "tester@tester.com",
    password: "fake-password",
    phone: "81234567",
    address: "tester",
    answer: "fake-sports",
    role: 0,
    _id: "67e0150aa528fde85145d2f1",
    dob: "2000-01-01",
    createdAt: "2025-03-23T14:04:58.634Z",
    updatedAt: "2025-03-23T14:04:58.634Z",
    __v: 0,
  };

  const token = "fake-token";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    localStorage.clear();
    global.console.log.mockRestore();
  });

  it("should allow registered accounts to login and view their profile", async () => {
    // arrange
    axios.post.mockImplementation((url) => {
      if (url === "/api/v1/auth/register") {
        return Promise.resolve({
          data: {
            success: true,
            message: "User Register Successfully",
            user,
          },
        });
      }
      if (url === "/api/v1/auth/login") {
        return Promise.resolve({
          data: {
            success: true,
            message: "login successfully",
            user,
            token,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    // act
    await act(async () => {
      render(
        <AuthProvider>
          <MemoryRouter initialEntries={["/register"]}>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      );
    });

    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: user.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: user.email },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: user.password },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: user.phone },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: user.address },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your DOB"), {
      target: { value: user.dob },
    });
    fireEvent.change(
      screen.getByPlaceholderText("What is Your Favorite sports"),
      {
        target: { value: user.answer },
      }
    );
    fireEvent.click(screen.getByRole("button", { name: "REGISTER" }));
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Register Successfully, please login"
      );
    });

    // simulate navigation
    fireEvent.click(screen.getByRole("link", { name: "Login" }));

    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: user.email },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: user.password },
    });
    fireEvent.click(screen.getByRole("button", { name: "LOGIN" }));

    // assert
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("login successfully", {
        duration: 5000,
        icon: "🙏",
        style: { background: "green", color: "white" },
      });
    });
  });
});
