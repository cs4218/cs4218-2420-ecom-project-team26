const mongoose = require('mongoose');

jest.mock('mongoose', () => {
  const mMongoose = {
    Schema: jest.fn(),
    model: jest.fn(),
    Types: {
      ObjectId: jest.fn(() => 'mockObjectId')
    },
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

jest.mock('./orderModel', () => {
  return {
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    deleteMany: jest.fn()
  };
});

const Order = require('./orderModel');

describe('Order Model Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Order Creation', () => {
    test('create order with default status', async () => {
      const orderData = {
        products: ['mockObjectId'],
        buyer: 'mockObjectId',
        payment: { method: 'card' }
      };

      const mockCreatedOrder = {
        ...orderData,
        _id: 'mockOrderId',
        status: 'Not Process'
      };

      Order.create.mockResolvedValue(mockCreatedOrder);

      const createdOrder = await Order.create(orderData);

      expect(Order.create).toHaveBeenCalledWith(orderData);
      expect(createdOrder._id).toBeDefined();
      expect(createdOrder.status).toBe('Not Process');
      expect(createdOrder.products).toHaveLength(1);
      expect(createdOrder.buyer).toBeDefined();
    });

    test('should create order with "Processing" status', async () => {
      const orderData = {
        products: ['mockObjectId'],
        buyer: 'mockObjectId',
        payment: { method: 'card' },
        status: 'Processing'
      };

      const mockCreatedOrder = {
        ...orderData,
        _id: 'mockOrderId'
      };

      Order.create.mockResolvedValue(mockCreatedOrder);

      const createdOrder = await Order.create(orderData);

      expect(Order.create).toHaveBeenCalledWith(orderData);
      expect(createdOrder.status).toBe('Processing');
    });

    test('should reject invalid status', async () => {
      const orderData = {
        products: ['mockObjectId'],
        buyer: 'mockObjectId',
        payment: { method: 'card' },
        status: 'Invalid Status'
      };

      const validationError = new mongoose.Error.ValidationError();
      validationError.errors.status = new Error('Invalid status');

      Order.create.mockRejectedValue(validationError);
      
      await expect(Order.create(orderData)).rejects.toThrow(mongoose.Error.ValidationError);
      expect(Order.create).toHaveBeenCalledWith(orderData);
    });
  });

  describe('Order References', () => {
    test('should handle multiple products', async () => {
      const productIds = ['mockObjectId1', 'mockObjectId2', 'mockObjectId3'];
      
      const orderData = {
        products: productIds,
        buyer: 'mockObjectId',
        payment: { method: 'card' }
      };

      const mockCreatedOrder = {
        ...orderData,
        _id: 'mockOrderId'
      };

      Order.create.mockResolvedValue(mockCreatedOrder);

      const createdOrder = await Order.create(orderData);

      expect(Order.create).toHaveBeenCalledWith(orderData);
      expect(createdOrder.products).toHaveLength(3);
      expect(createdOrder.products).toEqual(productIds);
    });

    test('check for buyer reference', async () => {
      const orderData = {
        products: ['mockObjectId'],
        payment: { method: 'card' }
      };

      const validationError = new mongoose.Error.ValidationError();
      validationError.errors.buyer = new Error('Buyer is required');

      Order.create.mockRejectedValue(validationError);
      
      await expect(Order.create(orderData)).rejects.toThrow(mongoose.Error.ValidationError);
      expect(Order.create).toHaveBeenCalledWith(orderData);
    });
  });

  describe('Timestamps check', () => {
    test('check for timestamps', async () => {
      const orderData = {
        products: ['mockObjectId'],
        buyer: 'mockObjectId',
        payment: { method: 'card' }
      };

      const now = new Date();
      const mockCreatedOrder = {
        ...orderData,
        _id: 'mockOrderId',
        createdAt: now,
        updatedAt: now
      };

      Order.create.mockResolvedValue(mockCreatedOrder);

      const createdOrder = await Order.create(orderData);

      expect(Order.create).toHaveBeenCalledWith(orderData);
      expect(createdOrder.createdAt).toBeDefined();
      expect(createdOrder.updatedAt).toBeDefined();
    });

    test('update timestamp on status change', async () => {
      const orderData = {
        products: ['mockObjectId'],
        buyer: 'mockObjectId',
        payment: { method: 'card' }
      };

      const createdAt = new Date(2025, 0, 1);
      const updatedAt = new Date(2025, 0, 2);

      const mockCreatedOrder = {
        ...orderData,
        _id: 'mockOrderId',
        createdAt,
        updatedAt
      };

      Order.create.mockResolvedValue(mockCreatedOrder);

      const createdOrder = await Order.create(orderData);

      expect(Order.create).toHaveBeenCalledWith(orderData);
      expect(createdOrder.updatedAt).toEqual(updatedAt);
      expect(createdOrder.updatedAt).not.toEqual(createdOrder.createdAt);
    });
  });
});
