import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, waitFor } from "@testing-library/react";
import axios from "axios";
import moment from "moment";
import React from "react";
import toast from "react-hot-toast";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useAuth } from "../../context/auth";
import Orders from "./Orders";

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
  useAuth: jest.fn(),
}));

jest.mock("moment", () => {
  return jest.fn(() => ({
    fromNow: jest.fn(() => "a few seconds ago"),
  }));
});

describe("Orders Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global.console, "log");
  });

  it("does not render the orders page if not authenticated", async () => {
    useAuth.mockReturnValue([
      {
        user: null,
        token: null,
      },
      jest.fn(),
    ]);

    render(
      <MemoryRouter initialEntries={["/dashboard/user/orders"]}>
        <Routes>
          <Route path="/dashboard/user/orders" element={<Orders />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalled();
    });
  });

  it("renders the orders page with heading and 0 orders", async () => {
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

    axios.get.mockResolvedValue({
      data: [],
    });

    const { getByText, queryByText } = render(
      <MemoryRouter initialEntries={["/dashboard/user/orders"]}>
        <Routes>
          <Route path="/dashboard/user/orders" element={<Orders />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    expect(getByText("All Orders")).toBeInTheDocument();
    expect(queryByText("#")).not.toBeInTheDocument();
    expect(queryByText("Status")).not.toBeInTheDocument();
    expect(queryByText("Buyer")).not.toBeInTheDocument();
    expect(queryByText("date")).not.toBeInTheDocument();
    expect(queryByText("Payment")).not.toBeInTheDocument();
    expect(queryByText("Quantity")).not.toBeInTheDocument();
  });

  it("renders the orders page with 1 successful order", async () => {
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

    axios.get.mockResolvedValue({
      data: [
        {
          products: [
            {
              _id: "1",
              name: "Novel",
              description: "A bestselling novel",
              price: 14.99,
            },
          ],
          payment: {
            success: true,
          },
          buyer: {
            name: "Admin",
          },
          status: "Not Process",
          createdAt: "2025-02-09T13:53:54.339Z",
        },
      ],
    });

    const { getByText, getAllByText } = render(
      <MemoryRouter initialEntries={["/dashboard/user/orders"]}>
        <Routes>
          <Route path="/dashboard/user/orders" element={<Orders />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(getByText("#")).toBeInTheDocument();
    });

    expect(getByText("Status")).toBeInTheDocument();
    expect(getByText("Buyer")).toBeInTheDocument();
    expect(getByText("date")).toBeInTheDocument();
    expect(getByText("Payment")).toBeInTheDocument();
    expect(getByText("Quantity")).toBeInTheDocument();

    expect(getAllByText("1")).toHaveLength(2);
    expect(getByText("Not Process")).toBeInTheDocument();
    expect(getByText("Admin")).toBeInTheDocument();
    expect(getByText("a few seconds ago")).toBeInTheDocument();
    expect(getByText("Success")).toBeInTheDocument();
    expect(getByText("Novel")).toBeInTheDocument();
    expect(getByText("A bestselling novel")).toBeInTheDocument();
    expect(getByText("Price : 14.99")).toBeInTheDocument();

    expect(moment).toHaveBeenCalledWith("2025-02-09T13:53:54.339Z");
  });

  it("renders the orders page with 1 failed order", async () => {
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

    axios.get.mockResolvedValue({
      data: [
        {
          products: [
            {
              _id: "1",
              name: "Novel",
              description: "A bestselling novel",
              price: 14.99,
            },
          ],
          payment: {
            success: false,
          },
          buyer: {
            name: "Admin",
          },
          status: "Not Process",
          createdAt: "2025-02-09T13:53:54.339Z",
        },
      ],
    });

    const { getByText, getAllByText } = render(
      <MemoryRouter initialEntries={["/dashboard/user/orders"]}>
        <Routes>
          <Route path="/dashboard/user/orders" element={<Orders />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(getByText("#")).toBeInTheDocument();
    });

    expect(getByText("Status")).toBeInTheDocument();
    expect(getByText("Buyer")).toBeInTheDocument();
    expect(getByText("date")).toBeInTheDocument();
    expect(getByText("Payment")).toBeInTheDocument();
    expect(getByText("Quantity")).toBeInTheDocument();

    expect(getAllByText("1")).toHaveLength(2);
    expect(getByText("Not Process")).toBeInTheDocument();
    expect(getByText("Admin")).toBeInTheDocument();
    expect(getByText("a few seconds ago")).toBeInTheDocument();
    expect(getByText("Failed")).toBeInTheDocument();
    expect(getByText("Novel")).toBeInTheDocument();
    expect(getByText("A bestselling novel")).toBeInTheDocument();
    expect(getByText("Price : 14.99")).toBeInTheDocument();

    expect(moment).toHaveBeenCalledWith("2025-02-09T13:53:54.339Z");
  });

  it("renders the orders page with 1 failed and 1 success order", async () => {
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

    axios.get.mockResolvedValue({
      data: [
        {
          products: [
            {
              _id: "1",
              name: "Novel",
              description: "A bestselling novel",
              price: 14.99,
            },
          ],
          payment: {
            success: false,
          },
          buyer: {
            name: "Admin",
          },
          status: "Not Process",
          createdAt: "2025-02-09T13:53:54.339Z",
        },
        {
          products: [
            {
              _id: "2",
              name: "The Law of Contract in Singapore",
              description: "A bestselling book in Singapor",
              price: 54.99,
            },
          ],
          payment: {
            success: true,
          },
          buyer: {
            name: "Admin",
          },
          status: "Not Process",
          createdAt: "2025-02-09T13:53:54.339Z",
        },
      ],
    });

    const { getByText, getAllByText } = render(
      <MemoryRouter initialEntries={["/dashboard/user/orders"]}>
        <Routes>
          <Route path="/dashboard/user/orders" element={<Orders />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(getAllByText("#")).toHaveLength(2);
    });

    expect(getAllByText("Status")).toHaveLength(2);
    expect(getAllByText("Buyer")).toHaveLength(2);
    expect(getAllByText("date")).toHaveLength(2);
    expect(getAllByText("Payment")).toHaveLength(2);
    expect(getAllByText("Quantity")).toHaveLength(2);

    expect(getAllByText("1")).toHaveLength(3);

    expect(getAllByText("Not Process")).toHaveLength(2);
    expect(getAllByText("Admin")).toHaveLength(2);
    expect(getAllByText("a few seconds ago")).toHaveLength(2);

    expect(getByText("Failed")).toBeInTheDocument();
    expect(getByText("Novel")).toBeInTheDocument();
    expect(getByText("A bestselling novel")).toBeInTheDocument();
    expect(getByText("Price : 14.99")).toBeInTheDocument();

    expect(getByText("2")).toBeInTheDocument();
    expect(getByText("Success")).toBeInTheDocument();
    expect(getByText("The Law of Contract in Singapore")).toBeInTheDocument();
    expect(getByText("A bestselling book in Singapor")).toBeInTheDocument();
    expect(getByText("Price : 54.99")).toBeInTheDocument();

    expect(moment).toHaveBeenCalledWith("2025-02-09T13:53:54.339Z");
  });

  it("renders the orders page with 1 success order with 2 products", async () => {
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

    axios.get.mockResolvedValue({
      data: [
        {
          products: [
            {
              _id: "1",
              name: "Novel",
              description: "A bestselling novel",
              price: 14.99,
            },
            {
              _id: "2",
              name: "Shirt",
              description: "A nice shirt",
              price: 24.99,
            },
          ],
          payment: {
            success: true,
          },
          buyer: {
            name: "Admin",
          },
          status: "Not Process",
          createdAt: "2025-02-09T13:53:54.339Z",
        },
      ],
    });

    const { getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/user/orders"]}>
        <Routes>
          <Route path="/dashboard/user/orders" element={<Orders />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(getByText("#")).toBeInTheDocument();
    });

    expect(getByText("Status")).toBeInTheDocument();
    expect(getByText("Buyer")).toBeInTheDocument();
    expect(getByText("date")).toBeInTheDocument();
    expect(getByText("Payment")).toBeInTheDocument();
    expect(getByText("Quantity")).toBeInTheDocument();

    expect(getByText("1")).toBeInTheDocument();
    expect(getByText("Not Process")).toBeInTheDocument();
    expect(getByText("Admin")).toBeInTheDocument();
    expect(getByText("a few seconds ago")).toBeInTheDocument();
    expect(getByText("Success")).toBeInTheDocument();
    expect(getByText("2")).toBeInTheDocument();

    expect(getByText("Novel")).toBeInTheDocument();
    expect(getByText("A bestselling novel")).toBeInTheDocument();
    expect(getByText("Price : 14.99")).toBeInTheDocument();

    expect(getByText("Shirt")).toBeInTheDocument();
    expect(getByText("A nice shirt")).toBeInTheDocument();
    expect(getByText("Price : 24.99")).toBeInTheDocument();

    expect(moment).toHaveBeenCalledWith("2025-02-09T13:53:54.339Z");
  });

  it("console logs API errors", async () => {
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
    ]);

    axios.get.mockRejectedValue("Error");

    render(
      <MemoryRouter initialEntries={["/dashboard/user/orders"]}>
        <Routes>
          <Route path="/dashboard/user/orders" element={<Orders />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith("Error");
    });
  });
});
