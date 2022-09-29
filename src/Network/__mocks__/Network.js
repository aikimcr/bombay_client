const RealNetwork = jest.requireActual('../Network');

export const serverProtocol = 'https';
export const serverHost = 'fake';
export const basePath = 'xyzzy';
export const serverPort = null;

export const normalizeAndJoinPath = RealNetwork.normalizeAndJoinPath;

export function buildURL (args = {}) {
    let { hostname, path, protocol, port } = {
        hostname: serverHost,
        path: '/',
        protocol: serverProtocol,
        port: serverPort,
        ...args,
    }

    return RealNetwork.buildURL(args);
}

// ToDo Find a way to do this without having to copy the entire real implementation.
export function prepareURLFromArgs(path, query) {
    const requestUrl = new URL(buildURL());
    requestUrl.pathname = normalizeAndJoinPath(basePath, path);

    for (const param in query) {
        requestUrl.searchParams.set(param, query[param]);
    }

    return requestUrl;
}

export function getFromPath(path, query) {
    throw new Error('getFromPath has not been mocked properly');
}

export function getFromURLString(url, query) {
    throw new Error('getFromURLString has not been mocked properly');
}

export function postToPath(path, body, query) {
    throw new Error('postToPath has not been mocked properly');
}

// Test Utilities not found in the original
let mockPromise;
let mockResolve;
let mockReject;

export function _setupMockPromise() {
    [mockPromise, mockResolve, mockReject] = makeResolvablePromise();
    return {
        promise: mockPromise,
        resolve: mockResolve,
        reject: mockReject,
    };
}

export function _setupMocks() {
    _setupMockPromise();
    this.getFromPath = jest.fn((path, query) => mockPromise);
    this.getFromURLString = jest.fn((urlString, query) => mockPromise);
    this.postToPath = jest.fn((path, body, query) => mockPromise);

    return {
        resolve: mockResolve,
        reject: mockReject,
    };
}