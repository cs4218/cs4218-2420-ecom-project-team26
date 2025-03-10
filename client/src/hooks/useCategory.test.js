import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import useCategory from "./useCategory";

// Mocking axios module
jest.mock("axios");

describe("useCategory test", () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        success: true,
        message: "All Categories List",
        category: [
          {
            _id: "1",
            name: "Electronics",
            slug: "electronics",
            __v: 0,
          },
          {
            _id: "2",
            name: "Books",
            slug: "books",
            __v: 0,
          },
          {
            _id: "3",
            name: "Lifestyle",
            slug: "lifestyle",
            __v: 0,
          },
        ],
      },
    });
  });

  it("should fetch categories and update state", async () => {
    const { result } = renderHook(() => useCategory());

    await waitFor(() =>
      expect(result.current).toEqual([
        {
          _id: "1",
          name: "Electronics",
          slug: "electronics",
          __v: 0,
        },
        {
          _id: "2",
          name: "Books",
          slug: "books",
          __v: 0,
        },
        {
          _id: "3",
          name: "Lifestyle",
          slug: "lifestyle",
          __v: 0,
        },
      ])
    );
  });

  it("should handle API error and return an empty array", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    axios.get.mockRejectedValue(new Error("API request failed"));

    const { result } = renderHook(() => useCategory());

    await waitFor(() => expect(result.current).toEqual([]));

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

    consoleSpy.mockRestore();
  });
});
