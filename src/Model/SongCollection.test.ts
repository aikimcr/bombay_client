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
  mockBuildURL,
  mockDefaultAPIBasePath,
  mockDefaultAPIServer,
  mockGetFromURLString,
  mockPostToURLString,
  mockPrepareURLFromArgs,
  mockPutToURLString,
} from '../Network/testing';

jest.mock('../Network/Network', () => {
  const originalModule = jest.requireActual('../Network/Network');

  return {
    __esModule: true,
    ...originalModule,
    defaultAPIServer: mockDefaultAPIServer,
    defaultAPIBasePath: mockDefaultAPIBasePath,
    buildURL: mockBuildURL,
    prepareURLFromArgs: mockPrepareURLFromArgs,
    getFromURLString: mockGetFromURLString,
    postToURLString: mockPostToURLString,
    putToURLString: mockPutToURLString,
  };
});

import { CollectionBase } from './CollectionBase';
import { SongCollection } from './SongCollection';
import {
  setupSongCollectionFetch,
  setupSongCollectionModels,
  setupTestCollectionOneModels,
  TestSongCollectionURL,
  TestUrlWithOffsets,
} from './testing';

beforeEach(() => {
  mockBuildURL.mockReturnValue(new URL(TestSongCollectionURL));
});

describe('SongCollection', () => {
  it('should not recognize a base collection as a song collection', async () => {
    const [testModels] = setupTestCollectionOneModels();
    const [songModels] = setupSongCollectionModels();

    // If the class extension is done correctly, TypeScript should just handle this.
    const baseCollection = new CollectionBase({
      models: testModels,
    });

    const songCollection = new SongCollection({
      models: songModels,
    });

    expect(CollectionBase.isCollection(baseCollection)).toBeTruthy();
    expect(CollectionBase.isCollection(songCollection)).toBeTruthy();

    expect(SongCollection.isCollection(baseCollection)).toBeFalsy();
    expect(SongCollection.isCollection(songCollection)).toBeTruthy();
  });

  it('should fetch song collection', async () => {
    const [getPromise, fetchBody, models] = setupSongCollectionFetch();

    const collection = new SongCollection({ fetch: true });

    getPromise.resolve(fetchBody);
    await collection.ready;

    expect(SongCollection.isCollection(collection)).toBeTruthy();
    expect(collection.url).toEqual(TestSongCollectionURL);
    expect(collection.length).toEqual(10);
    expect(collection.models).toEqual(models);
    expect(collection.nextPage).toEqual(
      TestUrlWithOffsets(TestSongCollectionURL, 10, 10),
    );
  });

  /*
  it.skip('should handle song models with artist references', async () => {

    const getPromise = PromiseWithResolvers();
    mockGetFromURLString.mockReturnValue(getPromise.promise);
    mockPrepareURLFromArgs.mockReturnValue(new URL('https://xyzzy/song'));

    const collection = new SongCollection();
    const [fetchBody] = makeFetchBodyAndModels(5, {}, 'song');
    getPromise.resolve(fetchBody);
    await collection.ready();

    // Test that songs have artist references
    const songs = collection.models();
    expect(songs.length).toBeGreaterThan(0);

    songs.forEach((song) => {
      expect(SongModel.isModel(song)).toBeTruthy();
      expect(song.get('artist_id')).toBeDefined();
      expect(song.artistUrl).toBeDefined();

      // Test that we can retrieve the artist
      const artist = song.artist();
      expect(artist).toBeDefined();
      expect(artist.get('id')).toEqual(song.get('artist_id'));
    });
  });
  */
});
