import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import AdminDashboard from '../pages/admin/AdminDashboard';
import "@testing-library/jest-dom/extend-expect";
import CreateCategory from '../pages/admin/CreateCategory';
import CreateProduct from '../pages/admin/CreateProduct';
import Products from '../pages/admin/Products';
import AdminOrders from '../pages/admin/AdminOrders';
import Users from '../pages/admin/Users';

jest.mock('../context/auth', () => ({
  useAuth: () => [{ token: 'test-token', user: { role: 1 } }, jest.fn()],
  AuthProvider: ({ children }) => children
}));

jest.mock('../context/cart', () => ({
  useCart: () => [[], jest.fn()]
}));

jest.mock('../hooks/useCategory', () => (() => ([])));

jest.mock('../context/search', () => ({
  useSearch: () => [{}, jest.fn()]
}));

jest.mock("./Layout", () => ({children}) => <div>{children}</div>);

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

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { success: true, category: [] } })),
  post: jest.fn(() => Promise.resolve({ data: { success: true } })),
  put: jest.fn(() => Promise.resolve({ data: { success: true } })),
  delete: jest.fn(() => Promise.resolve({ data: { success: true } })),
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('AdminMenu Integration with Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders within AdminDashboard', () => {
    render(
        <BrowserRouter>
              <AdminDashboard />
        </BrowserRouter>
      );
    
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Create Category')).toBeInTheDocument();
    expect(screen.getByText('Create Product')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  test('maintains correct layout within AdminDashboard', () => {
    render(
        <BrowserRouter>
              <AdminDashboard />
        </BrowserRouter>
      );
    
    const adminMenuColumn = screen.getAllByText('Admin Panel')[0].closest('.col-md-3');
    expect(adminMenuColumn).toBeInTheDocument();
  });

  test('navigation links are clickable for create category', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/admin']}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/create-category" element={<CreateCategory />} />
        </Routes>
      </MemoryRouter>
    );
    
    const createCategoryLink = screen.getByText('Create Category');
    fireEvent.click(createCategoryLink);
    expect(await screen.findByText('Manage Category')).toBeInTheDocument(); 
  });

  test('navigation links are clickable for create product', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/admin']}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/create-product" element={<CreateProduct />} />
        </Routes>
      </MemoryRouter>
    );  
    
    const createProductLink = screen.getByText('Create Product');
    fireEvent.click(createProductLink);
    const text = await screen.findAllByText('Create Product')
    expect(text).toHaveLength(2);
    expect(text[0]).toBeInTheDocument();
  });

  test('navigation links are clickable for products', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/admin']}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/products" element={<Products />} />
        </Routes>
      </MemoryRouter>
    );  
    
    const productsLink = screen.getByText('Products');
    fireEvent.click(productsLink);
    expect(await screen.findByText('All Products List')).toBeInTheDocument();
  });

  test('navigation links are clickable for orders', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/admin']}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/orders" element={<AdminOrders />} />
        </Routes>
      </MemoryRouter>
    );  

    const ordersLink = screen.getByText('Orders');
    fireEvent.click(ordersLink);
    expect(await screen.findByText('All Orders')).toBeInTheDocument();
  });
  
  test('navigation links are clickable for users', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/admin']}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/users" element={<Users />} />
        </Routes>
      </MemoryRouter>
    );  

    const usersLink = screen.getByText('Users');
    fireEvent.click(usersLink);
    expect(await screen.findByText('All Users')).toBeInTheDocument();
  });
});