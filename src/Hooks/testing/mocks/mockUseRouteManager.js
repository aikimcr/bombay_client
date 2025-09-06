import React from 'react';
import { replaceRouteParams } from '../../../Utilities';

export let mockCurrentPath = '/';
export const mockNavigateToRoute = jest.fn((routeTemplate, params = null) => {
  currentPath = replaceRouteParams(routeTemplate, params);
});

export const mockNavigateToPreviousRoute = jest.fn(
  (fallbackRoute, fallbackParams = null) => {
    currentPath = replaceRouteParams(fallbackRoute, fallbackParams);
  },
);

export const mockUseRouteManager = () => {
  return {
    navigateToRoute: mockNavigateToRoute,
    navigateToPreviousRoute: mockNavigateToPreviousRoute,
    currentPath: mockCurrentPath,
  };
};
