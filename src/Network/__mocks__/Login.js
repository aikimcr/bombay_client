const RealLogin = jest.requireActual('../Login');

export async function loginStatus() {
    throw new Error('loginStatus has not been mocked properly');
}

export async function refreshToken() {
    throw new Error('refreshToken has not been mocked properly');
}

export async function login(username, password) {
    throw new Error('login has not been mocked properly');
}

export async function logout() {
    throw new Error('logout has not been mocked properly');
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
    this.loginStatus = jest.fn(() => mockPromise);
    this.refreshToken =jest.fn(() => mockPromise);
    this.login = jest.fn((username, password) => mockPromise);
    this.logout = jest.fn(() => mockPromise);

    return {
        resolve: mockResolve,
        reject: mockReject,
        promise: mockPromise,
    };
}