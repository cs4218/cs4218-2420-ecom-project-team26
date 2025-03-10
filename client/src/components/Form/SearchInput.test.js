/** @jest-environment jsdom */
import React from "react";
import {  render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import "@testing-library/jest-dom/extend-expect";
import SearchInput from "./SearchInput";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../context/search";

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));
jest.mock('../../context/search', () => ({
  useSearch: jest.fn(),
}));

describe('SearchInput Component', () => {
    const mockNavigate = jest.fn();
    
    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        useSearch.mockReturnValue([{ keyword: '', results: [] }, jest.fn()]);
    });
  
    test('renders with correct starting elements', () => {
        render(<SearchInput />);
        
        expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Search")).toHaveAttribute("type", "search");
        const searchButton = screen.getByRole('button', { name: /search/i });
        expect(searchButton).toBeInTheDocument();
        expect(searchButton).toHaveClass('btn-outline-success');
    });
  
    test('updates search keyword when typing input', () => {
        const values = { keyword: '', results: [] };
        const setValues = jest.fn();
        useSearch.mockReturnValue([values, setValues]);
        render(<SearchInput />);
        
        const searchInput = screen.getByPlaceholderText('Search');
        fireEvent.change(searchInput, { target: { value: 'test product' } });
        expect(setValues).toHaveBeenCalledWith({ ...values, keyword: 'test product' });
    });
  
    test('form submission fetches search results and navigates to search page', async () => {
        const valuesWithKeyword = {
            "keyword": "no",
            "results": [
                {
                    "_id": "66db427fdb0119d9234b27f9",
                    "name": "Novel",
                    "slug": "novel",
                    "description": "A bestselling novel",
                    "price": 14.99,
                    "category": "66db427fdb0119d9234b27ef",
                    "quantity": 200,
                    "shipping": true,
                    "createdAt": "2024-09-06T17:57:19.992Z",
                    "updatedAt": "2024-09-06T17:57:19.992Z",
                    "__v": 0
                }
            ]
        }
        const setValues = jest.fn();
        useSearch.mockReturnValue([valuesWithKeyword, setValues]);
        
        const mockSearchResults = [
            {
                "_id": "66db427fdb0119d9234b27f9",
                "name": "Novel",
                "slug": "novel",
                "description": "A bestselling novel",
                "price": 14.99,
                "category": "66db427fdb0119d9234b27ef",
                "quantity": 200,
                "shipping": true,
                "createdAt": "2024-09-06T17:57:19.992Z",
                "updatedAt": "2024-09-06T17:57:19.992Z",
                "__v": 0
            }
        ]
        axios.get.mockResolvedValueOnce({ data: mockSearchResults });
        render(<SearchInput />);
        
        const searchForm = screen.getByRole('search');
        fireEvent.submit(searchForm);
        
        await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/product/search/no'));
        await waitFor(() => {
            expect(setValues).toHaveBeenCalledWith({ 
            ...valuesWithKeyword, 
            results: mockSearchResults 
            });
        });
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/search'));
    });
  
    test('handles API error during search', async () => {
        const valuesWithKeyword = { keyword: 'error', results: [] };
        const setValues = jest.fn();
        useSearch.mockReturnValue([valuesWithKeyword, setValues]);
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const mockError = new Error('API error');
        axios.get.mockRejectedValueOnce(mockError);
        
        render(<SearchInput />);
        
        const searchForm = screen.getByRole('search');
        fireEvent.submit(searchForm);
        await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/product/search/error'));
        await waitFor(() => expect(consoleLogSpy).toHaveBeenCalledWith(mockError));
        consoleLogSpy.mockRestore();
    });
  });