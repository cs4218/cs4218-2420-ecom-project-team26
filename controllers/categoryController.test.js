const {
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
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
      expect(console.log).toHaveBeenCalledWith(error);
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
      expect(console.log).toHaveBeenCalledWith(error);
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
