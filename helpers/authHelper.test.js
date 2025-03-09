import bcrypt from "bcrypt";
import { comparePassword, hashPassword } from "./authHelper";

jest.mock("bcrypt");

describe("hashPassword helper component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global.console, "log").mockImplementation(() => {});
  });

  afterAll(() => {
    global.console.log.mockRestore();
  });

  it("should hash password successfully", async () => {
    const password = "password123";
    const hashedPassword = "hashedpassword123";
    bcrypt.hash.mockResolvedValue(hashedPassword);

    const result = await hashPassword(password);

    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(result).toBe(hashedPassword);
  });

  it("should catch error during hashing if unsucessful", async () => {
    const password = "password123";
    bcrypt.hash.mockRejectedValue(new Error("Hash Error"));

    const result = await hashPassword(password);

    expect(console.log).toHaveBeenCalledWith(new Error("Hash Error"));
    expect(result).toBeUndefined();
  });
});

describe("comparePassword helper component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global.console, "log").mockImplementation(() => {});
  });

  afterAll(() => {
    global.console.log.mockRestore();
  });

  it("should return true if passwords match", async () => {
    const password = "password123";
    const hashedPassword = "hashedpassword123";
    bcrypt.compare.mockResolvedValue(true);

    const result = await comparePassword(password, hashedPassword);

    expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    expect(result).toBe(true);
  });

  it("should return false if passwords don't match", async () => {
    const password = "password123";
    const hashedPassword = "fakehashedpassword123";
    bcrypt.compare.mockResolvedValue(false);

    const result = await comparePassword(password, hashedPassword);

    expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    expect(result).toBe(false);
  });
});
