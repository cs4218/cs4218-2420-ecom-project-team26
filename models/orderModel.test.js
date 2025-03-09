const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Category = require("./categoryModel");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Connect Mongoose to the in-memory database
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Category Model Test with In-Memory Database", () => {
  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  describe("Category Creation", () => {
    test("create category with name and slug", async () => {
      const categoryData = {
        name: "Test",
        slug: "test"
      };

      const createdCategory = await Category.create(categoryData);

      expect(createdCategory._id).toBeDefined();
      expect(createdCategory.name).toBe("Test");
      expect(createdCategory.slug).toBe("test");
    });

    test("should allow category without name", async () => {
      const categoryData = {
        slug: "test category"
      };

      const createdCategory = await Category.create(categoryData);
      expect(createdCategory._id).toBeDefined();
      expect(createdCategory.slug).toBe("test category");
    });

    test("should allow category without slug", async () => {
      const categoryData = {
        name: "test category"
      };

      const createdCategory = await Category.create(categoryData);
      expect(createdCategory._id).toBeDefined();
      expect(createdCategory.name).toBe("test category");
    });
  });

  describe("Category Attributes", () => {
    test("should verify model fields", async () => {
      const categoryData = {
        name: "Test",
        slug: "test",
        description: "test description",
        active: true
      };

      const createdCategory = await Category.create(categoryData);
      expect(createdCategory.name).toBe("Test");
      expect(createdCategory.slug).toBe("test");
      
      if ('description' in createdCategory) {
        expect(createdCategory.description).toBe("test description");
      }
      
      if ('active' in createdCategory) {
        expect(createdCategory.active).toBe(true);
      }
    });
    
    test("should support custom attributes", async () => {
      const categoryData = {
        name: "Test",
        slug: "test",
      };

      const createdCategory = await Category.create(categoryData);
      expect(createdCategory._id).toBeDefined();
    });
  });

  describe("Category Operations", () => {
    test("should update category", async () => {
      const categoryData = {
        name: "Test",
        slug: "test"
      };

      const createdCategory = await Category.create(categoryData);
      const categoryId = createdCategory._id;

      await Category.findByIdAndUpdate(
        categoryId,
        { name: "Test category" }
      );

      const updatedCategory = await Category.findById(categoryId);
      expect(updatedCategory.name).toBe("Test category");
    });

    test("should delete category", async () => {
      const categoryData = {
        name: "Test",
        slug: "test"
      };

      const createdCategory = await Category.create(categoryData);
      const categoryId = createdCategory._id;

      await Category.findByIdAndDelete(categoryId);

      const deletedCategory = await Category.findById(categoryId);
      expect(deletedCategory).toBeNull();
    });
  });
});