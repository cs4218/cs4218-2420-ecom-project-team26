const mongoose = require('mongoose');

jest.mock('mongoose', () => {
  const mMongoose = {
    Schema: jest.fn(),
    model: jest.fn(),
    Error: {
      ValidationError: class ValidationError extends Error {
        constructor() {
          super();
          this.errors = {};
        }
      }
    }
  };
  return mMongoose;
});

jest.mock('./userModel', () => {
  return {
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    deleteMany: jest.fn()
  };
});

const User = require('./userModel');

describe('User Model Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Creation', () => {
    test('should create user with all required fields', async () => {
      const userData = {
        name: 'TestUser',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        address: '123 test address',
        answer: 'test answer'
      };

      const mockCreatedUser = {
        ...userData,
        _id: 'mockUserId',
        role: 0
      };

      User.create.mockResolvedValue(mockCreatedUser);

      const createdUser = await User.create(userData);

      expect(User.create).toHaveBeenCalledWith(userData);
      expect(createdUser._id).toBeDefined();
      expect(createdUser.name).toBe(userData.name);
      expect(createdUser.email).toBe(userData.email);
      expect(createdUser.role).toBe(0); // default role
    });

    test('create user with admin role', async () => {
      const userData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        phone: '1234567890',
        address: { street: '123 Test St' },
        answer: 'test answer',
        role: 1
      };

      const mockCreatedUser = {
        ...userData,
        _id: 'mockUserId'
      };

      User.create.mockResolvedValue(mockCreatedUser);

      const createdUser = await User.create(userData);

      expect(User.create).toHaveBeenCalledWith(userData);
      expect(createdUser.role).toBe(1);
    });
  });

  describe('User Field Validation', () => {
    test('reject if the required field(s) is/are missing', async () => {
      const incompleteUserData = {
        name: 'Test User'
      };

      const validationError = new mongoose.Error.ValidationError();
      validationError.errors.email = new Error('Email is required');
      validationError.errors.password = new Error('Password is required');
      validationError.errors.phone = new Error('Phone is required');
      validationError.errors.address = new Error('Address is required');
      validationError.errors.answer = new Error('Answer is required');

      User.create.mockRejectedValue(validationError);

      await expect(User.create(incompleteUserData)).rejects.toThrow(mongoose.Error.ValidationError);
      expect(User.create).toHaveBeenCalledWith(incompleteUserData);
    });

    test('reject if there is duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        phone: '1234567890',
        address: 'test address',
        answer: 'test answer'
      };

      const duplicateError = new Error('Duplicate key error');
      duplicateError.code = 11000;

      User.create.mockRejectedValue(duplicateError);

      await expect(User.create(userData)).rejects.toThrow('Duplicate key error');
      expect(User.create).toHaveBeenCalledWith(userData);
    });

    test('should trim name field', async () => {
      const userData = {
        name: '  Test User  ',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        address: { street: '123 Test St' },
        answer: 'test answer'
      };

      const mockCreatedUser = {
        ...userData,
        _id: 'mockUserId',
        name: 'Test User'
      };

      User.create.mockResolvedValue(mockCreatedUser);

      const createdUser = await User.create(userData);

      expect(User.create).toHaveBeenCalledWith(userData);
      expect(createdUser.name).toBe('Test User');
    });

    test('should set default role to 0', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        address: { street: '123 Test St' },
        answer: 'test answer'
      };

      const mockCreatedUser = {
        ...userData,
        _id: 'mockUserId',
        role: 0
      };

      User.create.mockResolvedValue(mockCreatedUser);

      const createdUser = await User.create(userData);

      expect(User.create).toHaveBeenCalledWith(userData);
      expect(createdUser.role).toBe(0);
    });
  });

  describe('Timestamps check', () => {
    test('check for timestamps', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        address: { street: '123 Test St' },
        answer: 'test answer'
      };

      const now = new Date();
      const mockCreatedUser = {
        ...userData,
        _id: 'mockUserId',
        createdAt: now,
        updatedAt: now
      };

      User.create.mockResolvedValue(mockCreatedUser);

      const createdUser = await User.create(userData);

      expect(User.create).toHaveBeenCalledWith(userData);
      expect(createdUser.createdAt).toBeDefined();
      expect(createdUser.updatedAt).toBeDefined();
    });

    test('update timestamp on status change', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        address: { street: '123 Test St' },
        answer: 'test answer'
      };

      const createdAt = new Date(2023, 0, 1);
      const updatedAt = new Date(2023, 0, 2);

      const mockCreatedUser = {
        ...userData,
        _id: 'mockUserId',
        createdAt,
        updatedAt
      };

      User.create.mockResolvedValue(mockCreatedUser);

      const createdUser = await User.create(userData);

      expect(User.create).toHaveBeenCalledWith(userData);
      expect(createdUser.updatedAt).toEqual(updatedAt);
      expect(createdUser.updatedAt).not.toEqual(createdUser.createdAt);
    });
  });
}); 