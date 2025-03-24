import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Users from './Users';
import "@testing-library/jest-dom/extend-expect";

jest.mock('axios');

jest.mock('moment', () => {
  return (date) => ({
    format: () => '01/02/2024'
  });
});

jest.mock('../../context/auth', () => ({
  useAuth: () => [{ token: 'test-token', user: { role: 1 } }, jest.fn()],
  AuthProvider: ({ children }) => children
}));

jest.mock("../../components/Layout", () => ({children}) => <div>{children}</div>);

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

const mockUsers = [
  {
    _id: '67a218decf4efddf1e5358ac',
    name: 'CS 4218 Test Account',
    email: 'cs4218@test.com',
    phone: '81234567',
    address: '1 Computing Drive',
    role: 1,
    createdAt: '2025-02-04T13:40:46.071Z',
    updatedAt: '2025-02-04T13:40:46.071Z',
    __v: 0
  },
  {
    _id: '672f05f78e4ca7dabcdabae7',
    name: 'user@test.com',
    email: 'user@test.com',
    phone: 'user@test.com',
    address: 'user@test.com',
    role: 0,
    createdAt: '2024-11-09T06:49:27.973Z',
    updatedAt: '2024-11-09T06:49:27.973Z',
    __v: 0
  }
];

describe('Users Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockUsers });
  });

  test('displays user details correctly', async () => {
    render(
        <BrowserRouter>
              <Users />
        </BrowserRouter>
    );

    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/all-users');
      });

    expect(await screen.findByText('CS 4218 Test Account')).toBeInTheDocument();
    expect(await screen.findByText('cs4218@test.com')).toBeInTheDocument();
    expect(await screen.findByText('81234567')).toBeInTheDocument();
    expect(await screen.findByText('1 Computing Drive')).toBeInTheDocument();
    expect(await screen.findByText('Admin')).toBeInTheDocument();
    const dates = await screen.findAllByText('01/02/2024');
    expect(dates).toHaveLength(2);
  });

  test('displays correct role labels', async () => {
    render(
        <BrowserRouter>
              <Users />
        </BrowserRouter>
    );

    const adminRoles = await screen.findAllByText('Admin');
    const userRoles = await screen.findAllByText('User');
    expect(adminRoles).toHaveLength(1);
    expect(userRoles).toHaveLength(1);
  });

  test('handles empty users array', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    render(
        <BrowserRouter>
              <Users />
        </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    render(
        <BrowserRouter>
              <Users />
        </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  test('integrates with AdminMenu component', async () => {
    render(
        <BrowserRouter>
              <Users />
        </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });
  });
});