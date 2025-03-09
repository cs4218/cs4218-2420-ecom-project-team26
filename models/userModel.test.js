const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./userModel');

let mongoServer;
let userData;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  await User.init();
  
  userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    phone: '1234567890',
    address: '123 test address',
    answer: 'test answer'
  };
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('User Model Test', () => {
  describe('User Creation', () => {
    test('should create user with all required fields', async () => {
      const createdUser = await User.create(userData);

      expect(createdUser._id).toBeDefined();
      expect(createdUser.name).toBe(userData.name);
      expect(createdUser.email).toBe(userData.email);
      expect(createdUser.role).toBe(0); // default role
    });

    test('create user with admin role', async () => {
      const adminUserData = {
        ...userData,
        email: 'admin@example.com',
        role: 1
      };

      const createdUser = await User.create(adminUserData);

      expect(createdUser.role).toBe(1);
    });
  });

  describe('User Field Validation', () => {
    test('reject if the required field(s) is/are missing', async () => {
      const incompleteUserData = {
        name: userData.name
      };

      await expect(User.create(incompleteUserData)).rejects.toThrow(mongoose.Error.ValidationError);
    });

    test('reject if there is duplicate email', async () => {
      await User.create(userData);

      const duplicateEmailUser = {
        ...userData,
        name: 'Another User'
      };

      try {
        await User.create(duplicateEmailUser);
        expect(true).toBe(false); // Force fail
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.code === 11000 || error.name === 'MongoServerError').toBeTruthy();
      }
    });

    test('should trim name field', async () => {
      const trimUserData = {
        ...userData,
        email: 'trim@example.com',
        name: '  Test User  '
      };

      const createdUser = await User.create(trimUserData);

      expect(createdUser.name).toBe('Test User');
    });

    test('should set default role to 0', async () => {
      const defaultRoleUser = {
        ...userData,
        email: 'default@example.com'
      };

      const createdUser = await User.create(defaultRoleUser);

      expect(createdUser.role).toBe(0);
    });
  });

  describe('Timestamps check', () => {
    test('check for timestamps', async () => {
      const timestampUser = {
        ...userData,
        email: 'timestamp@example.com'
      };

      const createdUser = await User.create(timestampUser);

      expect(createdUser.createdAt).toBeDefined();
      expect(createdUser.updatedAt).toBeDefined();
    });

    test('update timestamp on status change', async () => {
      const updateUser = {
        ...userData,
        email: 'update@example.com'
      };

      const createdUser = await User.create(updateUser);
      const originalUpdatedAt = createdUser.updatedAt;
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      createdUser.name = 'Updated Name';
      await createdUser.save();
      
      expect(createdUser.updatedAt).not.toEqual(originalUpdatedAt);
    });
  });
});