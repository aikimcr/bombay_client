//
// Models must:
// - Fetch based on a unique id
// - Set the data fields on instantiate
// - Allow changing of field values.
import {
  mockGetFromURLString,
  mockPutToURLString,
  mockPrepareURLFromArgs,
  mockPostToURLString,
  mockBuildURL,
  mockDefaultAPIBasePath,
  mockDefaultAPIServer,
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

import * as Network from '../Network/Network';

import { setupTestModelOneFetch, TestUrlWithId } from './testing';
import {
  TestCollectionOneURL,
  TestModelOne,
  TestModelOneData,
} from '../testHelpers';

describe('ModelBase', () => {
  describe('Basic creation', () => {
    it('should instantiate a model', async () => {
      mockBuildURL.mockReturnValue(TestUrlWithId(TestCollectionOneURL, 119));
      const def: TestModelOneData = {
        id: 119,
        name: 'xyzzy',
        description:
          'Est dolore commodo ut aliquip nostrud dolor nulla reprehenderit laboris.',
      };

      const model = new TestModelOne({
        data: def,
      });

      expect(TestModelOne.isModel(model)).toBeTruthy();
      expect(model.url).toBeUndefined;
      expect(model.id).toBeUndefined;
      expect(model.name).toBe('xyzzy');
      expect(model.description).toBe(
        'Est dolore commodo ut aliquip nostrud dolor nulla reprehenderit laboris.',
      );
    });

    it('should instantiate a model keeping the id', async () => {
      mockBuildURL.mockReturnValue(TestUrlWithId(TestCollectionOneURL, 119));
      const model = new TestModelOne({
        data: {
          id: 119,
          name: 'xyzzy',
          description:
            'Laboris nulla ut ut eu et magna velit Lorem cupidatat incididunt Lorem et.',
        },
        keepId: true,
      });

      expect(TestModelOne.isModel(model)).toBeTruthy();
      expect(model.url).toBe(TestUrlWithId(TestCollectionOneURL, 119));
      expect(model.id).toBe(119);
      expect(model.name).toBe('xyzzy');
      expect(model.description).toBe(
        'Laboris nulla ut ut eu et magna velit Lorem cupidatat incididunt Lorem et.',
      );
    });

    it('should create an empty model', async () => {
      mockBuildURL.mockReturnValue(TestUrlWithId(TestCollectionOneURL, 119));
      const model = new TestModelOne({});

      expect(TestModelOne.isModel(model)).toBeTruthy();
      expect(model.url).toBeUndefined;
      expect(model.id).toBeUndefined();
      expect(model.name).toBeUndefined();
      expect(model.description).toBeUndefined();
    });

    it('should create a model from a definition', async () => {
      mockBuildURL.mockReturnValue(TestUrlWithId(TestCollectionOneURL, 63));
      const model = TestModelOne.from<TestModelOneData, TestModelOne>({
        id: 63,
        name: 'Plover',
        description:
          'Voluptate proident ad tempor fugiat pariatur sunt exercitation id non.',
      });

      expect(TestModelOne.isModel(model)).toBeTruthy();
      expect(model.url).toBeUndefined;
      expect(model.id).toBeUndefined;
      expect(model.name).toBe('Plover');
      expect(model.description).toBe(
        'Voluptate proident ad tempor fugiat pariatur sunt exercitation id non.',
      );
    });

    it('should create a model from a definition keeping the id', async () => {
      mockBuildURL.mockReturnValue(TestUrlWithId(TestCollectionOneURL, 63));
      const model = TestModelOne.from<TestModelOneData, TestModelOne>(
        {
          id: 63,
          name: 'Plover',
          description: 'Dolor occaecat exercitation ipsum occaecat.',
        },
        { keepId: true },
      );

      expect(TestModelOne.isModel(model)).toBeTruthy();
      expect(model.url).toBe(TestUrlWithId(TestCollectionOneURL, 63));
      expect(model.id).toBe(63);
      expect(model.name).toBe('Plover');
      expect(model.description).toBe(
        'Dolor occaecat exercitation ipsum occaecat.',
      );
    });

    it('should fetch a model', async () => {
      const [getPromise, fetchBody] = setupTestModelOneFetch();
      mockBuildURL.mockReturnValue(
        TestUrlWithId(TestCollectionOneURL, fetchBody.id),
      );
      const model = new TestModelOne({ id: fetchBody.id });

      const fetchPromise = model.ready;
      getPromise.resolve(fetchBody);
      const fetchDef = await fetchPromise;

      expect(model.id).toBe(1);
      expect(model.url).toBe(TestUrlWithId(TestCollectionOneURL, 1));
      expect(model.name).toBe(fetchBody.name);
      expect(model.description).toBe(fetchBody.description);

      expect(model.toJSON()).toEqual(fetchBody);
      expect(fetchDef).toEqual(fetchBody);

      expect(Network.getFromURLString).toHaveBeenCalledTimes(1);
      expect(Network.getFromURLString).toHaveBeenCalledWith(model.url);
    });

    it('should clone a model', async () => {
      mockBuildURL.mockReturnValue(TestUrlWithId(TestCollectionOneURL, 119));
      const [getPromise, fetchBody] = setupTestModelOneFetch();
      const model = new TestModelOne({ id: fetchBody.id });

      const fetchPromise = model.ready;
      getPromise.resolve(fetchBody);
      await fetchPromise;

      expect(model.id).toBeDefined();
      expect(model.id).toBeGreaterThan(0);

      const newModel = TestModelOne.from<TestModelOneData, TestModelOne>(model);

      expect(TestModelOne.isModel(newModel)).toBeTruthy();
      expect(newModel.url).toBeUndefined();
      expect(newModel.id).toBeUndefined();
      expect(newModel.name).toEqual(model.name);
      expect(newModel.description).toBe(fetchBody.description);
    });
  });

  describe('Saving data', () => {
    it('Create and save a model', async () => {
      const model = new TestModelOne({});
      mockBuildURL.mockReturnValue(TestUrlWithId(TestCollectionOneURL, 10));

      const postPromise = PromiseWithResolvers();
      mockPostToURLString.mockReturnValue(postPromise.promise);

      model.name = 'xyzzy';
      model.description = 'Officia dolor Lorem ex minim duis.';

      expect(mockPostToURLString).not.toHaveBeenCalled();
      expect(model.id).toBeUndefined();
      expect(model.url).toBeUndefined();
      expect(model.name).toBe('xyzzy');
      expect(model.description).toBe('Officia dolor Lorem ex minim duis.');

      const newBodyPromise = model.save();

      postPromise.resolve({
        id: 10,
        name: 'xyzzy',
        description: 'Officia dolor Lorem ex minim duis.',
      });

      await newBodyPromise;

      expect(mockPostToURLString).toHaveBeenCalledTimes(1);
      expect(model.id).toBe(10);
      expect(model.url).toBe(TestUrlWithId(TestCollectionOneURL, 10));
      expect(model.name).toBe('xyzzy');
      expect(model.description).toBe('Officia dolor Lorem ex minim duis.');
    });

    it('should save changes to the model', async () => {
      mockBuildURL.mockReturnValue(TestUrlWithId(TestCollectionOneURL, 119));
      const [getPromise, fetchBody] = setupTestModelOneFetch();

      const model = new TestModelOne({ id: fetchBody.id });

      getPromise.resolve(fetchBody);

      const fetchPromise = model.ready;
      getPromise.resolve(fetchBody);
      await fetchPromise;

      const modelUrl = model.url;

      expect(model.id).toEqual(fetchBody.id);
      expect(model.name).toEqual(fetchBody.name);
      expect(model.description).toEqual(fetchBody.description);

      const putPromise = PromiseWithResolvers();
      mockPutToURLString.mockReturnValue(putPromise.promise);

      const newName = 'Updated Name';
      model.name = newName;
      expect(model.id).toEqual(fetchBody.id);
      expect(model.name).toEqual(newName);
      expect(model.description).toEqual(fetchBody.description);

      const newBodyPromise = model.save();

      putPromise.resolve({
        ...fetchBody,
        name: newName,
      });

      await newBodyPromise;

      expect(model.id).toEqual(fetchBody.id);
      expect(model.name).toEqual(newName);
      expect(model.description).toEqual(fetchBody.description);

      expect(mockPutToURLString).toHaveBeenCalledTimes(1);
      expect(mockPutToURLString).toHaveBeenCalledWith(modelUrl, {
        id: model.id,
        name: newName,
        description: model.description,
      });
    });
  });

  // I need collections done before I can do this.
  // describe('References', () => {
  //   it('should set up a refe
  mockBuildURL.mockReturnValue(TestUrlWithId(TestCollectionOneURL, 119));
});
