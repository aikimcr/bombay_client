//
// Collections must:
// - Fetch paged data.
// - Create models from fetched data.
// - Maintain the order of models based on the fetch order.
// - Guarantee that no models are duplicated (based on the model id).
// - Handle empty fetches.
// - Provide mechanisms to fetch next and previous pages.
// - Provide mechanisms to restart the fetch from the beginning.
// - Provide mechanisms to add or remove models.
// - Provide a mechanism to post or delete for models.
// - Be agnostic to the model type.
import {
  mockGetFromURLString,
  mockPostToURLString,
  mockPrepareURLFromArgs,
  mockPutToURLString,
  mockServerProtocol,
  mockServerHost,
  mockServerBasePath,
  mockServerPort,
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

import { CollectionBase } from './CollectionBase';
import { ArtistCollection } from './ArtistCollection';
import {
  setupArtistCollectionFetch,
  TestArtistCollectionURL,
  TestUrlWithOffsets,
} from './testing';

describe('ArtistCollection', () => {
  it('should not recognize a base collection as an artist collection', async () => {
    const getPromise = PromiseWithResolvers();
    mockGetFromURLString.mockReturnValue(getPromise.promise);
    mockPrepareURLFromArgs.mockReturnValue(
      new URL('http://localhost:2001/artist'),
    );

    // If the class extension is done correctly, TypeScript should just handle this.
    const baseCollection = new CollectionBase({ tableName: 'table' });
    const artistCollection = new ArtistCollection({});

    expect(CollectionBase.isCollection(baseCollection)).toBeTruthy();
    expect(CollectionBase.isCollection(artistCollection)).toBeTruthy();

    expect(ArtistCollection.isCollection(baseCollection)).toBeFalsy();
    expect(ArtistCollection.isCollection(artistCollection)).toBeTruthy();
  });

  it('should fetch artist collection', async () => {
    const [getPromise, fetchBody, models] = setupArtistCollectionFetch();

    const collection = new ArtistCollection({ fetch: true });
    getPromise.resolve(fetchBody);
    await collection.ready;

    expect(ArtistCollection.isCollection(collection)).toBeTruthy();
    expect(collection.url).toEqual(TestArtistCollectionURL);
    expect(collection.length).toEqual(10);
    expect(collection.models).toEqual(models);
    expect(collection.nextPage).toBe(
      TestUrlWithOffsets(TestArtistCollectionURL, 10, 10),
    );
    expect(collection.prevPage).toBeUndefined();
  });
});
