const RealBootstrap = jest.requireActual("../Bootstrap.js");

export function fetchBootstrap() {
  throw new Error("fetchBootstrap has not been mocked properly");
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
  this.fetchBootstrap = jest.fn(() => mockPromise);

  return {
    resolve: mockResolve,
    reject: mockReject,
  };
}
