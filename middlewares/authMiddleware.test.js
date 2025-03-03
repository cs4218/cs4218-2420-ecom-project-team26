import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { isAdmin, requireSignIn } from "./authMiddleware.js";

jest.mock("jsonwebtoken");
jest.mock("../models/userModel.js");

describe("requireSignIn middleware component", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global.console, "log");
    req = { headers: { authorization: "" } };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    next = jest.fn();
  });

  it("should call next if valid token", async () => {
    JWT.verify.mockReturnValue({
      address: "123 Street",
      email: "test@example.com",
      name: "Admin",
      phone: "81234567",
      role: 0,
      _id: "1",
    });

    req.headers.authorization = "Bearer 123456789";

    await requireSignIn(req, res, next);

    expect(JWT.verify).toHaveBeenCalledWith(
      "Bearer 123456789",
      process.env.JWT_SECRET
    );
    expect(req.user).toEqual({
      address: "123 Street",
      email: "test@example.com",
      name: "Admin",
      phone: "81234567",
      role: 0,
      _id: "1",
    });
    expect(next).toHaveBeenCalled();
  });

  it("should throw error if invalid token - missing Bearer", async () => {
    JWT.verify.mockImplementation(() => {
      throw new Error("Invalid Token");
    });
    req.headers.authorization = "123456789";

    await requireSignIn(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(new Error("Invalid Token"));
  });

  it("should throw error if invalid token - missing Token", async () => {
    JWT.verify.mockImplementation(() => {
      throw new Error("Missing Token");
    });
    req.headers.authorization = "";

    await requireSignIn(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(new Error("Missing Token"));
  });
});

describe("isAdmin middleware component", () => {
  let req, res, next;

  const adminUser = {
    address: "123 Street",
    email: "test@example.com",
    name: "Admin",
    phone: "81234567",
    role: 1,
    _id: "1",
  };

  const nonAdminUser = {
    address: "456 Street",
    email: "test2@example.com",
    name: "Non Admin",
    phone: "91234567",
    role: 0,
    _id: "2",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global.console, "log");
    req = {
      headers: { authorization: "Bearer 123456789" },
      user: {},
    };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    next = jest.fn();
  });

  it("should call next for admin users", async () => {
    req.user = adminUser;
    userModel.findById.mockResolvedValue(adminUser);

    await isAdmin(req, res, next);

    expect(userModel.findById).toHaveBeenCalledWith("1");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should send error message for non-admin users", async () => {
    req.user = nonAdminUser;
    userModel.findById.mockResolvedValue(nonAdminUser);

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.status(401).send).toHaveBeenCalledWith({
      success: false,
      message: "UnAuthorized Access",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw error if user is null", async () => {
    req.user = null;
    userModel.findById.mockResolvedValue(null);
    const error = new TypeError(
      "Cannot read properties of null (reading '_id')"
    );

    await isAdmin(req, res, next);

    expect(console.log).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error,
      message: "Error in admin middleware",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
