const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Category = require("./categoryModel");

let mongoServer;

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

describe("categoryModel test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a category successfully", async () => {
    const categoryData = {
      name: "Test Category",
      slug: "test-category",
    };

    const category = new Category(categoryData);
    const savedCategory = await category.save();

    expect(savedCategory._id).toBeDefined();
    expect(savedCategory.name).toBe("Test Category");
    expect(savedCategory.slug).toBe("test-category");
  });

  it("should fail when name is missing", async () => {
    const categoryData = {
      slug: "test-category",
    };

    try {
      const category = new Category(categoryData);
      await category.save();
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
    }
  });

  it("should fail when slug is missing", async () => {
    const categoryData = {
      name: "Test Category",
    };

    try {
      const category = new Category(categoryData);
      await category.save();
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.slug).toBeDefined();
    }
  });

  it("should create a category with a lowercase slug", async () => {
    const categoryData = {
      name: "Test Category",
      slug: "TEST-CATEGORY",
    };

    const category = new Category(categoryData);
    const savedCategory = await category.save();

    expect(savedCategory.slug).toBe("test-category");
  });
});
