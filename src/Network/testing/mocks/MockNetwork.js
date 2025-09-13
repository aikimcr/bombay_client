const RealNetwork = jest.requireActual('../../Network');

export const mockDefaultAPIServer = 'https://fake';
export const mockDefaultAPIBasePath = 'xyzzy';

export const mockBuildURL = jest.fn();
export const mockPrepareURLFromArgs = jest.fn();
export const mockGetFromURLString = jest.fn();
export const mockPostToURLString = jest.fn();
export const mockPutToURLString = jest.fn();

// export const mockNetwork = {
//   __esModule: true,
//   ...RealNetwork,
//   serverProtocol: mockServerProtocol,
//   serverHost: mockServerHost,
//   serverBasePath: mockServerBasePath,
//   serverPort: mockServerPort,
//   prepareURLFromArgs: mockPrepareURLFromArgs,
//   getFromURLString: mockGetFromURLString,
//   postToURLString: mockPostToURLString,
//   putToURLString: mockPutToURLString,
// };
