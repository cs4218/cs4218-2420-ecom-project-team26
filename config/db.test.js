// First, we need to mock String.prototype before requiring any modules
// This ensures the string color methods are available when db.js is loaded
String.prototype.bgMagenta = function () {
  return this;
};
String.prototype.bgRed = function () {
  return this;
};
String.prototype.white = function () {
  return this;
};

// Now we can safely require our modules
const mongoose = require("mongoose");
const connectDB = require("./db");

// Mock mongoose
jest.mock("mongoose", () => {
  const connectSpy = jest.fn();
  return {
    connect: connectSpy,
  };
});

describe("Database Connection Tests", () => {
  // Save original console.log
  const originalConsoleLog = console.log;

  beforeEach(() => {
    // Mock console.log
    console.log = jest.fn();

    // Clear mongoose connect mock
    mongoose.connect.mockClear();

    // Set up process.env.MONGO_URL for testing
    process.env.MONGO_URL = "mongodb://localhost:27017/test-db";
  });

  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
  });

  test("should connect to MongoDB successfully", async () => {
    // Arrange
    const mockConnection = {
      connection: {
        host: "localhost:27017",
      },
    };

    // Mock successful connection
    mongoose.connect.mockResolvedValue(mockConnection);

    // Act
    await connectDB();

    // Assert
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
    expect(console.log).toHaveBeenCalled();

    // Get all log calls
    const logMessages = console.log.mock.calls.map((call) => call[0]);
    expect(
      logMessages.some(
        (msg) =>
          msg.includes("Connected To Mongodb Database") &&
          msg.includes("localhost:27017")
      )
    ).toBe(true);
  });

  test("should handle connection errors", async () => {
    // Arrange
    const mockError = new Error("Connection failed");

    // Mock failed connection
    mongoose.connect.mockRejectedValue(mockError);

    // Act
    await connectDB();

    // Assert
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
    expect(console.log).toHaveBeenCalled();

    // Get all log calls
    const logMessages = console.log.mock.calls.map((call) => call[0]);
    expect(
      logMessages.some(
        (msg) =>
          msg.includes("Error in Mongodb") && msg.includes("Connection failed")
      )
    ).toBe(true);
  });

  test("should use the MONGO_URL from environment variables", async () => {
    // Arrange
    const customMongoUrl = "mongodb://custom-server:27017/custom-db";
    process.env.MONGO_URL = customMongoUrl;

    const mockConnection = {
      connection: {
        host: "custom-server:27017",
      },
    };

    // Mock successful connection
    mongoose.connect.mockResolvedValue(mockConnection);

    // Act
    await connectDB();

    // Assert
    expect(mongoose.connect).toHaveBeenCalledWith(customMongoUrl);
    expect(console.log).toHaveBeenCalled();

    // Get all log calls
    const logMessages = console.log.mock.calls.map((call) => call[0]);
    expect(
      logMessages.some(
        (msg) =>
          msg.includes("Connected To Mongodb Database") &&
          msg.includes("custom-server:27017")
      )
    ).toBe(true);
  });

  test("should handle missing MONGO_URL environment variable", async () => {
    // Arrange
    delete process.env.MONGO_URL;

    // Mock connection error
    mongoose.connect.mockRejectedValue(new Error("Invalid connection string"));

    // Act
    await connectDB();

    // Assert
    expect(mongoose.connect).toHaveBeenCalledWith(undefined);
    expect(console.log).toHaveBeenCalled();

    // Get all log calls
    const logMessages = console.log.mock.calls.map((call) => call[0]);
    expect(logMessages.some((msg) => msg.includes("Error in Mongodb"))).toBe(
      true
    );
  });
});
