import { expect, jest } from "@jest/globals";
import categoryModel from "../models/categoryModel";
import orderModel from "../models/orderModel";
import productModel from "../models/productModel";
import {
  createProductController,
  getProductController,
  getSingleProductController,
  productPhotoController,
  deleteProductController,
  updateProductController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  relatedProductController,
  productCategoryController,
  braintreeTokenController,
  brainTreePaymentController,
} from "./productController";
import { BraintreeGateway } from "braintree";
const fs = require("fs");
const slugify = require("slugify");
const braintree = require("braintree");

jest.mock("fs");
jest.mock("slugify");
jest.mock("braintree", () => {
  const mockGenerate = jest.fn();
  const mockClientToken = {
    generate: mockGenerate,
  };

  const mockBraintreeGateway = jest.fn().mockImplementation(() => ({
    clientToken: mockClientToken,
  }));

  return {
    BraintreeGateway: mockBraintreeGateway,
    Environment: {
      Sandbox: "sandbox",
    },
  };
});
jest.mock("../models/productModel");

describe("createProductController test", () => {
  let req, res;

  beforeEach(() => {
    fs.readFileSync.mockReturnValue(Buffer.from("fake image data"));

    req = {
      fields: {
        name: "Test Product",
        description: "A product for testing",
        price: 100,
        category: "Test Category",
        quantity: 10,
        shipping: true,
      },
      files: {
        photo: {
          path: "path/to/photo.jpg",
          type: "image/jpeg",
          size: 500000,
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    slugify.mockReturnValue("test-product");
  });

  it("should return error if name is missing", async () => {
    req.fields = {
      name: "",
      description: "A product for testing",
      price: 100,
      category: "Test Category",
      quantity: 10,
      shipping: true,
    };

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
  });

  it("should return error if photo size exceeds 1MB", async () => {
    req.files.photo.size = 2000000;
    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "photo is Required and should be less then 1mb",
    });
  });

  it("should create a product successfully when all fields are valid", async () => {
    productModel.prototype.save = jest
      .fn()
      .mockResolvedValue("Product saved successfully");
    fs.readFileSync.mockReturnValue(Buffer.from("fake image data"));

    await createProductController(req, res);

    expect(productModel.prototype.save).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Created Successfully",
      products: expect.any(Object),
    });
  });

  it("should handle error during product creation", async () => {
    productModel.prototype.save = jest
      .fn()
      .mockRejectedValue(new Error("DB Error"));

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error in creating product",
    });
  });
});

describe("getProductController test", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should return all products successfully", async () => {
    const mockProducts = [
      {
        _id: "1",
        name: "Product1",
        category: { _id: "10", name: "Category1" },
      },
      {
        _id: "2",
        name: "Product2",
        category: { _id: "20", name: "Category2" },
      },
    ];

    productModel.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    });

    await getProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      counTotal: mockProducts.length,
      message: "ALlProducts ",
      products: mockProducts,
    });
  });

  it("should handle errors correctly", async () => {
    productModel.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockRejectedValue(new Error("Database error")),
    });

    await getProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Erorr in getting products",
      error: "Database error",
    });
  });
});

describe("getSingleProductController test", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { slug: "test-product" } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should return a single product successfully", async () => {
    const mockProduct = {
      _id: "12345",
      name: "Test Product",
      slug: "test-product",
      category: { _id: "67890", name: "Test Category" },
    };

    productModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockProduct),
    });

    await getSingleProductController(req, res);

    expect(productModel.findOne).toHaveBeenCalledWith({ slug: "test-product" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Single Product Fetched",
      product: mockProduct,
    });
  });

  it("should handle errors correctly", async () => {
    const mockError = new Error("Database error");

    productModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockRejectedValue(mockError),
    });

    await getSingleProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Eror while getitng single product",
      error: mockError,
    });
  });
});

