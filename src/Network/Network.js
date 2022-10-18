// Manage XHR request calls.  This is the low-level stuff.
// import serverConfig from './serverConfig';
const serverConfig = {};

const serverConfigKeys = {
  serverProtocol: 'REACT_APP_SERVER_PROTOCOL',
  serverHost: 'REACT_APP_SERVER_HOST',
  serverBasePath: 'REACT_APP_SERVER_BASE_PATH',
  serverPort: 'REACT_APP_SERVER_PORT',
}

for (const key in serverConfigKeys) {
  if (process.env.hasOwnProperty(serverConfigKeys[key])) {
    const value = process.env[serverConfigKeys[key]];

    switch(value) {
      case 'null':
      case 'none':
      case 'empty':
        serverConfig[key] = null;
        break;

      default:
        serverConfig[key] = value;
    }
  }
}

function setConfigOption(key, defaultConfig) {
  return serverConfig.hasOwnProperty(key) ? serverConfig[key] : defaultConfig;
}

export const serverProtocol = setConfigOption('serverProtocol', 'http');
export const serverHost = setConfigOption('serverHost', 'localhost');
export const serverBasePath = setConfigOption('serverBasePath', '');
export const serverPort = setConfigOption('serverPort', 2001);

console.log(`Server Base URL: ${prepareURLFromArgs('')}`);

function getStandardHeaders(includeContentType = true) {
  const result = {};
  if (includeContentType) result['content-type'] = 'application/json';

  const token = localStorage.getItem('jwttoken')

  if (token) {
    result.Authorization = `Bearer ${token}`;
  }

  return result;
}

export function normalizeAndJoinPath(...pathParts) {
  const newPath = pathParts.reduce((memo, part) => {
    if (part === undefined) {
      throw new Error(`Unable to normalize path with parts: "${pathParts.join(', ')}"`);
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
}

export function buildURL(args = {}) {
  let { hostname, path, protocol, port } = {
    hostname: serverHost,
    path: '/',
    protocol: serverProtocol,
    port: serverPort,
    ...args,
  }

  hostname = hostname.replace(/^\/+/, '').replace(/\/+$/, '');

  if (hostname.length === 0) {
    hostname = serverHost;
  }

  let result = `${protocol}://${hostname}`;

  if (port) {
    result += `:${port}`;
  }

  if (Array.isArray(path)) {
    path = normalizeAndJoinPath(...path);
  }

  result += path;

  return result;
}

export function prepareURLFromArgs(path, query) {
  const requestUrl = new URL(buildURL());
  requestUrl.pathname = normalizeAndJoinPath(serverBasePath, path);

  for (const param in query) {
    requestUrl.searchParams.set(param, query[param]);
  }

  return requestUrl;
}

async function decodeResponse(response) {
  if (response.ok) {
    const text = await response.text();
    let result = text;

    try {
      result = JSON.parse(text);
    } catch(err) {
      result = text;
    }

    return result;
  }

  return Promise.reject({ status: response.status, message: response.statusText });
}

export async function getFromURLString(urlString) {
  const response = await fetch(urlString, {
    mode: 'cors',
    credentials: 'include',
    headers: getStandardHeaders(false),
  });

  return decodeResponse(response);
}

function buildJSON(body) {
  const sendBody = { ...body };
  delete sendBody.id;
  delete sendBody.url;
  return JSON.stringify(sendBody);
}

export async function postToURLString(urlString, body) {
  const sendJSON = buildJSON(body);
  const response = await fetch(urlString, {
    method: 'POST',
    headers: getStandardHeaders(),
    body: sendJSON,
    mode: 'cors',
    credentials: 'include',
  });

  return decodeResponse(response);
}

export async function putToURLString(urlString, body) {
  const sendJSON = buildJSON(body);
  const response = await fetch(urlString, {
    method: 'PUT',
    headers: getStandardHeaders(),
    body: sendJSON,
    mode: 'cors',
    credentials: 'include',
  });

  return decodeResponse(response);
}