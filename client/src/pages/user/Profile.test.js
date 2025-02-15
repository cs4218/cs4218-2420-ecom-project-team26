import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, waitFor } from "@testing-library/react";
import axios from "axios";
import React from "react";
import toast from "react-hot-toast";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useAuth } from "../../context/auth";
import Profile from "./Profile";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock(
  "../../components/Layout",
  () =>
    ({ children, title, description, keywords, author }) =>
      (
        <div>
          <meta name="description" content={description} />
          <meta name="keywords" content={keywords} />
          <meta name="author" content={author} />
          <title>{title}</title>
          <main>{children}</main>
        </div>
      )
);

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

describe("Profile Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global.console, "log");
    useAuth.mockReturnValue([
      {
        user: {
          address: "123 Street",
          email: "test@example.com",
          name: "Admin",
          phone: "81234567",
          role: 0,
          _id: "1",
        },
        token: "123",
      },
      jest.fn(),
    ]);
    Object.defineProperty(window, "localStorage", {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn((key) =>
          key === "auth"
            ? JSON.stringify({
                user: {
                  name: "Admin",
                  email: "test@example.com",
                  phone: "81234567",
                  address: "123 Street",
                },
              })
            : null
        ),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  it("renders the profile page with user details except password", async () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
        <Routes>
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("USER PROFILE")).toBeInTheDocument();
    expect(getByText("UPDATE")).toBeInTheDocument();
    expect(getByText("Profile")).toBeInTheDocument();
    expect(getByText("Orders")).toBeInTheDocument();
    expect(getByText("Dashboard")).toBeInTheDocument();

    expect(getByPlaceholderText("Enter Your Name")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter Your Password")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter Your Phone")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter Your Address")).toBeInTheDocument();

    expect(getByPlaceholderText("Enter Your Name").value).toBe("Admin");
    expect(getByPlaceholderText("Enter Your Email").value).toBe(
      "test@example.com"
    );
    expect(getByPlaceholderText("Enter Your Password").value).toBe("");
    expect(getByPlaceholderText("Enter Your Phone").value).toBe("81234567");
    expect(getByPlaceholderText("Enter Your Address").value).toBe("123 Street");
  });

  it("should allow inputs for name, password, phone and address", async () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
        <Routes>
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Enter Your Name"), {
      target: { value: "Admin 2" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
      target: { value: "91234567" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), {
      target: { value: "456 Street" },
    });
    expect(getByPlaceholderText("Enter Your Name").value).toBe("Admin 2");
    expect(getByPlaceholderText("Enter Your Password").value).toBe(
      "Password123!"
    );
    expect(getByPlaceholderText("Enter Your Phone").value).toBe("91234567");
    expect(getByPlaceholderText("Enter Your Address").value).toBe("456 Street");

    expect(getByPlaceholderText("Enter Your Name")).toBeEnabled();
    expect(getByPlaceholderText("Enter Your Password")).toBeEnabled();
    expect(getByPlaceholderText("Enter Your Phone")).toBeEnabled();
    expect(getByPlaceholderText("Enter Your Address")).toBeEnabled();
  });

  it("should not allow inputs email", async () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
        <Routes>
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );
    expect(getByPlaceholderText("Enter Your Email")).toBeDisabled();
  });

  it("should hide password input", async () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
        <Routes>
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );
    expect(getByPlaceholderText("Enter Your Password")).toHaveAttribute(
      "type",
      "password"
    );
  });

  it("should update user details successfully", async () => {
    axios.put.mockResolvedValueOnce({
      data: {
        success: true,
        updatedUser: {
          address: "456 Street",
          email: "test2@example.com",
          name: "Admin 2",
          phone: "91234567",
          role: 0,
          _id: "1",
        },
      },
    });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
        <Routes>
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Enter Your Name"), {
      target: { value: "Admin 2" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
      target: { value: "91234567" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), {
      target: { value: "456 Street" },
    });

    fireEvent.click(getByText("UPDATE"));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
        name: "Admin 2",
        email: "test@example.com",
        password: "Password123!",
        phone: "91234567",
        address: "456 Street",
      })
    );
    expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
  });

  it("should show error message if update is unsuccessful", async () => {
    axios.put.mockRejectedValueOnce("Error");

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
        <Routes>
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Enter Your Name"), {
      target: { value: "Admin 2" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
      target: { value: "91234567" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), {
      target: { value: "456 Street" },
    });

    fireEvent.click(getByText("UPDATE"));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
        name: "Admin 2",
        email: "test@example.com",
        password: "Password123!",
        phone: "91234567",
        address: "456 Street",
      })
    );
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    expect(console.log).toHaveBeenCalledWith("Error");
  });

  it("should show backend error message", async () => {
    axios.put.mockResolvedValueOnce({
      data: {
        error: "Backend Error Message",
      },
    });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
        <Routes>
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Enter Your Name"), {
      target: { value: "Admin 2" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
      target: { value: "91234567" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), {
      target: { value: "456 Street" },
    });

    fireEvent.click(getByText("UPDATE"));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
        name: "Admin 2",
        email: "test@example.com",
        password: "Password123!",
        phone: "91234567",
        address: "456 Street",
      })
    );
    expect(toast.error).toHaveBeenCalledWith("Backend Error Message");
  });
});
