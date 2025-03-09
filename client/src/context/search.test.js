/** @jest-environment jsdom */
import React from "react";
import { useSearch, SearchProvider } from "./search";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

const TestComponent = () => {
  const [search, setSearch] = useSearch();
  
  const updateKeyword = () => {
    setSearch({
      ...search,
      keyword: 'test query'
    });
  };
  
  const updateResults = () => {
    setSearch({
      ...search,
      results: [{ id: 1, name: 'Product 1' }, { id: 2, name: 'Product 2' }]
    });
  };
  
  return (
    <div>
      <div data-testid="keyword">{search.keyword}</div>
      <div data-testid="results-count">{search.results.length}</div>
      <button data-testid="update-keyword" onClick={updateKeyword}>Update Keyword</button>
      <button data-testid="update-results" onClick={updateResults}>Update Results</button>
    </div>
  );
};

describe('SearchContext of search', () => {
    test('renders with correct initial state', () => {
      render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );
      
      expect(screen.getByTestId('keyword').textContent).toBe('');
      expect(screen.getByTestId('results-count').textContent).toBe('0');
    });
    
    test('renders with updated keyword', async () => {
      render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );
      
      await act(() => {
        fireEvent.click(screen.getByTestId('update-keyword'));
      });
      
      expect(screen.getByTestId('keyword').textContent).toBe('test query');
    });
    
    test('renders with updated results', async () => {
      render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );
      
      await act(() => {
        fireEvent.click(screen.getByTestId('update-results'));
      });
      
      expect(screen.getByTestId('results-count').textContent).toBe('2');
    });
    
    test('renders with context between renders', async () => {
      const {rerender} = render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );
  
      await act(() => {
        fireEvent.click(screen.getByTestId('update-keyword'));
      });
      
      await act(() => {
        fireEvent.click(screen.getByTestId('update-results'));
      });
  
      rerender(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );
      
      expect(screen.getByTestId('keyword').textContent).toBe('test query');
      expect(screen.getByTestId('results-count').textContent).toBe('2');
    });
  });