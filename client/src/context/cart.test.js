import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { CartProvider, useCart } from "./cart";
import { BrowserRouter } from "react-router-dom";

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    store,
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Sample cart data for testing
const sampleCartItems = [
  {
    _id: "product1",
    name: "Test Product 1",
    description: "This is test product 1",
    price: 100,
    quantity: 2,
    shipping: true,
    category: "category1",
  },
  {
    _id: "product2",
    name: "Test Product 2",
    description: "This is test product 2",
    price: 200,
    quantity: 1,
    shipping: false,
    category: "category2",
  },
];

// Create test components that use the cart context
const CartDisplay = () => {
  const [cart] = useCart();
  return (
    <div>
      <h2>Cart Items</h2>
      <p data-testid="cart-count">Items in cart: {cart.length}</p>
      <ul>
        {cart.map((item) => (
          <li key={item._id} data-testid={`cart-item-${item._id}`}>
            {item.name} - ${item.price} x {item.quantity}
          </li>
        ))}
      </ul>
      <p data-testid="cart-total">
        Total: $
        {cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
      </p>
    </div>
  );
};

const CartActions = () => {
  const [cart, setCart] = useCart();

  const addProduct = (product) => {
    // Check if product already exists in cart
    const existingProduct = cart.find((item) => item._id === product._id);
    if (existingProduct) {
      // Update quantity
      const updatedCart = cart.map((item) =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } else {
      // Add new product
      const newCart = [...cart, { ...product, quantity: 1 }];
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
    }
  };

  const removeProduct = (productId) => {
    const updatedCart = cart.filter((item) => item._id !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <div>
      <button
        data-testid="add-product-1"
        onClick={() => addProduct(sampleCartItems[0])}
      >
        Add Product 1
      </button>
      <button
        data-testid="add-product-2"
        onClick={() => addProduct(sampleCartItems[1])}
      >
        Add Product 2
      </button>
      <button
        data-testid="remove-product-1"
        onClick={() => removeProduct("product1")}
      >
        Remove Product 1
      </button>
      <button
        data-testid="remove-product-2"
        onClick={() => removeProduct("product2")}
      >
        Remove Product 2
      </button>
      <button data-testid="clear-cart" onClick={clearCart}>
        Clear Cart
      </button>
    </div>
  );
};

// Test App that combines both components
const TestApp = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <CartDisplay />
        <CartActions />
      </CartProvider>
    </BrowserRouter>
  );
};

describe("Cart Context and Functionality", () => {
  beforeEach(() => {
    // Clear localStorage and reset mocks before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("renders cart with initial empty state", async () => {
    // Arrange & Act
    render(<TestApp />);

    // Assert
    expect(screen.getByTestId("cart-count")).toHaveTextContent(
      "Items in cart: 0"
    );
    expect(screen.getByTestId("cart-total")).toHaveTextContent("Total: $0");
    expect(localStorage.getItem).toHaveBeenCalledWith("cart");
  });

  test("loads existing cart items from localStorage on mount", async () => {
    // Arrange
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(sampleCartItems));

    // Act
    render(<TestApp />);

    // Assert
    expect(screen.getByTestId("cart-count")).toHaveTextContent(
      "Items in cart: 2"
    );
    expect(screen.getByTestId("cart-total")).toHaveTextContent("Total: $400");
    expect(screen.getByTestId("cart-item-product1")).toBeInTheDocument();
    expect(screen.getByTestId("cart-item-product2")).toBeInTheDocument();
  });

  test("adds a new product to the cart", async () => {
    // Arrange
    render(<TestApp />);

    // Initial state check
    expect(screen.getByTestId("cart-count")).toHaveTextContent(
      "Items in cart: 0"
    );

    // Act
    fireEvent.click(screen.getByTestId("add-product-1"));

    // Assert
    expect(screen.getByTestId("cart-count")).toHaveTextContent(
      "Items in cart: 1"
    );
    expect(screen.getByTestId("cart-item-product1")).toHaveTextContent(
      "Test Product 1 - $100 x 1"
    );
    expect(screen.getByTestId("cart-total")).toHaveTextContent("Total: $100");

    // Verify localStorage was updated
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "cart",
      expect.stringContaining("Test Product 1")
    );
  });

  test("increases quantity when adding an existing product", async () => {
    // Arrange
    render(<TestApp />);

    // Add product once
    fireEvent.click(screen.getByTestId("add-product-1"));
    expect(screen.getByTestId("cart-item-product1")).toHaveTextContent(
      "Test Product 1 - $100 x 1"
    );

    // Act - add same product again
    fireEvent.click(screen.getByTestId("add-product-1"));

    // Assert
    expect(screen.getByTestId("cart-count")).toHaveTextContent(
      "Items in cart: 1"
    );
    expect(screen.getByTestId("cart-item-product1")).toHaveTextContent(
      "Test Product 1 - $100 x 2"
    );
    expect(screen.getByTestId("cart-total")).toHaveTextContent("Total: $200");
  });

  test("removes a product from the cart", async () => {
    // Arrange
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(sampleCartItems));
    render(<TestApp />);

    // Initial state check
    expect(screen.getByTestId("cart-count")).toHaveTextContent(
      "Items in cart: 2"
    );

    // Act
    fireEvent.click(screen.getByTestId("remove-product-1"));

    // Assert
    expect(screen.getByTestId("cart-count")).toHaveTextContent(
      "Items in cart: 1"
    );
    expect(screen.queryByTestId("cart-item-product1")).not.toBeInTheDocument();
    expect(screen.getByTestId("cart-item-product2")).toBeInTheDocument();
    expect(screen.getByTestId("cart-total")).toHaveTextContent("Total: $200");
  });

  test("clears the entire cart", async () => {
    // Arrange
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(sampleCartItems));
    render(<TestApp />);

    // Initial state check
    expect(screen.getByTestId("cart-count")).toHaveTextContent(
      "Items in cart: 2"
    );

    // Act
    fireEvent.click(screen.getByTestId("clear-cart"));

    // Assert
    expect(screen.getByTestId("cart-count")).toHaveTextContent(
      "Items in cart: 0"
    );
    expect(screen.queryByTestId("cart-item-product1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cart-item-product2")).not.toBeInTheDocument();
    expect(screen.getByTestId("cart-total")).toHaveTextContent("Total: $0");
    expect(localStorage.removeItem).toHaveBeenCalledWith("cart");
  });

  test("handles adding multiple different products", async () => {
    // Arrange
    render(<TestApp />);

    // Act
    fireEvent.click(screen.getByTestId("add-product-1"));
    fireEvent.click(screen.getByTestId("add-product-2"));

    // Assert
    expect(screen.getByTestId("cart-count")).toHaveTextContent(
      "Items in cart: 2"
    );
    expect(screen.getByTestId("cart-item-product1")).toBeInTheDocument();
    expect(screen.getByTestId("cart-item-product2")).toBeInTheDocument();
    expect(screen.getByTestId("cart-total")).toHaveTextContent("Total: $300");
  });

  test("cart state persists across component rerenders", async () => {
    // Arrange
    const { rerender } = render(<TestApp />);

    // Add a product
    fireEvent.click(screen.getByTestId("add-product-1"));
    expect(screen.getByTestId("cart-count")).toHaveTextContent(
      "Items in cart: 1"
    );

    // Act - force rerender
    rerender(<TestApp />);

    // Assert - cart state should be preserved
    expect(screen.getByTestId("cart-count")).toHaveTextContent(
      "Items in cart: 1"
    );
    expect(screen.getByTestId("cart-item-product1")).toBeInTheDocument();
  });

  test("cart context is accessible from deeply nested components", async () => {
    // Arrange
    const NestedComponent = () => {
      const [cart, setCart] = useCart();
      return (
        <button
          data-testid="nested-add"
          onClick={() => {
            const newCart = [...cart, { ...sampleCartItems[0], quantity: 1 }];
            setCart(newCart);
          }}
        >
          Add from nested
        </button>
      );
    };

    const DeepNesting = () => (
      <div>
        <div>
          <div>
            <NestedComponent />
          </div>
        </div>
      </div>
    );

    // Act
    render(
      <BrowserRouter>
        <CartProvider>
          <CartDisplay />
          <DeepNesting />
        </CartProvider>
      </BrowserRouter>
    );

    // Initial state
    expect(screen.getByTestId("cart-count")).toHaveTextContent(
      "Items in cart: 0"
    );

    // Add from nested component
    fireEvent.click(screen.getByTestId("nested-add"));

    // Assert
    expect(screen.getByTestId("cart-count")).toHaveTextContent(
      "Items in cart: 1"
    );
    expect(screen.getByTestId("cart-item-product1")).toBeInTheDocument();
  });
});
