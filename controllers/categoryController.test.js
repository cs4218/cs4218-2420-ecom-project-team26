import { describe, expect, it, jest } from "@jest/globals";
import categoryModel from "../models/categoryModel";
import {
  createCategoryController,
  updateCategoryController,
  categoryControlller,
  singleCategoryController,
  deleteCategoryCOntroller,
} from "./categoryController";
import { resolveSoa } from "dns";
const slugify = require("slugify");

jest.mock("slugify");
jest.mock("../models/categoryModel");

describe("createCategoryController test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {
        name: "test category",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    slugify.mockReturnValue("test-category");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create category successfully if name supplied", async () => {
    categoryModel.prototype.save = jest
      .fn()
      .mockResolvedValue("created category");

    await createCategoryController(req, res);

    expect(categoryModel.prototype.save).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "new category created",
      category: "created category",
    });
  });

  it("should return error 401 if name missing", async () => {
    req.body = { name: "" };

    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      message: "Name is required",
    });
  });

  it("should return 200 status if category already exists", async () => {
    categoryModel.findOne.mockResolvedValue({ name: "test category" });

    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Category Already Exisits",
    });
  });

  it("should return error 500 if error occurs during creation", async () => {
    categoryModel.findOne.mockRejectedValue(new Error("DB Error"));

    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error in Category",
    });
  });
});

describe("updateCategoryController test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: { name: "category" },
      params: { id: "123" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    slugify.mockReturnValue("updated-category");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully update a category", async () => {
    const updatedCategory = {
      _id: "123",
      name: "updated category",
      slug: "updated-category",
    };

    req.body = { name: "updated category" };
    req.params = { id: "123" };

    categoryModel.findByIdAndUpdate.mockResolvedValue(updatedCategory);

    await updateCategoryController(req, res);

    expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "123",
      { name: "updated category", slug: "updated-category" },
      { new: true }
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      messsage: "Category Updated Successfully",
      category: updatedCategory,
    });
  });

  it("should return 500 if an error occurs", async () => {
    categoryModel.findByIdAndUpdate.mockRejectedValue(
      new Error("Database error")
    );

    await updateCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Error while updating category",
      })
    );
  });
});

describe("categoryController test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should retrieve all categories successfully", async () => {
    const mockCategories = [
      { _id: "1", name: "Books", slug: "books" },
      { _id: "2", name: "Electronics", slug: "electronics" },
    ];

    categoryModel.find.mockResolvedValue(mockCategories);

    await categoryControlller(req, res);

    expect(categoryModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "All Categories List",
      category: mockCategories,
    });
  });

  it("should return 500 if an error occurs", async () => {
    categoryModel.find.mockRejectedValue(new Error("Database error"));

    await categoryControlller(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Error while getting all categories",
      })
    );
  });
});

describe("singleCategoryController test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { slug: "books" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should retrieve a single category successfully", async () => {
    const mockCategory = [{ _id: "1", name: "Books", slug: "books" }];

    categoryModel.findOne.mockResolvedValue(mockCategory);

    await singleCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: "books" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Get SIngle Category SUccessfully",
      category: mockCategory,
    });
  });

  it("should return 500 if an error occurs", async () => {
    categoryModel.findOne.mockRejectedValue(new Error("Database error"));

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Error While getting Single Category",
      })
    );
  });
});

describe("deleteCategoryController test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = { params: { id: "123" } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should delete category successfully if given valid id", async () => {
    categoryModel.findByIdAndDelete.mockResolvedValue("deleted succesfully");

    await deleteCategoryCOntroller(req, res);

    expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Categry Deleted Successfully",
    });
  });

  it("should return error 500 if error occurs during deletion", async () => {
    categoryModel.findByIdAndDelete.mockRejectedValue(new Error("DB Error"));

    await deleteCategoryCOntroller(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "error while deleting category",
      error: expect.any(Error),
    });
  });
});
