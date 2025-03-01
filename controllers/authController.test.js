import { expect, jest } from "@jest/globals";
import JWT from "jsonwebtoken";
import { comparePassword, hashPassword } from "../helpers/authHelper";
import userModel from "../models/userModel";
import {
  forgotPasswordController,
  loginController,
  registerController,
  testController,
  updateProfileController,
} from "./authController";

jest.mock("../models/userModel.js");
jest.mock("../helpers/authHelper");
jest.mock("jsonwebtoken");

describe("Register Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phone: "12344000",
        address: "123 Street",
        answer: "Football",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("user model is not saved for missing name", async () => {
    req.body.name = null;
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
  });

  test("user model is not saved for missing email", async () => {
    req.body.email = null;
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
  });

  test("user model is not saved for invalid email", async () => {
    // specify mock functionality
    req.body.email = "invalid-email";
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid Email Format",
    });
  });

  test("user model is not saved for missing password", async () => {
    req.body.password = null;
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" });
  });

  test("user model is not saved for missing phone", async () => {
    req.body.phone = null;
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({ message: "Phone no is Required" });
  });

  test("user model is not saved for missing address", async () => {
    req.body.address = null;
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });
  });

  test("user model is not saved for missing answer", async () => {
    req.body.answer = null;
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({ message: "Answer is Required" });
  });

  test("user model is not saved for email that been registered", async () => {
    userModel.findOne = jest.fn().mockResolvedValue({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      phone: "12344000",
      address: "123 Street",
      answer: "Football",
    });
    userModel.prototype.save = jest.fn();

    await registerController(req, res);
    expect(userModel.prototype.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Already Register please login",
    });
  });

  test("should register new user if all fields are valid and email has not been registered", async () => {
    userModel.findOne = jest.fn().mockResolvedValue(null);
    const hashedPassword = "hashedPassword";
    hashPassword.mockResolvedValue(hashedPassword);
    userModel.prototype.save = jest.fn().mockResolvedValue({
      name: "John Doe",
      email: "john@example.com",
      password: hashedPassword,
      phone: "12344000",
      address: "123 Street",
      answer: "Football",
    });

    await registerController(req, res);
    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(userModel.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "User Register Successfully",
      user: {
        name: "John Doe",
        email: "john@example.com",
        password: hashedPassword,
        phone: "12344000",
        address: "123 Street",
        answer: "Football",
      },
    });
  });

  test("should throw an error if there was an error in saving the user model", async () => {
    userModel.findOne = jest.fn().mockResolvedValue(null);
    const hashedPassword = "hashedPassword";
    hashPassword.mockResolvedValue(hashedPassword);
    userModel.prototype.save = jest
      .fn()
      .mockRejectedValue(new Error("Error saving user model"));

    await registerController(req, res);
    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(userModel.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Errro in Registeration",
      error: new Error("Error saving user model"),
    });
  });
});

describe("Login Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global.console, "log");
    req = {
      body: {
        email: "john@example.com",
        password: "password123",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("login fails when email is missing", async () => {
    req.body.email = null;

    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  test("login fails when password is missing", async () => {
    req.body.password = null;

    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  test("login fails when email is not registered", async () => {
    userModel.findOne.mockResolvedValue(null);

    await loginController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Email is not registerd",
    });
  });

  test("login fails when password does not match", async () => {
    req.body.password = "wrongPassword";
    const mockUser = {
      email: "john@example.com",
      password: "hashedPassword",
    };
    userModel.findOne.mockResolvedValue(mockUser);
    comparePassword.mockResolvedValue(false);

    await loginController(req, res);
    expect(comparePassword).toHaveBeenCalledWith(
      req.body.password,
      mockUser.password
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid Password",
    });
  });

  test("login fails when JWT token is not issued", async () => {
    const mockUser = {
      email: "john@example.com",
      password: "hashedPassword",
    };
    userModel.findOne.mockResolvedValue(mockUser);
    comparePassword.mockResolvedValue(true);
    const error = new Error("JWT Token failed to issue.");
    JWT.sign.mockRejectedValue(error);

    await loginController(req, res);

    expect(console.log).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in login",
      error,
    });
  });

  test("login successful when email and password are valid", async () => {
    const mockUser = {
      _id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "12344000",
      password: "hashedPassword",
      address: "123 Street",
      role: 0,
    };
    userModel.findOne.mockResolvedValue(mockUser);
    comparePassword.mockResolvedValue(true);
    const token = "JWT Token";
    JWT.sign.mockResolvedValue(token);

    await loginController(req, res);

    expect(JWT.sign).toHaveBeenCalledWith(
      { _id: mockUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "login successfully",
      user: {
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        address: mockUser.address,
        role: mockUser.role,
      },
      token,
    });
  });
});

