import { omit } from 'lodash';

// Manage XHR request calls.  This is the low-level stuff.
// import serverConfig from './serverConfig';
export const defaultAPIServer: string = process.env.SERVER;
export const defaultAPIBasePath: string = process.env.SERVER_BASE_PATH;

const getStandardHeaders = (includeContentType = true) => {
  const result: HeadersInit = {};
  if (includeContentType) {
    result['content-type'] = 'application/json';
  }

  const token = localStorage.getItem('jwttoken');

  if (token) {
    result.Authorization = `Bearer ${token}`;
  }

  return result;
};

export const normalizeAndJoinPath = (...pathList: string[]): string => {
  const newPath = pathList.reduce((memo, part) => {
    if (part === undefined) {
      throw new Error(
        `Unable to normalize path with parts: "${pathList.join(', ')}"`,
      );
    }

    let newPart = memo + '/' + part;
    newPart = newPart.replace(/\/\/+/g, '/');

    if (part !== '/') {
      if (newPart.length > 1) {
        newPart = newPart.replace(/\/+$/, '');
      }
    }

    return newPart;
  }, '/');

  return newPath;
};

interface buildUrlProps {
  server?: string;
  basePath?: string;
  applicationPaths?: string[];
}

export const buildURL = ({
  server = defaultAPIServer,
  basePath = defaultAPIBasePath,
  applicationPaths = [],
}: buildUrlProps = {}) => {
  const allPaths = [...applicationPaths];

  if (!server || server === 'default') {
    server = 'http://localhost:2001';
  }

  if (basePath && basePath !== 'default') {
    allPaths.unshift(basePath);
  }

  const result: URL = new URL(server);
  result.pathname = normalizeAndJoinPath(...allPaths);
  return result;
};

export type NetworkURLQueryType = Record<string, string | number | symbol>;

export const prepareURLFromArgs = (
  pathList: string[] = [],
  query: NetworkURLQueryType = {},
) => {
  const requestUrl = buildURL({ applicationPaths: pathList });

  for (const param in query) {
    requestUrl.searchParams.set(param, query[param].toString());
  }

  return requestUrl;
};

const decodeResponse = async (
  response: Awaited<ReturnType<typeof fetch>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<Record<string, any>> => {
  if (response.ok) {
    const text = await response.text();
    let result = { body: text };

    try {
      result = JSON.parse(text);
    } catch (err) {
      result = { body: text };
    }

    return result;
  }

  return Promise.reject({
    status: response.status,
    message: response.statusText,
  });
};

export const getFromURLString = async (
  urlString: string,
): ReturnType<typeof decodeResponse> => {
  const response = await fetch(urlString, {
    mode: 'cors',
    credentials: 'include',
    headers: getStandardHeaders(false),
  });

  return decodeResponse(response);
};

interface buildJSONProps {
  id?: string | number;
  url?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const buildJSON = (body: buildJSONProps): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendBody: Record<string, any> = {
    ...omit(body, ['id', 'url']),
  };
  return JSON.stringify(sendBody);
};

export const postToURLString = async (
  urlString: string,
  body: buildJSONProps,
) => {
  const sendJSON = buildJSON(body);
  const response = await fetch(urlString, {
    method: 'POST',
    headers: getStandardHeaders(),
    body: sendJSON,
    mode: 'cors',
    credentials: 'include',
  });

  return decodeResponse(response);
};

export const putToURLString = async (
  urlString: string,
  body: buildJSONProps,
) => {
  const sendJSON = buildJSON(body);
  const response = await fetch(urlString, {
    method: 'PUT',
    headers: getStandardHeaders(),
    body: sendJSON,
    mode: 'cors',
    credentials: 'include',
  });

  return decodeResponse(response);
};
