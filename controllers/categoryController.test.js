import { describe, expect, it, jest } from "@jest/globals";
import categoryModel from "../models/categoryModel";
import {
  createCategoryController,
  updateCategoryController,
  categoryControlller,
  singleCategoryController,
  deleteCategoryCOntroller,
} from "./categoryController";
const slugify = require("slugify");

jest.mock("slugify");
jest.mock("../models/categoryModel");

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
