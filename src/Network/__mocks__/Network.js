const RealNetwork = jest.requireActual('../Network');

export const serverProtocol = 'https';
export const serverHost = 'fake';
export const serverBasePath = 'xyzzy';
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
    requestUrl.pathname = normalizeAndJoinPath(serverBasePath, path);

    for (const param in query) {
        requestUrl.searchParams.set(param, query[param]);
    }

    return requestUrl;
}


export function getFromURLString(url, query) {
    throw new Error(`getFromURLString has not been mocked properly ${url} ${JSON.stringify(query)}`);
}

export async function postToURLString(urlString, body) {
    throw new Error(`postToURLString has not been mocked properly ${url} ${JSON.stringify(body)}`);
}

export async function putToURLString(urlString, body) {
    throw new Error(`putToURLString has not been mocked properly ${url} ${JSON.stringify(body)}`);
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

    this.getFromURLString = jest.fn((urlString, query) => {
        expect(mockPromise).toBeDefined();
        return mockPromise;
    });

    this.postToURLString = jest.fn((urlString, body) => {
        expect(mockPromise).toBeDefined();
        return mockPromise;
    });

    this.putToURLString = jest.fn((urlString, body) => {
        expect(mockPromise).toBeDefined();
        return mockPromise;
    });

    return {
        resolve: mockResolve,
        reject: mockReject,
        promise: mockPromise,
    };
}