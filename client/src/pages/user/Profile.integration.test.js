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
import CartPage from "../CartPage";
import Dashboard from "./Dashboard";
import Profile from "./Profile";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../components/UserMenu", () => () => (
  <div>
    <div>Dashboard</div>
    <div>Profile</div>
    <div>Orders</div>
  </div>
));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

describe("Profile Page Integration Tests", () => {
  const user = {
    address: "123 Street",
    email: "test@example.com",
    name: "Admin",
    phone: "81234567",
  };

  const updatedUser = {
    address: "456 Street",
    email: "test@example.com",
    name: "Admin 2",
    phone: "91234567",
  };

  const token = 123;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    localStorage.setItem("auth", JSON.stringify({ user, token }));
  });

  afterEach(() => {
    localStorage.clear();
    global.console.log.mockRestore();
  });

  describe("Navbar Component", () => {
    it("should display updated user's name in the Navbar", async () => {
      // arrange
      axios.put.mockResolvedValueOnce({
        data: {
          success: true,
          updatedUser: { ...user, name: updatedUser.name },
        },
      });

      // act
      await act(async () => {
        render(
          <AuthProvider>
            <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
              <Routes>
                <Route path="/dashboard/user/profile" element={<Profile />} />
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        );
      });

      fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
        target: { value: updatedUser.name },
      });

      fireEvent.click(screen.getByText("UPDATE"));

      // assert
      await waitFor(() =>
        expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
          name: updatedUser.name,
          email: user.email,
          password: "",
          phone: user.phone,
          address: user.address,
        })
      );
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Profile Updated Successfully"
        );
      });
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: updatedUser.name })
        ).toBeInTheDocument();
      });
    });
  });

  describe("CartPage Component", () => {
    it("should display updated user's name and address in the CartPage", async () => {
      // arrange
      axios.put.mockResolvedValueOnce({
        data: {
          success: true,
          updatedUser: {
            ...user,
            name: updatedUser.name,
            address: updatedUser.address,
          },
        },
      });

      // act
      await act(async () => {
        render(
          <AuthProvider>
            <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
              <Routes>
                <Route path="/dashboard/user/profile" element={<Profile />} />
                <Route path="/cart" element={<CartPage />} />
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        );
      });

      fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
        target: { value: updatedUser.name },
      });

      fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
        target: { value: updatedUser.address },
      });

      fireEvent.click(screen.getByText("UPDATE"));

      // wait for changes to load
      await waitFor(() =>
        expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
          name: updatedUser.name,
          email: user.email,
          password: "",
          phone: user.phone,
          address: updatedUser.address,
        })
      );
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Profile Updated Successfully"
        );
      });
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: updatedUser.name })
        ).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole("link", { name: "Cart" }));

      // assert
      await waitFor(() => {
        expect(
          screen.getByText(`Hello ${updatedUser.name}`)
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(`${updatedUser.address}`)).toBeInTheDocument();
      });
    });
  });

  describe("Dashboard Component", () => {
    it("should display updated user's name and address in the Dashboard", async () => {
      // arrange
      axios.put.mockResolvedValueOnce({
        data: {
          success: true,
          updatedUser: {
            ...user,
            name: updatedUser.name,
            address: updatedUser.address,
          },
        },
      });

      // act
      await act(async () => {
        render(
          <AuthProvider>
            <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
              <Routes>
                <Route path="/dashboard/user/profile" element={<Profile />} />
                <Route path="/dashboard/user" element={<Dashboard />} />
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        );
      });

      fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
        target: { value: updatedUser.name },
      });

      fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
        target: { value: updatedUser.address },
      });

      fireEvent.click(screen.getByText("UPDATE"));

      // wait for changes to load
      await waitFor(() =>
        expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
          name: updatedUser.name,
          email: user.email,
          password: "",
          phone: user.phone,
          address: updatedUser.address,
        })
      );
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Profile Updated Successfully"
        );
      });
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: updatedUser.name })
        ).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole("button", { name: updatedUser.name }));
      fireEvent.click(screen.getByRole("link", { name: "Dashboard" }));

      // assert
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: updatedUser.name })
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: user.email })
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: updatedUser.address })
        ).toBeInTheDocument();
      });
    });
  });
});
