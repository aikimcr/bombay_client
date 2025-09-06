import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { replaceRouteParams } from '../Utilities';

type RouteParams = Record<string, string | number | symbol>;

interface RouteManagerResult {
  navigateToRoute: (routeTemplate: string, params?: RouteParams | null) => void;
  navigateToPreviousRoute: (
    fallbackRoute?: string,
    fallbackParams?: RouteParams | null,
  ) => void;
  currentPath: string;
}

export const useRouteManager = (): RouteManagerResult => {
  const currentLocation = useLocation();
  const navigate = useNavigate();

  const [hasHistory, setHasHistory] = useState<boolean>(false);

  const navigateToRoute = (
    routeTemplate: string,
    params: RouteParams | null = null,
  ): void => {
    const routeName = params
      ? replaceRouteParams(routeTemplate, params)
      : routeTemplate;

    if (currentLocation.pathname !== routeName) {
      navigate(routeName);
    }
  };

  const navigateToPreviousRoute = (
    fallbackRoute?: string,
    fallbackParams: RouteParams | null = null,
  ): void => {
    if (!hasHistory && fallbackRoute) {
      return navigateToRoute(fallbackRoute, fallbackParams);
    }

    navigate(-1);
  };

  const currentPath = currentLocation.pathname;

  useEffect(() => {
    setHasHistory(window.history.length > 1);
  }, [currentLocation]);

  return {
    navigateToRoute,
    navigateToPreviousRoute,
    currentPath,
  };
};
