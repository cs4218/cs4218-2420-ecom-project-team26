import React from 'react';
import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import AdminOrders from './AdminOrders';
import "@testing-library/jest-dom/extend-expect";

jest.mock('axios');

jest.mock('moment', () => {
  return (date) => ({
    fromNow: () => '2 days ago'
  });
});

jest.mock("../../components/Layout", () => ({children}) => <div>{children}</div>);

const mockAuth = {
  user: {
    name: 'CS 4218 Test Account',
    email: 'cs4218@test.com',
    phone: '81234567',
    role: 1
  },
  token: 'test-token'
};
let mockAuthValue = mockAuth;

jest.mock('../../context/auth', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => [mockAuthValue, jest.fn()]
}));

jest.mock('../../context/cart', () => ({
  useCart: () => [[], jest.fn()]
}));

jest.mock('../../hooks/useCategory', () => ({
  __esModule: true,
  default: () => ([])
}));

jest.mock('../../context/search', () => ({
  useSearch: () => [{}, jest.fn()]
}));

jest.mock("antd", () => {
  // Define Option component 
  const Option = ({ value, children }) => {
    return <option value={value}>{children}</option>;
  };
  
  // Return the mocked antd exports
  return {
    Modal: ({ children, visible, onCancel }) =>
      visible ? (
        <div data-testid="mock-modal" className="ant-modal">
          <button onClick={onCancel}>Cancel</button>
          <div className="ant-modal-content">{children}</div>
        </div>
      ) : null,
    Select: Object.assign(
      ({ children, onChange, value, placeholder }) => {
        // Create a unique test ID based on the placeholder
        const testId = `select-${placeholder?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;
        
        return (
          <div data-testid={testId}>
            <span data-testid={`${testId}-placeholder`}>{placeholder}</span>
            <select 
              onChange={(e) => onChange && onChange(e.target.value)}
              value={value}
              data-testid={`${testId}-dropdown`}
            >
              <option value="">Select an option</option>
              {Array.isArray(children) && children.map((child, index) => {
                if (!child) return null;
                return (
                  <option 
                    key={child.key || `option-${index}`} 
                    value={child.props?.value || child.key || ""}
                  >
                    {child.props?.children || ""}
                  </option>
                );
              })}
            </select>
          </div>
        );
      },
      { Option }
    )
  };
});

const mockOrders = [
  {
    _id: '67a21938cf4efddf1e5358d1',
    status: 'Not Process',
    buyer: {
      _id: '67a218decf4efddf1e5358ac',
      name: 'CS 4218 Test Account'
    },
    createdAt: '2025-02-04T13:42:16.741Z',
    payment: {
      errors: {
        validationErrors: {},
        errorCollections: {
          transaction: {
            validationErrors: {
              amount: [{
                attribute: 'amount',
                code: '81503',
                message: 'Amount is an invalid format.'
              }]
            },
            errorCollections: {
              creditCard: {
                validationErrors: {
                  number: [{
                    attribute: 'number',
                    code: '81717',
                    message: 'Credit card number is not an accepted test number.'
                  }]
                },
                errorCollections: {}
              }
            }
          }
        }
      },
      params: {
        transaction: {
          amount: '3004.9700000000003',
          paymentMethodNonce: 'tokencc_bh_c36kjx_t6mnd5_c2mzrt_7rdc6j_nb4',
          options: {
            submitForSettlement: 'true'
          },
          type: 'sale'
        }
      },
      message: 'Amount is an invalid format.\nCredit card number is not an accepted test number.',
      success: false
    },
    products: [
      {
        _id: '67a21772a6d9e00ef2ac022a',
        name: 'NUS T-shirt',
        description: 'Plain NUS T-shirt for sale',
        price: 4.99,
        category: '66db427fdb0119d9234b27ee',
        quantity: 200,
        shipping: true,
        createdAt: '2024-09-06T17:57:19.992Z',
        updatedAt: '2024-09-06T17:57:19.992Z',
        __v: 0
      },
      {
        _id: '66db427fdb0119d9234b27f3',
        name: 'Laptop',
        description: 'A powerful laptop',
        price: 1499.99,
        category: '66db427fdb0119d9234b27ed',
        quantity: 30,
        shipping: true,
        createdAt: '2024-09-06T17:57:19.971Z',
        updatedAt: '2024-09-06T17:57:19.971Z',
        __v: 0
      }
    ]
  }
];

describe('AdminOrders Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockOrders });
    axios.put.mockResolvedValue({ data: { message: 'Status updated' } });
  });

  test('displays order details correctly', async () => {
    render(
        <BrowserRouter>
            <AdminOrders />
        </BrowserRouter>
    );

    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/all-orders');
    });

    expect(await screen.findByText('#')).toBeInTheDocument();
    expect(await screen.findByText('Not Process')).toBeInTheDocument();
    expect(await screen.findByText('CS 4218 Test Account')).toBeInTheDocument();
    expect(await screen.findByText('2 days ago')).toBeInTheDocument();
    expect(await screen.findByText('Failed')).toBeInTheDocument();
    expect(await screen.findByText('2')).toBeInTheDocument();
  });

  test('displays product details within orders', async () => {
    render(
        <BrowserRouter>
            <AdminOrders />
        </BrowserRouter>
      );

    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/all-orders');
    });

    expect(await screen.findByText('NUS T-shirt')).toBeInTheDocument();
    expect(await screen.findByText('Laptop')).toBeInTheDocument();
    expect(await screen.findByText('Price : 4.99')).toBeInTheDocument();
    expect(await screen.findByText('Price : 1499.99')).toBeInTheDocument();
  });

  test('handles status update correctly', async () => {
    render(
        <BrowserRouter>
            <AdminOrders />
        </BrowserRouter>
      );

    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/all-orders');
    });

    const newStatus = 'Processing';
    const selectDropdown = await screen.findByTestId('select-default-dropdown');
    await act(async () => {
      fireEvent.change(selectDropdown, { target: { value: newStatus } })
    });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        '/api/v1/auth/order-status/67a21938cf4efddf1e5358d1',
        { status: newStatus }
      );
    });
  });
});