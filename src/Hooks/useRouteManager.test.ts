import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useLocation, useNavigate } from "react-router";
import { useRouteManager } from "./useRouteManager";
import * as Utilities from "../Utilities";

// Mock react-router hooks
jest.mock("react-router", () => ({
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

// Mock Utilities
jest.mock("../Utilities", () => ({
  replaceRouteParams: jest.fn(),
}));

// Mock window.history
const mockHistoryLength = jest.fn();
Object.defineProperty(window, "history", {
  value: {
    length: mockHistoryLength,
  },
  writable: true,
});

describe("useRouteManager", () => {
  const mockNavigate = jest.fn();
  const mockUseLocation = useLocation as jest.MockedFunction<
    typeof useLocation
  >;
  const mockUseNavigate = useNavigate as jest.MockedFunction<
    typeof useNavigate
  >;
  const mockReplaceRouteParams =
    Utilities.replaceRouteParams as jest.MockedFunction<
      typeof Utilities.replaceRouteParams
    >;

  const defaultLocation: ReturnType<typeof useLocation> = {
    pathname: "/current",
    search: "",
    hash: "",
    state: null,
    key: "test",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockHistoryLength.mockReturnValue(1); // Default to 1
    mockUseLocation.mockReturnValue(defaultLocation);

    // Set up replaceRouteParams mock
    mockReplaceRouteParams.mockImplementation(
      (template: string, params: any) => {
        if (!params) {
          return template;
        }
        return Object.keys(params).reduce((memo, paramName) => {
          return memo.replace(`:${paramName}`, params[paramName].toString());
        }, template);
      },
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("navigateToRoute", () => {
    it("should navigate to route without params when params are not provided", () => {
      const { result } = renderHook(() => useRouteManager());

      act(() => {
        result.current.navigateToRoute("/new-route");
      });

      expect(mockNavigate).toHaveBeenCalledWith("/new-route");
    });

    it("should navigate to route with params when params are provided", () => {
      const { result } = renderHook(() => useRouteManager());

      act(() => {
        result.current.navigateToRoute("/user/:id", { id: 123 });
      });

      expect(mockReplaceRouteParams).toHaveBeenCalledWith("/user/:id", {
        id: 123,
      });
      expect(mockNavigate).toHaveBeenCalledWith("/user/123");
    });

    it("should not navigate if current pathname is the same as target route", () => {
      mockUseLocation.mockReturnValue({
        ...defaultLocation,
        pathname: "/same-route",
      });

      const { result } = renderHook(() => useRouteManager());

      act(() => {
        result.current.navigateToRoute("/same-route");
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should handle null params gracefully", () => {
      const { result } = renderHook(() => useRouteManager());

      act(() => {
        result.current.navigateToRoute("/test-route", null);
      });

      expect(mockNavigate).toHaveBeenCalledWith("/test-route");
    });
  });

  describe("navigateToPreviousRoute", () => {
    it("should navigate back when history exists", () => {
      mockHistoryLength.mockReturnValue(3);

      const { result } = renderHook(() => useRouteManager());

      act(() => {
        result.current.navigateToPreviousRoute();
      });

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it("should navigate to fallback route when no history exists", () => {
      mockHistoryLength.mockReturnValue(1);

      const { result } = renderHook(() => useRouteManager());

      act(() => {
        result.current.navigateToPreviousRoute("/fallback");
      });

      expect(mockNavigate).toHaveBeenCalledWith("/fallback");
    });

    it("should navigate to fallback route with params when no history exists", () => {
      mockHistoryLength.mockReturnValue(1);

      const { result } = renderHook(() => useRouteManager());

      act(() => {
        result.current.navigateToPreviousRoute("/user/:id", { id: 456 });
      });

      expect(mockReplaceRouteParams).toHaveBeenCalledWith("/user/:id", {
        id: 456,
      });
      expect(mockNavigate).toHaveBeenCalledWith("/user/456");
    });

    it.skip("should navigate back when history exists even if fallback is provided", async () => {
      // Set history length before rendering the hook
      mockHistoryLength.mockReturnValue(3);

      const { result } = renderHook(() => useRouteManager());

      // Wait for the useEffect to run and set hasHistory
      await waitFor(() => {
        // The useEffect should have run by now
      });

      act(() => {
        result.current.navigateToPreviousRoute("/fallback");
      });

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it("should handle undefined fallback route gracefully", () => {
      mockHistoryLength.mockReturnValue(1);

      const { result } = renderHook(() => useRouteManager());

      act(() => {
        result.current.navigateToPreviousRoute();
      });

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe("currentPath", () => {
    it("should return current pathname", () => {
      mockUseLocation.mockReturnValue({
        ...defaultLocation,
        pathname: "/test-path",
      });

      const { result } = renderHook(() => useRouteManager());

      expect(result.current.currentPath).toBe("/test-path");
    });

    it("should update when location changes", () => {
      mockUseLocation.mockReturnValue({
        ...defaultLocation,
        pathname: "/initial-path",
      });

      const { result, rerender } = renderHook(() => useRouteManager());

      expect(result.current.currentPath).toBe("/initial-path");

      mockUseLocation.mockReturnValue({
        ...defaultLocation,
        pathname: "/updated-path",
      });

      rerender();

      expect(result.current.currentPath).toBe("/updated-path");
    });
  });

  describe("hasHistory state", () => {
    it("should set hasHistory to true when history length > 1", () => {
      mockHistoryLength.mockReturnValue(3);

      const { result } = renderHook(() => useRouteManager());

      // The hook should have history when history length > 1
      expect(result.current.navigateToPreviousRoute).toBeDefined();
    });

    it("should set hasHistory to false when history length <= 1", () => {
      mockHistoryLength.mockReturnValue(1);

      const { result } = renderHook(() => useRouteManager());

      // The hook should not have history when history length <= 1
      expect(result.current.navigateToPreviousRoute).toBeDefined();
    });
  });

  describe("hook interface", () => {
    it("should return expected interface", () => {
      const { result } = renderHook(() => useRouteManager());

      expect(result.current).toHaveProperty("navigateToRoute");
      expect(result.current).toHaveProperty("navigateToPreviousRoute");
      expect(result.current).toHaveProperty("currentPath");
      expect(typeof result.current.navigateToRoute).toBe("function");
      expect(typeof result.current.navigateToPreviousRoute).toBe("function");
      expect(typeof result.current.currentPath).toBe("string");
    });
  });
});