describe("productPhotoController test", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { pid: "12345" } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      set: jest.fn(),
    };
  });

  it("should return the product photo successfully", async () => {
    const mockProduct = {
      photo: {
        data: Buffer.from("mock image data"),
        contentType: "image/png",
      },
    };

    productModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockProduct),
    });

    await productPhotoController(req, res);

    expect(productModel.findById).toHaveBeenCalledWith("12345");
    expect(res.set).toHaveBeenCalledWith("Content-type", "image/png");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockProduct.photo.data);
  });

  it("should return an error when an exception occurs", async () => {
    const mockError = new Error("Database error");

    productModel.findById.mockReturnValue({
      select: jest.fn().mockRejectedValue(mockError),
    });

    await productPhotoController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Erorr while getting photo",
      error: mockError,
    });
  });

  it("should not send a response if photo data does not exist", async () => {
    const mockProduct = {
      photo: {},
    };

    productModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockProduct),
    });

    await productPhotoController(req, res);

    expect(res.set).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("deleteProductController test", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { pid: "12345" } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it("should delete a product successfully", async () => {
    const mockDeletedProduct = {
      _id: "some-mocked-id",
      name: "Mock Product",
      slug: "mock-product",
      description: "This is a mock product",
      price: 100,
      category: "mock-category-id",
      quantity: 10,
      shipping: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    productModel.findByIdAndDelete.mockResolvedValue(mockDeletedProduct);
    await deleteProductController(req, res);

    expect(productModel.findByIdAndDelete).toHaveBeenCalledWith("12345");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Deleted successfully",
    });
  });

  it("should return error if deletion fails", async () => {
    const mockError = new Error("Database error");
    productModel.findByIdAndDelete.mockRejectedValue(mockError);

    await deleteProductController(req, res);

    expect(productModel.findByIdAndDelete).toHaveBeenCalledWith("12345");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while deleting product",
      error: mockError,
    });
  });

  it("should return 200 even if the product does not exist", async () => {
    productModel.findByIdAndDelete.mockResolvedValue(null);

    await deleteProductController(req, res);

    expect(productModel.findByIdAndDelete).toHaveBeenCalledWith("12345");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Deleted successfully",
    });
  });
});

describe("updateProductController test", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { pid: "1" },
      fields: {
        name: "Updated Product",
        description: "Updated Description",
        price: 20,
        category: "Electronics",
        quantity: 100,
        shipping: true,
      },
      files: {
        photo: {
          size: 500000,
          type: "image/jpeg",
          path: "path/to/photo.jpg",
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Reset the mock implementations
    fs.readFileSync.mockReset();
    productModel.findByIdAndUpdate.mockReset();
    slugify.mockReset();
  });

  it("should return error if name is not provided", async () => {
    req.fields.name = "";
    await updateProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
  });

  it("should return error if description is not provided", async () => {
    req.fields.description = "";
    await updateProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Description is Required" });
  });

  it("should return error if price is not provided", async () => {
    req.fields.price = null;
    await updateProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Price is Required" });
  });

  it("should return error if category is not provided", async () => {
    req.fields.category = "";
    await updateProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Category is Required" });
  });

  it("should return error if quantity is not provided", async () => {
    req.fields.quantity = null;
    await updateProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Quantity is Required" });
  });

  it("should return error if photo size is greater than 1MB", async () => {
    req.files.photo.size = 2000000;
    await updateProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "photo is Required and should be less then 1mb",
    });
  });

  it("should update product and return success response", async () => {
    const mockProduct = { save: jest.fn() };
    productModel.findByIdAndUpdate.mockResolvedValue(mockProduct);
    fs.readFileSync.mockReturnValue("mocked file data");
    slugify.mockReturnValue("updated-product");

    await updateProductController(req, res);

    expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "1",
      { ...req.fields, slug: "updated-product" },
      { new: true }
    );
    expect(fs.readFileSync).toHaveBeenCalledWith("path/to/photo.jpg");
    expect(mockProduct.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Updated Successfully",
      products: mockProduct,
    });
  });

  it("should handle errors and return failure response", async () => {
    const errorMessage = new Error("Database Error");
    productModel.findByIdAndUpdate.mockRejectedValue(errorMessage);

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: errorMessage,
      message: "Error in Updte product",
    });
  });
});

describe("productFiltersController test", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        checked: ["Electronics"],
        radio: [10, 50],
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    productModel.find.mockReset();
  });

  it("should return products filtered by category and price range", async () => {
    const mockProducts = [
      { name: "Product 1", category: "Electronics", price: 30 },
      { name: "Product 2", category: "Electronics", price: 40 },
    ];
    productModel.find.mockResolvedValue(mockProducts);

    await productFiltersController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      category: ["Electronics"],
      price: { $gte: 10, $lte: 50 },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });
  });

  it("should return products filtered only by category if price range is not provided", async () => {
    req.body.radio = [];
    const mockProducts = [
      { name: "Product 1", category: "Electronics", price: 30 },
      { name: "Product 2", category: "Electronics", price: 40 },
    ];
    productModel.find.mockResolvedValue(mockProducts);

    await productFiltersController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      category: ["Electronics"],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });
  });

  it("should return all products if no category or price range filter is applied", async () => {
    req.body.checked = [];
    req.body.radio = [];
    const mockProducts = [
      { name: "Product 1", category: "Electronics", price: 30 },
      { name: "Product 2", category: "Clothing", price: 40 },
    ];
    productModel.find.mockResolvedValue(mockProducts);

    await productFiltersController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });
  });

  it("should return an error if an exception occurs during the filtering process", async () => {
    const errorMessage = new Error("Database Error");
    productModel.find.mockRejectedValue(errorMessage);

    await productFiltersController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error WHile Filtering Products",
      error: errorMessage,
    });
  });

  it("should return an error if category filter is invalid", async () => {
    req.body.checked = null;
    await productFiltersController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error WHile Filtering Products",
      error: expect.any(Error),
    });
  });
});

