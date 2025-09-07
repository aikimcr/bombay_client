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

import {
  TestCollectionOne,
  TestModelOne,
  TestModelOneData,
  setupTestCollectionOneFetch,
  setupTestCollectionOneModels,
  TestCollectionOneURL,
  TestUrlWithOffsets,
} from './testing';

describe('CollectionBase', () => {
  describe('Basic creation', () => {
    it('Create and empty collection', async () => {
      const collection = new TestCollectionOne({});

      expect(collection.url).toEqual(TestCollectionOneURL);
      expect(collection.length).toEqual(0);
      expect(collection.models).toEqual([]);
      expect(collection.nextPage).toBeUndefined();
      expect(collection.prevPage).toBeUndefined();
    });

    it('Create a collection from a list of models', async () => {
      const [models] = setupTestCollectionOneModels();

      const collection = new TestCollectionOne({
        models: models,
      });

      expect(collection.url).toEqual(TestCollectionOneURL);
      expect(collection.length).toEqual(10);
      expect(collection.models).toEqual(models);
      expect(collection.nextPage).toBeUndefined();
      expect(collection.prevPage).toBeUndefined();
    });

    it('should clear the collection', async () => {
      const [models] = setupTestCollectionOneModels();

      const collection = new TestCollectionOne({
        models: models,
      });

      expect(collection.length).toEqual(models.length);
      expect(collection.models).toEqual(models);

      collection.clear();
      expect(collection.length).toEqual(0);
      expect(collection.models).toEqual([]);
    });

    it('should instantiate with a set of models', async () => {
      // In this case, paging may not be possible.
      const defs: TestModelOneData[] = [
        {
          id: 1,
          name: 'Herkimer P Jones',
          description:
            'Commodo sit reprehenderit est Lorem nulla magna irure minim irure tempor sit dolor est quis.',
        },
        {
          id: 2,
          name: 'Agathea S Reese',
          description:
            'Culpa aute sunt tempor proident sint sunt sit esse fugiat proident occaecat proident eu.',
        },
      ];
      const collection = new TestCollectionOne({
        defs,
      });

      const models = defs.map(
        (def) =>
          new TestModelOne({
            data: def,
            keepId: true,
          }),
      );

      // The promise should already be resolved
      await collection.ready;
      expect(collection.length).toBe(2);
      expect(collection.models).toEqual(models);
    });

    it('Should fetch a lonely page', async () => {
      const [getPromise, _fetchBody, models, fetchDef] =
        setupTestCollectionOneFetch();

      const collection = new TestCollectionOne({
        fetch: true,
        tableName: 'table1',
      });

      getPromise.resolve(fetchDef);
      await collection.ready;

      expect(collection.url).toEqual(TestCollectionOneURL);
      expect(collection.length).toEqual(10);
      expect(collection.models).toEqual(models);
      expect(collection.nextPage).toBeUndefined();
      expect(collection.prevPage).toBeUndefined();
    });
  });

  describe('Page Fetching', () => {
    it('should fetch the first page', async () => {
      const [getPromise, fetchBody, models] = setupTestCollectionOneFetch();

      const collection = new TestCollectionOne({
        fetch: true,
      });

      getPromise.resolve(fetchBody);
      await collection.ready;

      expect(collection.url).toEqual(TestCollectionOneURL);
      expect(collection.length).toEqual(10);
      expect(collection.models).toEqual(models);
      expect(collection.nextPage).toBe(
        TestUrlWithOffsets(TestCollectionOneURL, 10, 10),
      );
      expect(collection.hasNextPage).toBeTruthy();
      expect(collection.prevPage).toBeUndefined();
      expect(collection.hasPrevPage).toBeFalsy();

      collection.clear();

      expect(collection.length).toEqual(0);
      expect(collection.models).toEqual([]);
      expect(collection.nextPage).toBeUndefined();
      expect(collection.hasNextPage).toBeFalsy();
      expect(collection.prevPage).toBeUndefined();
      expect(collection.hasPrevPage).toBeFalsy();
    });

    it('should fetch the first page if no next or prev page', async () => {
      const [models1] = setupTestCollectionOneModels();

      const collection = new TestCollectionOne({
        models: models1,
      });

      expect(collection.url).toEqual(TestCollectionOneURL);
      expect(collection.length).toEqual(10);
      expect(collection.nextPage).toBeUndefined();
      expect(collection.prevPage).toBeUndefined();
      expect(mockGetFromURLString).not.toHaveBeenCalled();

      collection.clear();

      expect(collection.length).toEqual(0);
      expect(collection.models).toEqual([]);
      expect(collection.nextPage).toBeUndefined();
      expect(collection.prevPage).toBeUndefined();

      const [getPromiseNext, fetchBodyNext] = setupTestCollectionOneFetch();
      const [getPromisePrev, fetchBodyPrev] = setupTestCollectionOneFetch();

      const fetchPromiseNext = collection.fetchNextPage();
      getPromiseNext.resolve(fetchBodyNext);
      await fetchPromiseNext;

      expect(collection.length).toEqual(10);
      expect(collection.nextPage).toEqual(
        TestUrlWithOffsets(TestCollectionOneURL, 10, 10),
      );
      expect(collection.hasNextPage).toBeTruthy();
      expect(collection.prevPage).toBeUndefined();
      expect(collection.hasPrevPage).toBeFalsy();
      expect(mockGetFromURLString).toHaveBeenCalledTimes(1);
      expect(mockGetFromURLString).toHaveBeenCalledWith(TestCollectionOneURL);

      collection.clear();

      expect(collection.length).toEqual(0);
      expect(collection.models).toEqual([]);
      expect(collection.nextPage).toBeUndefined();
      expect(collection.hasNextPage).toBeFalsy();
      expect(collection.prevPage).toBeUndefined();
      expect(collection.hasPrevPage).toBeFalsy();

      const fetchPromisePrev = collection.fetchPrevPage();
      getPromisePrev.resolve(fetchBodyPrev);
      await fetchPromisePrev;

      expect(collection.length).toEqual(10);
      expect(collection.nextPage).toEqual(
        TestUrlWithOffsets(TestCollectionOneURL, 10, 10),
      );
      expect(collection.hasNextPage).toBeTruthy();
      expect(collection.prevPage).toBeUndefined();
      expect(collection.hasPrevPage).toBeFalsy();
      expect(mockGetFromURLString).toHaveBeenCalledTimes(2);
      expect(mockGetFromURLString).toHaveBeenCalledWith(TestCollectionOneURL);
    });

    it('should fetch next and previous page', async () => {
      const [getPromise1, fetchBody1, models1] = setupTestCollectionOneFetch();
      const [getPromise2, fetchBody2, models2] = setupTestCollectionOneFetch({
        offset: 10,
        limit: 10,
      });
      const [getPromise3, fetchBody3, models3] = setupTestCollectionOneFetch({
        offset: 0,
        limit: 10,
      });

      const collection = new TestCollectionOne({
        fetch: true,
        tableName: 'table1',
      });

      getPromise1.resolve(fetchBody1);
      await collection.ready;

      expect(collection.url).toEqual(TestCollectionOneURL);
      expect(collection.length).toEqual(10);
      expect(collection.models).toEqual(models1);
      expect(collection.nextPage).toBe(
        TestUrlWithOffsets(TestCollectionOneURL, 10, 10),
      );
      expect(collection.hasNextPage).toBeTruthy();
      expect(collection.prevPage).toBeUndefined();
      expect(collection.hasPrevPage).toBeFalsy();

      const fetchPromise2 = collection.fetchNextPage();
      getPromise2.resolve(fetchBody2);

      const fetchModels2 = await fetchPromise2;

      expect(fetchModels2).toEqual([...models1, ...models2]);
      expect(collection.models).toEqual(fetchModels2);

      expect(collection.url).toEqual(TestCollectionOneURL);
      expect(collection.length).toEqual(20);
      expect(collection.nextPage).toBe(
        TestUrlWithOffsets(TestCollectionOneURL, 20, 10),
      );
      expect(collection.hasNextPage).toBeTruthy();
      expect(collection.prevPage).toBe(
        TestUrlWithOffsets(TestCollectionOneURL, 0, 10),
      );
      expect(collection.hasPrevPage).toBeTruthy();

      const fetchPromise3 = collection.fetchPrevPage();
      getPromise3.resolve(fetchBody3);

      const fetchModels3 = await fetchPromise3;

      expect(fetchModels3).toEqual([...models3, ...models2]);
      expect(collection.models).toEqual(fetchModels3);

      expect(collection.url).toEqual(TestCollectionOneURL);
      expect(collection.length).toEqual(20);
      expect(collection.nextPage).toBe(
        TestUrlWithOffsets(TestCollectionOneURL, 10, 10),
      );
      expect(collection.hasPrevPage).toBeFalsy();
      expect(collection.prevPage).toBeUndefined();
      expect(collection.hasPrevPage).toBeFalsy();
    });

    it('should fetch the first page if no pages have been fetched', async () => {
      const [getPromise, fetchBody, models] = setupTestCollectionOneFetch();

      const collection = new TestCollectionOne({});

      expect(collection.nextPage).toBeUndefined();

      const fetchPromise = collection.fetchNextPage();
      getPromise.resolve(fetchBody);
      await fetchPromise;

      expect(collection.url).toEqual(TestCollectionOneURL);
      expect(collection.length).toEqual(10);
      expect(collection.models).toEqual(models);
      expect(collection.nextPage).toBe(
        TestUrlWithOffsets(TestCollectionOneURL, 10, 10),
      );
      expect(collection.prevPage).toBeUndefined();
    });

    it('should handle a 404 at the end of the last page gracefully', async () => {
      const [getPromise1, fetchBody1, models1] = setupTestCollectionOneFetch();
      const [getPromise2, fetchBody2, models2] = setupTestCollectionOneFetch({
        offset: 10,
        limit: 10,
      });
      const getPromise3 = PromiseWithResolvers();
      mockGetFromURLString.mockReturnValueOnce(getPromise3.promise);

      const collection = new TestCollectionOne({
        fetch: true,
      });

      getPromise1.resolve(fetchBody1);
      await collection.ready;

      const fetchPromise2 = collection.fetchNextPage();

      getPromise2.resolve(fetchBody2);

      const fetchModels2 = await fetchPromise2;
      expect(fetchModels2).toEqual([...models1, ...models2]);
      expect(collection.models).toEqual(fetchModels2);

      let fetchError = null;

      try {
        const fetchPromise3 = collection.fetchNextPage();
        getPromise3.reject({
          status: 404,
          message: 'Not Found',
        });
        await fetchPromise3;
      } catch (err) {
        fetchError = err;
      }
      expect(fetchError).not.toBeNull();
      expect(collection.models).toEqual(fetchModels2);
    });
  });

  describe('utilities', () => {
    it('should say it has a next page', async () => {
      const [getPromise1, fetchBody1, models1] = setupTestCollectionOneFetch();
      const [getPromise2, fetchBody2, models2] = setupTestCollectionOneFetch({
        offset: 10,
        limit: 10,
      });
      const [getPromise3, fetchBody3, models3] = setupTestCollectionOneFetch(
        {
          offset: 20,
          limit: 10,
        },
        5,
      );

      const collection = new TestCollectionOne({
        fetch: true,
      });

      getPromise1.resolve(fetchBody1);
      await collection.ready;

      expect(collection.nextPage).toBe(
        TestUrlWithOffsets(TestCollectionOneURL, 10, 10),
      );
      expect(collection.prevPage).toBeUndefined();
      expect(collection.hasNextPage).toBeTruthy();
      expect(collection.hasPrevPage).toBeFalsy();

      const fetchPromise2 = collection.fetchNextPage();
      getPromise2.resolve(fetchBody2);

      const fetchModels2 = await fetchPromise2;

      expect(fetchModels2).toEqual([...models1, ...models2]);
      expect(collection.models).toEqual(fetchModels2);

      expect(collection.nextPage).toBe(
        TestUrlWithOffsets(TestCollectionOneURL, 20, 10),
      );
      expect(collection.prevPage).toBe(
        TestUrlWithOffsets(TestCollectionOneURL, 0, 10),
      );
      expect(collection.hasNextPage).toBeTruthy();
      expect(collection.hasPrevPage).toBeTruthy();

      const fetchPromise3 = collection.fetchNextPage();
      getPromise3.resolve(fetchBody3);

      const fetchModels3 = await fetchPromise3;

      expect(fetchModels3).toEqual([...models1, ...models2, ...models3]);
      expect(collection.models).toEqual(fetchModels3);

      expect(collection.nextPage).toBeUndefined();
      expect(collection.prevPage).toEqual(
        TestUrlWithOffsets(TestCollectionOneURL, 10, 10),
      );
      expect(collection.hasNextPage).toBeFalsy();
      expect(collection.hasPrevPage).toBeTruthy();
    });
  });

  // // Other test cases I should write once I consider how I should handle them:
  // // - 404 on the first page.
  // // - 404 on the previous page.
  // // - 50x on any page.
  // // - 304 (unchanged) on any page.
  // // - The models list actually being trimmed at the front or back.
  // // - POST a new model to the collection.
  // // - DELETE a model from the collection.
  // // - Test the array functions on the models
});
