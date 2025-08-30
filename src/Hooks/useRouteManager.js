import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

const replaceRouteParams = (routeTemplate, params = {}) => {
  return Object.keys(params).reduce((memo, paramName) => {
    return memo.replace(`:${paramName}`, params[paramName]);
  }, routeTemplate);
};

export const useRouteManager = () => {
  const currentLocation = useLocation();
  const navigate = useNavigate();

  const [hasHistory, setHasHistory] = useState(false);

  const navigateToRoute = (routeTemplate, params = null) => {
    const routeName = params
      ? replaceRouteParams(routeTemplate, params)
      : routeTemplate;

    if (currentLocation.pathname !== routeName) {
      navigate(routeName);
    }
  };

  const navigateToPreviousRoute = (fallbackRoute, fallbackParams = null) => {
    if (!hasHIstory && fallbackRoute) {
      return navigateToRoute(fallbackRoute, fallbackParams);
    }

    navigate(-1);
  };

  const currentPath = currentLocation.pathName;

  useEffect(() => {
    setHasHistory(window.history.length > 1);
  }, [currentLocation]);

  return {
    navigateToRoute,
    navigateToPreviousRoute,
    currentPath,
  };
};