describe("productCountController test", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    productModel.find.mockReset();
    productModel.estimatedDocumentCount.mockReset();
  });

  it("should return the total product count successfully", async () => {
    const mockCount = 100;
    productModel.estimatedDocumentCount.mockResolvedValue(mockCount);

    await productCountController(req, res);

    expect(productModel.estimatedDocumentCount).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      total: mockCount,
    });
  });

  it("should handle errors and return a failure response", async () => {
    const errorMessage = new Error("Database Error");
    productModel.estimatedDocumentCount.mockRejectedValue(errorMessage);

    await productCountController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Error in product count",
      error: errorMessage,
      success: false,
    });
  });
});

describe("productListController test", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should return a paginated list of products", async () => {
    const mockProducts = [
      { name: "Product 1", price: 10 },
      { name: "Product 2", price: 20 },
      { name: "Product 3", price: 30 },
      { name: "Product 4", price: 40 },
      { name: "Product 5", price: 50 },
      { name: "Product 6", price: 60 },
    ];

    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    });

    req.params.page = 1;

    await productListController(req, res);

    expect(productModel.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });
  });

  it("should handle errors and return a failure message", async () => {
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockRejectedValue(new Error("Database error")),
    });

    req.params.page = 1;

    await productListController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "error in per page ctrl",
      error: expect.any(Error),
    });
  });
});

describe("searchProductController test", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should return a list of products when keyword matches name or description", async () => {
    const mockProducts = [
      { name: "Product 1", description: "Description of product 1" },
      { name: "Product 2", description: "Description of product 2" },
    ];

    productModel.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockProducts),
    });

    req.params.keyword = "product";

    await searchProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: "product", $options: "i" } },
        { description: { $regex: "product", $options: "i" } },
      ],
    });
    expect(res.json).toHaveBeenCalledWith(mockProducts);
  });

  it("should return an empty list when no products match the search keyword", async () => {
    const mockProducts = [];

    productModel.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockProducts),
    });

    req.params.keyword = "nonexistent";

    await searchProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: "nonexistent", $options: "i" } },
        { description: { $regex: "nonexistent", $options: "i" } },
      ],
    });
    expect(res.json).toHaveBeenCalledWith(mockProducts);
  });

  it("should handle errors and return a failure message", async () => {
    productModel.find.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error("Database error")),
    });

    req.params.keyword = "product";

    await searchProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error In Search Product API",
      error: expect.any(Error),
    });
  });
});

describe("relatedProductController test", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should return related products based on category and exclude the current product", async () => {
    const mockProducts = [
      { name: "Product 1", category: "Category1" },
      { name: "Product 2", category: "Category1" },
      { name: "Product 3", category: "Category1" },
    ];

    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockProducts),
    });

    const req = { params: { pid: "123", cid: "Category1" } }; // Simulate a request with pid and cid
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await relatedProductController(req, res);

    // Assertions
    expect(productModel.find).toHaveBeenCalledWith({
      category: "Category1",
      _id: { $ne: "123" },
    });
    expect(res.status).toHaveBeenCalledWith(200); // Check if status is 200 for success
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });
  });

  it("should return an empty list when no related products are found", async () => {
    const mockProducts = [];

    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockProducts),
    });

    req.params = { pid: "123", cid: "Category1" };

    await relatedProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      category: "Category1",
      _id: { $ne: "123" },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });
  });

  it("should handle errors and return a failure message", async () => {
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockRejectedValue(new Error("Database error")),
    });

    req.params = { pid: "123", cid: "Category1" };

    await relatedProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "error while geting related product",
      error: expect.any(Error),
    });
  });
});

describe("productCategoryController test", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should return products successfully when category matches", async () => {
    const mockCategory = {
      _id: "category1",
      slug: "electronics",
      name: "Electronics",
    };

    const mockProducts = [
      { name: "Product 1", category: mockCategory },
      { name: "Product 2", category: mockCategory },
    ];

    productModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockProducts),
    });

    req.params = { slug: "electronics" };

    await productCategoryController(req, res);

    expect(productModel.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
      category: mockCategory,
    });
  });

  it("should return 404 when no products match the category", async () => {
    productModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    });

    req.params = { slug: "nonexistent-category" };

    await productCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "No products found for this category",
    });
  });

  it("should handle errors and return status 400", async () => {
    const mockError = new Error("Database error");

    productModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockRejectedValue(mockError),
    });

    req.params = { slug: "electronics" };

    await productCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: mockError,
      message: "Error while getting products",
    });
  });
});
