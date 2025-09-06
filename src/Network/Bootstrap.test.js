import {
  mockGetFromURLString,
  mockPostToURLString,
  mockPrepareURLFromArgs,
  mockPutToURLString,
  mockServerBasePath,
  mockServerHost,
  mockServerPort,
  mockServerProtocol,
} from '../Network/testing';

jest.mock('../Network/Network', () => {
  const originalModule = jest.requireActual('../Network/Network');

  return {
    __esModule: true,
    ...originalModule,
    serverProtocol: mockServerProtocol,
    serverHost: mockServerHost,
    serverBasePath: mockServerBasePath,
    serverPort: mockServerPort,
    prepareURLFromArgs: mockPrepareURLFromArgs,
    getFromURLString: mockGetFromURLString,
    postToURLString: mockPostToURLString,
    putToURLString: mockPutToURLString,
  };
});

import { fetchBootstrap } from './Bootstrap';

it('should get the bootstrap', async () => {
  const bootstrapUrlPromise = PromiseWithResolvers();
  mockGetFromURLString.mockReturnValueOnce(bootstrapUrlPromise.promise);
  mockPrepareURLFromArgs.mockReturnValue(
    'http://localhost:2001/xyzzy/bootstrap',
  );

  const bootstrapPromise = fetchBootstrap();

  const body = { xyzzy: ['plover', 'plugh', 'bird'] };
  bootstrapUrlPromise.resolve(body);

  const result = await bootstrapPromise;
  expect(result).toEqual(body);
});
