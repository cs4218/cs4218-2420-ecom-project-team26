import "@testing-library/jest-dom/extend-expect";
import {
  act,
  fireEvent,
  getAllByAltText,
  render,
  waitFor,
} from "@testing-library/react";
import axios from "axios";
import DropIn from "braintree-web-drop-in-react";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import CartPage from "./CartPage";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock(
  "../components/Layout",
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

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("braintree-web-drop-in-react", () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mocked DropIn Component</div>),
}));

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

const cartDetails = [
  {
    _id: "1",
    name: "Novel",
    description: "A bestselling novel",
    price: 14.99,
  },
  {
    _id: "2",
    name: "NUS T-shirt",
    description: "Plain NUS T-shirt for sale",
    price: 4.99,
  },
  {
    _id: "3",
    name: "The Law of Contract in Singapore",
    description: "A bestselling book in Singapor",
    price: 54.99,
  },
];

describe("CartPage Component - User is Logged In", () => {
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
        token: "mocked-auth-token",
      },
      jest.fn(),
    ]);
    axios.get.mockResolvedValue({
      data: { clientToken: "mocked-braintree-token" },
    });
    Object.defineProperty(window, "localStorage", {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("empty cart page should render", async () => {
    const { queryByText, getByText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("Hello Admin")).toBeInTheDocument();
    expect(getByText("Your Cart Is Empty")).toBeInTheDocument();
    expect(getByText("Cart Summary")).toBeInTheDocument();
    expect(getByText("Total | Checkout | Payment")).toBeInTheDocument();
    expect(getByText("Total : $0.00")).toBeInTheDocument();
    expect(getByText("Current Address")).toBeInTheDocument();
    expect(getByText("123 Street")).toBeInTheDocument();
    expect(getByText("Update Address")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token");
    });

    await waitFor(() => {
      expect(queryByText("Make Payment")).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(queryByText("Mocked DropIn Component")).not.toBeInTheDocument();
    });
  });

  it("cart page with 3 items should render", async () => {
    useCart.mockReturnValue([cartDetails, jest.fn()]);

    const { getAllByText, getByText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("Hello Admin")).toBeInTheDocument();
    expect(getByText("You Have 3 items in your cart")).toBeInTheDocument();
    expect(getByText("Cart Summary")).toBeInTheDocument();
    expect(getByText("Total | Checkout | Payment")).toBeInTheDocument();
    expect(getByText("Total : $74.97")).toBeInTheDocument();
    expect(getByText("Current Address")).toBeInTheDocument();
    expect(getByText("123 Street")).toBeInTheDocument();
    expect(getByText("Update Address")).toBeInTheDocument();

    expect(getByText("Novel")).toBeInTheDocument();
    expect(getByText("A bestselling novel")).toBeInTheDocument();
    expect(getByText("Price : 14.99")).toBeInTheDocument();

    expect(getByText("NUS T-shirt")).toBeInTheDocument();
    expect(getByText("Plain NUS T-shirt for sale")).toBeInTheDocument();
    expect(getByText("Price : 4.99")).toBeInTheDocument();

    expect(getByText("The Law of Contract in Singapore")).toBeInTheDocument();
    expect(getByText("A bestselling book in Singapor")).toBeInTheDocument();
    expect(getByText("Price : 54.99")).toBeInTheDocument();

    expect(getAllByText("Remove").length).toBe(3);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token");
    });

    await waitFor(() => {
      expect(getByText("Make Payment")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getByText("Mocked DropIn Component")).toBeInTheDocument();
    });
  });

  it("should be able remove items", async () => {
    let cartState = [...cartDetails];
    const setCartMock = jest.fn((newCart) => (cartState = newCart));
    useCart.mockReturnValue([cartState, setCartMock]);

    const { getAllByText, rerender } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getAllByText("Remove").length).toBe(3);

    await waitFor(() => {
      expect(getAllByText("Remove")[0]).toBeEnabled();
    });

    act(() => {
      fireEvent.click(getAllByText("Remove")[0]);
    });

    useCart.mockReturnValue([cartState, setCartMock]);

    await act(async () => {
      rerender(
        <MemoryRouter initialEntries={["/cart"]}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(getAllByText("Remove").length).toBe(2);
    });
  });

  it("should navigate to profile page when 'Update Address' button is clicked", async () => {
    useCart.mockReturnValue([cartDetails, jest.fn()]);

    const { getByText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/dashboard/user/profile"
            element={<div>Mocked Profile Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    const updateAddressButton = getByText("Update Address");
    expect(updateAddressButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(updateAddressButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });

  it("should navigate to profile page when 'Update Address' button is clicked and has no address", async () => {
    useCart.mockReturnValue([cartDetails, jest.fn()]);
    useAuth.mockReturnValue([
      {
        user: {
          email: "test@example.com",
          name: "Admin",
          phone: "81234567",
          role: 0,
          _id: "1",
        },
        token: "mocked-auth-token",
      },
      jest.fn(),
    ]);

    const { getByText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/dashboard/user/profile"
            element={<div>Mocked Profile Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    const updateAddressButton = getByText("Update Address");
    expect(updateAddressButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(updateAddressButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });

  it("should be able to make payment", async () => {
    useCart.mockReturnValue([cartDetails, jest.fn()]);

    axios.post.mockResolvedValue({
      data: { response: "Payment successful!" },
    });

    const mockInstance = {
      requestPaymentMethod: jest
        .fn()
        .mockResolvedValue({ nonce: "fake-nonce" }),
    };

    DropIn.mockImplementation(({ onInstance }) => {
      useEffect(() => {
        onInstance(mockInstance);
      }, [onInstance]);

      return <div>Mocked DropIn Component</div>;
    });

    const { queryByText, getByText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/dashboard/user/orders"
            element={<div>Mocked Orders Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token");
    });

    await waitFor(() => {
      expect(getByText("Make Payment")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getByText("Mocked DropIn Component")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(queryByText("Make Payment")).toBeEnabled();
    });

    act(() => {
      fireEvent.click(queryByText("Make Payment"));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/braintree/payment",
        {
          nonce: "fake-nonce",
          cart: cartDetails,
        }
      );
    });
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Payment Completed Successfully "
      );
    });
  });

  it("error should be caught while making payment", async () => {
    useCart.mockReturnValue([cartDetails, jest.fn()]);
    axios.post.mockRejectedValue(new Error("Payment Error"));

    const { queryByText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/dashboard/user/orders"
            element={<div>Mocked Orders Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(queryByText("Make Payment")).toBeEnabled();
    });

    act(() => {
      fireEvent.click(queryByText("Make Payment"));
    });

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(new Error("Payment Error"));
    });
  });
});

describe("CartPage Component - User NOT is Logged In with no token", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global.console, "log");
    useAuth.mockReturnValue([
      {
        user: null,
        token: null,
      },
      jest.fn(),
    ]);
    axios.get.mockResolvedValue({
      data: { clientToken: null },
    });
    Object.defineProperty(window, "localStorage", {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("empty cart page should render", async () => {
    useCart.mockReturnValue([[], jest.fn()]);

    const { getByText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("Hello Guest")).toBeInTheDocument();
    expect(getByText("Your Cart Is Empty")).toBeInTheDocument();
    expect(getByText("Cart Summary")).toBeInTheDocument();
    expect(getByText("Total | Checkout | Payment")).toBeInTheDocument();
    expect(getByText("Total : $0.00")).toBeInTheDocument();
    expect(getByText("Plase Login to checkout")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token");
    });
  });

  it("cart page with 3 items should render", async () => {
    useCart.mockReturnValue([cartDetails, jest.fn()]);

    const { queryByText, getAllByText, getByText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("Hello Guest")).toBeInTheDocument();
    expect(
      getByText("You Have 3 items in your cart please login to checkout !")
    ).toBeInTheDocument();
    expect(getByText("Cart Summary")).toBeInTheDocument();
    expect(getByText("Total | Checkout | Payment")).toBeInTheDocument();
    expect(getByText("Total : $74.97")).toBeInTheDocument();
    expect(getByText("Plase Login to checkout")).toBeInTheDocument();

    expect(getByText("Novel")).toBeInTheDocument();
    expect(getByText("A bestselling novel")).toBeInTheDocument();
    expect(getByText("Price : 14.99")).toBeInTheDocument();

    expect(getByText("NUS T-shirt")).toBeInTheDocument();
    expect(getByText("Plain NUS T-shirt for sale")).toBeInTheDocument();
    expect(getByText("Price : 4.99")).toBeInTheDocument();

    expect(getByText("The Law of Contract in Singapore")).toBeInTheDocument();
    expect(getByText("A bestselling book in Singapor")).toBeInTheDocument();
    expect(getByText("Price : 54.99")).toBeInTheDocument();

    expect(getAllByText("Remove").length).toBe(3);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token");
    });

    await waitFor(() => {
      expect(queryByText("Mocked DropIn Component")).not.toBeInTheDocument();
    });
  });

  it("should be able remove items", async () => {
    let cartState = [...cartDetails];
    const setCartMock = jest.fn((newCart) => (cartState = newCart));
    useCart.mockReturnValue([cartState, setCartMock]);

    const { getAllByText, rerender } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getAllByText("Remove").length).toBe(3);

    await waitFor(() => {
      expect(getAllByText("Remove")[0]).toBeEnabled();
    });

    act(() => {
      fireEvent.click(getAllByText("Remove")[0]);
    });

    useCart.mockReturnValue([cartState, setCartMock]);
    rerender(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getAllByText("Remove").length).toBe(2);
    });
  });

  it("should navigate to login page when 'Plase Login to checkout' button is clicked", async () => {
    useCart.mockReturnValue([cartDetails, jest.fn()]);

    const { getByText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    const loginButton = getByText("Plase Login to checkout");
    expect(loginButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(loginButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/login", {
      state: "/cart",
    });
  });

  it("error should be caught while removing items", async () => {
    let cartState = [...cartDetails];
    const setCartMock = jest.fn().mockImplementation(() => {
      throw new Error("Cart Error");
    });
    useCart.mockReturnValue([cartState, setCartMock]);

    const { getAllByText } = render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getAllByText("Remove").length).toBe(3);

    await waitFor(() => {
      expect(getAllByText("Remove")[0]).toBeEnabled();
    });

    act(() => {
      fireEvent.click(getAllByText("Remove")[0]);
    });

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(new Error("Cart Error"));
    });
  });

  it("error should be caught while setting token", async () => {
    useCart.mockReturnValue([cartDetails, jest.fn()]);
    axios.get.mockRejectedValue(new Error("Token Error"));

    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token");
    });

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(new Error("Token Error"));
    });
  });

  it("error should be caught while converting price", async () => {
    jest.spyOn(Number.prototype, "toLocaleString").mockImplementation(() => {
      throw new Error("Locale string error");
    });
    useCart.mockReturnValue([cartDetails, jest.fn()]);

    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token");
    });

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(
        new Error("Locale string error")
      );
    });
  });
});
