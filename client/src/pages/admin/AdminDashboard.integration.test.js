import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import { AuthProvider } from '../../context/auth';
import "@testing-library/jest-dom/extend-expect";

const mockAuth = {
  user: {
    name: 'CS 4218 Test Account',
    email: 'cs4218@test.com',
    password: '$2b$10$//wWsN./fEX1WiipH57HG.SAwgkYv1MRrPSkpXM38Dy5seOEhCoUy',
    phone: '81234567',
    address: '1 Computing Drive',
    answer: 'password is cs4218@test.com',
    role: 1,
    createdAt: '2025-02-04T13:40:46.071Z',
    updatedAt: '2025-02-04T13:40:46.071Z',
    __v: 0
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

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AdminDashboard Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthValue = mockAuth;
  });

  test('integrates with AuthContext and displays user data', async () => {
    renderWithProviders(<AdminDashboard />);
    
    expect(screen.getByText(`Admin Name : ${mockAuth.user.name}`)).toBeInTheDocument();
    expect(screen.getByText(`Admin Email : ${mockAuth.user.email}`)).toBeInTheDocument();
    expect(screen.getByText(`Admin Contact : ${mockAuth.user.phone}`)).toBeInTheDocument();
  });

  test('integrates with Layout and AdminMenu components', () => {
    renderWithProviders(<AdminDashboard />);
    
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Create Category')).toBeInTheDocument();
    expect(screen.getByText('Create Product')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(document.querySelector('.dashboard-menu')).toBeInTheDocument();
  });

  test('integrates with Layout and AdminMenu components', async () => {
    renderWithProviders(<AdminDashboard />);
    
    expect(await screen.findByText('Admin Panel')).toBeInTheDocument();
    expect(await screen.findByText('Create Category')).toBeInTheDocument();
    expect(await screen.findByText('Create Product')).toBeInTheDocument();
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(document.querySelector('.dashboard-menu')).toBeInTheDocument();
  });

  test('handles auth context updates', async () => {
    const { rerender } = renderWithProviders(<AdminDashboard />);
    
    expect(screen.getByText(`Admin Name : ${mockAuth.user.name}`)).toBeInTheDocument();
    expect(screen.getByText(`Admin Email : ${mockAuth.user.email}`)).toBeInTheDocument();
    expect(screen.getByText(`Admin Contact : ${mockAuth.user.phone}`)).toBeInTheDocument();
    
    const updatedAuth = {
      user: { name: 'Updated Admin', email: 'updated@test.com', phone: '0987654321' },
      token: 'updated-token'
    };
    mockAuthValue = updatedAuth;

    rerender(
      <BrowserRouter>
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText(`Admin Name : ${updatedAuth.user.name}`)).toBeInTheDocument();
    expect(await screen.findByText(`Admin Email : ${updatedAuth.user.email}`)).toBeInTheDocument();
    expect(await screen.findByText(`Admin Contact : ${updatedAuth.user.phone}`)).toBeInTheDocument();
  });
});