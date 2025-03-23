const {
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
  categoryController,
  singleCategoryController,
} = require("./categoryController");
const categoryModel = require("../models/categoryModel");
const slugify = require("slugify");

// Mock the categoryModel and its methods
jest.mock("../models/categoryModel");

// Mock the response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("Category Controller Tests", () => {
  let req;
  let res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    res = mockResponse();
  });

  describe("createCategoryController", () => {
    test("should create a new category successfully", async () => {
      // Arrange
      req = {
        body: {
          name: "Test Category",
        },
      };

      // Mock the findOne method to return null (category doesn't exist)
      categoryModel.findOne.mockResolvedValue(null);

      // Mock the save method
      const mockSave = jest.fn().mockResolvedValue({
        name: "Test Category",
        slug: "test-category",
      });

      // Mock the constructor to return an object with a save method
      categoryModel.mockImplementation(() => ({
        save: mockSave,
      }));

      // Act
      await createCategoryController(req, res);

      // Assert
      expect(categoryModel.findOne).toHaveBeenCalledWith({
        name: "Test Category",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "new category created",
        category: {
          name: "Test Category",
          slug: "test-category",
        },
      });
    });

    test("should return error if name is not provided", async () => {
      // Arrange
      req = {
        body: {},
      };

      // Act
      await createCategoryController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        message: "Name is required",
      });
    });

    test("should return message if category already exists", async () => {
      // Arrange
      req = {
        body: {
          name: "Existing Category",
        },
      };

      // Mock the findOne method to return an existing category
      categoryModel.findOne.mockResolvedValue({
        name: "Existing Category",
        slug: "existing-category",
      });

      // Act
      await createCategoryController(req, res);

      // Assert
      expect(categoryModel.findOne).toHaveBeenCalledWith({
        name: "Existing Category",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Category Already Exisits",
      });
    });

    test("should handle errors", async () => {
      // Arrange
      req = {
        body: {
          name: "Test Category",
        },
      };

      // Mock the findOne method to throw an error
      const error = new Error("Database error");
      categoryModel.findOne.mockRejectedValue(error);

      // Mock console.log to prevent actual logging during tests
      console.log = jest.fn();

      // Act
      await createCategoryController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);

      // Use expect.any(Error) to match any Error object
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: expect.any(Error),
        message: "Error in Category",
      });
    });
  });

  describe("updateCategoryController", () => {
    test("should update a category successfully", async () => {
      // Arrange
      req = {
        body: {
          name: "Updated Category",
        },
        params: {
          id: "123",
        },
      };

      // Mock the findByIdAndUpdate method
      categoryModel.findByIdAndUpdate.mockResolvedValue({
        name: "Updated Category",
        slug: "Updated-Category",
      });

      // Act
      await updateCategoryController(req, res);

      // Assert
      expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "123",
        { name: "Updated Category", slug: "Updated-Category" },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        messsage: "Category Updated Successfully",
        category: {
          name: "Updated Category",
          slug: "Updated-Category",
        },
      });
    });

    test("should handle errors during update", async () => {
      // Arrange
      req = {
        body: {
          name: "Updated Category",
        },
        params: {
          id: "123",
        },
      };

      // Mock the findByIdAndUpdate method to throw an error
      const error = new Error("Update error");
      categoryModel.findByIdAndUpdate.mockRejectedValue(error);

      // Mock console.log to prevent actual logging during tests
      console.log = jest.fn();

      // Act
      await updateCategoryController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: error,
        message: "Error while updating category",
      });
    });
  });

  describe("deleteCategoryController", () => {
    test("should delete a category successfully", async () => {
      // Arrange
      req = {
        params: {
          id: "123",
        },
      };

      // Mock the findByIdAndDelete method
      categoryModel.findByIdAndDelete.mockResolvedValue({});

      // Act
      await deleteCategoryController(req, res);

      // Assert
      expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Category Deleted Successfully",
      });
    });

    test("should handle errors during deletion", async () => {
      // Arrange
      req = {
        params: {
          id: "123",
        },
      };

      // Mock the findByIdAndDelete method to throw an error
      const error = new Error("Deletion error");
      categoryModel.findByIdAndDelete.mockRejectedValue(error);

      // Mock console.log to prevent actual logging during tests
      console.log = jest.fn();

      // Act
      await deleteCategoryController(req, res);

      // Assert
      expect(console.log).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "error while deleting category",
        error: error,
      });
    });
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

    await categoryController(req, res);

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

    await categoryController(req, res);

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
