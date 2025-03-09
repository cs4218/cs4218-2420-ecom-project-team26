const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Product = require("./productModel");

let mongoServer;
let category;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("productModel test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    category = new mongoose.Types.ObjectId();
  });

  it("should create a product successfully", async () => {
    const productData = {
      name: "Test Product",
      slug: "test-product",
      description: "A description for the test product",
      price: 99.99,
      category: category,
      quantity: 10,
      shipping: true,
    };

    const product = new Product(productData);
    const savedProduct = await product.save();

    expect(savedProduct._id).toBeDefined();
    expect(savedProduct.name).toBe("Test Product");
    expect(savedProduct.slug).toBe("test-product");
    expect(savedProduct.description).toBe("A description for the test product");
    expect(savedProduct.price).toBe(99.99);
    expect(savedProduct.category).toEqual(category);
    expect(savedProduct.quantity).toBe(10);
    expect(savedProduct.shipping).toBe(true);
  });

  it("should fail when name is missing", async () => {
    const productData = {
      slug: "test-product",
      description: "A description for the test product",
      price: 99.99,
      category: category,
      quantity: 10,
    };

    try {
      const product = new Product(productData);
      await product.save();
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
    }
  });

  it("should fail when slug is missing", async () => {
    const productData = {
      name: "Test Product",
      description: "A description for the test product",
      price: 99.99,
      category: category,
      quantity: 10,
      shipping: true,
    };

    try {
      const product = new Product(productData);
      await product.save();
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.slug).toBeDefined();
    }
  });

  it("should fail when description is missing", async () => {
    const productData = {
      name: "Test Product",
      slug: "test-product",
      price: 99.99,
      category: category,
      quantity: 10,
      shipping: true,
    };

    try {
      const product = new Product(productData);
      await product.save();
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.description).toBeDefined();
    }
  });

  it("should fail when price is missing", async () => {
    const productData = {
      name: "Test Product",
      slug: "test-product",
      description: "A description for the test product",
      category: category,
      quantity: 10,
      shipping: true,
    };

    try {
      const product = new Product(productData);
      await product.save();
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.price).toBeDefined();
    }
  });

  it("should validate price is a number", async () => {
    const category = new mongoose.Types.ObjectId();

    const invalidProductData = {
      name: "Invalid Price Product",
      slug: "invalid-price",
      description: "Product with invalid price",
      price: "not-a-number",
      category: category,
      quantity: 10,
    };

    const product = new Product(invalidProductData);
    try {
      await product.save();
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.price).toBeDefined();
    }
  });

  it("should fail when category is missing", async () => {
    const productData = {
      name: "Test Product",
      slug: "test-product",
      description: "A description for the test product",
      price: 99.99,
      quantity: 10,
      shipping: true,
    };

    try {
      const product = new Product(productData);
      await product.save();
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.category).toBeDefined();
    }
  });

  it("should fail when quantity is missing", async () => {
    const productData = {
      name: "Test Product",
      slug: "test-product",
      description: "A description for the test product",
      price: 99.99,
      category: category,
      shipping: true,
    };

    try {
      const product = new Product(productData);
      await product.save();
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.quantity).toBeDefined();
    }
  });
});
