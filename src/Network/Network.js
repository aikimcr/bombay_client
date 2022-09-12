// Manage XHR request calls.  This is the low-level stuff.
import serverConfig from './serverConfig';

function setConfigOption(key, defaultConfig) {
  return serverConfig.hasOwnProperty(key) ? serverConfig[key] : defaultConfig;
}

export const serverProtocol = setConfigOption('serverProtocol', 'http');
export const serverHost = setConfigOption('serverHost', 'localhost');
export const basePath = setConfigOption('basePath', '');
export const serverPort = setConfigOption('serverPort', null);

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

function prepareURLFromArgs(path, query) {
  const requestUrl = new URL(buildURL());
  requestUrl.pathname = normalizeAndJoinPath(basePath, path);

  for (const param in query) {
    requestUrl.searchParams.set(param, query[param]);
  }

  return requestUrl;
}

export function getFromPath(path, query = {}) {
  const requestUrl = prepareURLFromArgs(path, query);

  // I tried using fetch.  It's probably a good idea.  But
  // it forces me to deal with CORS considerations that I'm
  // not prepared for at this point.
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open('GET', requestUrl);
    xhr.withCredentials = true;
    xhr.onload = function() {
      debugger;
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject({status: xhr.status, message: xhr.responseText});
      }
    };
    xhr.send();
  });
}

export function postToPath(path, body = {}, query = {}) {
  const requestUrl = prepareURLFromArgs(path, query);

  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', requestUrl);
    xhr.withCredentials = true;
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.onload = function() {
      debugger;
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject({status: xhr.status, message: xhr.responseText});
      }
    };
    xhr.send(JSON.stringify(body));
  });
}