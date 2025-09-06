type RouteParamsType = Record<string, string | number | symbol>;

export const replaceRouteParams = (
  routeTemplate: string,
  params: RouteParamsType = {},
): string => {
  return Object.keys(params).reduce((memo, paramName) => {
    return memo.replace(`:${paramName}`, params[paramName].toString());
  }, routeTemplate);
};