describe("Forgot Password Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global.console, "log");
    req = {
      body: {
        email: "john@example.com",
        answer: "football",
        newPassword: "newPassword123",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("forgot password fails when email is missing", async () => {
    req.body.email = null;

    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Emai is required",
    });
  });

  test("forgot password fails when answer is missing", async () => {
    req.body.answer = null;

    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "answer is required",
    });
  });

  test("forgot password fails when newPassword is missing", async () => {
    req.body.newPassword = null;

    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "New Password is required",
    });
  });

  test("forgot password fails when user with email and password is not found", async () => {
    req.body.email = "wrongEmail@example.com";
    req.body.answer = "wrongAnswer";
    userModel.findOne.mockResolvedValue(null);

    await forgotPasswordController(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Wrong Email Or Answer",
    });
  });

  test("forgot password fails when password hash fails", async () => {
    const mockUser = {
      _id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "12344000",
      password: "hashedPassword",
      address: "123 Street",
      role: 0,
    };
    userModel.findOne.mockResolvedValue(mockUser);
    const error = new Error("Failed to hash password");
    hashPassword.mockRejectedValue(error);

    await forgotPasswordController(req, res);
    expect(hashPassword).toHaveBeenCalledWith(req.body.newPassword);
    expect(console.log).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Something went wrong",
      error,
    });
  });

  test("forgot password fails when password reset fails to update user model", async () => {
    const mockUser = {
      _id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "12344000",
      password: "hashedPassword",
      address: "123 Street",
      role: 0,
    };
    userModel.findOne.mockResolvedValue(mockUser);
    const hashed = "hashedNewPassword";
    hashPassword.mockResolvedValue(hashed);
    const error = new Error("Failed to update user model");
    userModel.findByIdAndUpdate.mockRejectedValue(error);

    await forgotPasswordController(req, res);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, {
      password: hashed,
    });
    expect(console.log).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Something went wrong",
      error,
    });
  });

  test("forgot password successfully resets users password", async () => {
    const mockUser = {
      _id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "12344000",
      password: "hashedPassword",
      address: "123 Street",
      role: 0,
    };
    userModel.findOne.mockResolvedValue(mockUser);
    const hashed = "hashedNewPassword";
    hashPassword.mockResolvedValue(hashed);
    const newMockUser = {
      _id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "12344000",
      password: hashed,
      address: "123 Street",
      role: 0,
    };
    userModel.findByIdAndUpdate.mockResolvedValue(newMockUser);

    await forgotPasswordController(req, res);
    expect(hashPassword).toHaveBeenCalledWith(req.body.newPassword);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, {
      password: hashed,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Password Reset Successfully",
    });
  });
});

describe("Test Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    console.log.mockRestore();
    jest.spyOn(global.console, "log");
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("should send protected routes", async () => {
    testController(req, res);
    expect(res.send).toHaveBeenCalledWith("Protected Routes");
  });

  test("should not send protected routes and log error", async () => {
    const error = new Error("Error sending protected routes");
    res.send.mockImplementationOnce(() => {
      throw error;
    });

    testController(req, res);
    expect(console.log).toHaveBeenCalledWith(error);
    expect(res.send).toHaveBeenCalledWith({ error });
  });
});

describe("Update Profile Controller Test", () => {
  let req, res;

  let mockUser = {
    _id: "1",
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    phone: "12344000",
    address: "123 Street",
    answer: "Football",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console.log.mockRestore();
    jest.spyOn(global.console, "log");
    req = {
      user: mockUser,
      body: {
        name: "Updated John",
        email: "updatedjohn@example.com",
        password: "updatedPassword123",
        phone: "92344000",
        address: "Updated 456 Street",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("update profile fails when user id does not exists", async () => {
    req.user._id = null;
    const error = new Error("Unable to find user");
    userModel.findById.mockRejectedValue(error);

    await updateProfileController(req, res);
    expect(userModel.findById).toHaveBeenCalledWith(req.user._id);
    expect(console.log).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  });

  test("update profile fails when password length < 6", async () => {
    req.body.password = "12345";
    userModel.findById.mockResolvedValue(mockUser);

    await updateProfileController(req, res);
    expect(userModel.findById).toHaveBeenCalledWith(req.user._id);
    expect(res.json).toHaveBeenCalledWith({
      error: "Passsword is required and 6 character long",
    });
  });

  test("update profile fails when hashPassword fails", async () => {
    userModel.findById.mockResolvedValue(mockUser);
    const error = new Error("Hashing password failed");
    hashPassword.mockRejectedValue(error);

    await updateProfileController(req, res);
    expect(userModel.findById).toHaveBeenCalledWith(req.user._id);
    expect(hashPassword).toHaveBeenCalledWith(req.body.password);
    expect(console.log).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  });

  test("update profile fails when findByIdAndUpdate fails", async () => {
    userModel.findById.mockResolvedValue(mockUser);
    const hashedPassword = "hashedPassword";
    hashPassword.mockResolvedValue(hashedPassword);
    const error = new Error("Update user profile failed");
    userModel.findByIdAndUpdate.mockRejectedValue(error);

    await updateProfileController(req, res);
    expect(userModel.findById).toHaveBeenCalledWith(req.user._id);
    expect(hashPassword).toHaveBeenCalledWith(req.body.password);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.user._id,
      {
        name: req.body.name || mockUser.name,
        password: hashedPassword || mockUser.password,
        phone: req.body.phone || mockUser.phone,
        address: req.body.address || mockUser.address,
      },
      { new: true }
    );
    expect(console.log).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  });

  test("update profile successful", async () => {
    userModel.findById.mockResolvedValue(mockUser);
    const hashedPassword = "hashedPassword";
    hashPassword.mockResolvedValue(hashedPassword);
    userModel.findByIdAndUpdate.mockResolvedValue({
      name: req.body.name || mockUser.name,
      password: hashedPassword || mockUser.password,
      phone: req.body.phone || mockUser.phone,
      address: req.body.address || mockUser.address,
    });

    await updateProfileController(req, res);
    expect(userModel.findById).toHaveBeenCalledWith(req.user._id);
    expect(hashPassword).toHaveBeenCalledWith(req.body.password);
    const updatedUser = {
      name: req.body.name || mockUser.name,
      password: hashedPassword || mockUser.password,
      phone: req.body.phone || mockUser.phone,
      address: req.body.address || mockUser.address,
    };
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      req.user._id,
      updatedUser,
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser,
    });
  });
});
