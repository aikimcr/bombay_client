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
// - Be  agnostic to the model type.
import casual from 'casual';

let mockPromise;
let mockResolver;
let mockRejector;

import * as Network from "../Network/Network";
jest.mock('../Network/Network', () => {
    const originalModule = jest.requireActual('../Network/Network');

    return {
        __esModule: true,
        ...originalModule,
        getFromPath: (path, query) => { expect('').toBe('Did Your forget to mock something?'); },
        getFromURLString: (path, query) => { expect('').toBe('Did Your forget to mock something?'); },
        postToPath: (path, body, query) => { expect('').toBe('Did Your forget to mock something?'); },
    };
});

function setupMockPromise() {
    [mockPromise, mockResolver, mockRejector] = makeResolvablePromise();
}

function setupMocks() {
    setupMockPromise();
    Network.getFromPath = jest.fn((path, query) => mockPromise);
    Network.getFromURLString = jest.fn((urlString, query) => mockPromise);
}

import ModelBase from './ModelBase';
import CollectionBase from './CollectionBase';


function makeAModel() {
    const id = casual.nextId('table1');
    const name = casual.uniqueName('table1');
    const url = Network.buildURL({ path: `/table1/${id}` });

    const def = { id, name, url };
    return [def, ModelBase.from(def)];
}

function makeModels(length = 10, query = {}) {
    const result = {
        data: [],
    };

    const models = [];

    while (result.data.length < length) {
        const [def, model] = makeAModel();
        result.data.push(def);
        models.push(model);
    }

    let offset = (query.offset || 0) - length;
    let limit = query.limit || length;

    if (offset >= 0) {
        result.prevPage = Network.prepareURLFromArgs('/table1', { offset, limit }).toString();
    }

    if (limit <= length) {
        offset = (query.offset || 0) + length;
        result.nextPage = Network.prepareURLFromArgs('/table1', { offset, limit }).toString();
    }

    expect(JSON.stringify(result.data)).toStrictEqual(JSON.stringify(models));
    
    return [result, models];
}

it('should fetch the first page', async () => {
    setupMocks();
    
    const collection = new CollectionBase('/table');
    const [fetchBody, models] = makeModels(10);
    mockResolver(fetchBody);
    const fetchedModels = await collection.ready();
    expect(CollectionBase.isCollection(collection)).toBeTruthy();
    expect(collection.models()).toEqual(models);
});

it('should instantiate with a set of models', async () => {
    // In this case, paging may not be possible.
    const collection = new CollectionBase('/table1', {
        models: [{
            id: 1,
            name: 'Herkimer P Jones',
        }, {
            id: 2,
            name: 'Agathea S Reese',
        }],
    });

    // The promise should already be resolved
    const fetchedModels = await collection.ready();
    expect(collection.length()).toBe(2);
    expect(collection.models()).toEqual([
        new ModelBase({id: 1, name: 'Herkimer P Jones'}),
        new ModelBase({id: 2, name: 'Agathea S Reese'}),
    ]);
});

it('should fetch another page', async () => {
    setupMocks();

    const collection = new CollectionBase('/table1');

    const [fetchBody1, models1] = makeModels(10, {});
    mockResolver(fetchBody1);
    const fetchedModels1 = await collection.ready();

    setupMockPromise();
    const fetchPromise2 = collection.fetchNextPage();
    const [fetchBody2, models2] = makeModels(10, {offset: 10, limit: 10});
    mockResolver(fetchBody2);
    
    const fetchModels2 = await fetchPromise2;
    expect(fetchModels2).toEqual([...models1, ...models2]);
    expect(collection.models()).toEqual(fetchModels2);
});

it('should fetch the next page and not add duplicates', async () => {
    // The situation this is testing is actually slightly pathological and
    // not easy to handle.  This strategy really only works if the data
    // doesn't change often.
    setupMocks();
    const collection = new CollectionBase('/table1');

    const [fetchBody1, models1] = makeModels(10, {});
    mockResolver(fetchBody1);
    await collection.ready();

    setupMockPromise();
    const fetchPromise2 = collection.fetchNextPage();
    const [fetchBody2, models2] = makeModels(8, { offset: 10, limit: 10 });
    fetchBody2.data.unshift(...fetchBody1.data.slice(-2));
    models2.unshift(...models1.slice(-2));
    mockResolver(fetchBody2);

    const fetchModels2 = await fetchPromise2;
    expect(fetchModels2).toEqual([...models1, ...models2.slice(2)]);
    expect(collection.models()).toEqual(fetchModels2);
});

it('should handle a 404 at the end of the last page gracefully', async () => {
    setupMocks();
    const collection = new CollectionBase('/table1');

    const [fetchBody1, models1] = makeModels(10, {});
    mockResolver(fetchBody1);
    await collection.ready();

    setupMockPromise();
    const fetchPromise2 = collection.fetchNextPage();

    const [fetchBody2, models2] = makeModels(10, { offset: 10, limit: 10 });
    mockResolver(fetchBody2);
    const fetchModels2 = await fetchPromise2;
    expect(fetchModels2).toEqual([...models1, ...models2]);
    expect(collection.models()).toEqual(fetchModels2);

    setupMockPromise();
    const fetchPromise3 = collection.fetchNextPage();
    mockRejector({status: 404, message: 'Not Found'});
    const fetchModels3 = await fetchPromise3;
    expect(fetchModels3).toEqual(fetchModels2);
    expect(collection.models()).toEqual(fetchModels2);
});

it('should fetch the previous page', async () => {
    setupMocks();
    const collection = new CollectionBase('/table1');

    const [fetchBody1, models1] = makeModels(10, {offset: 30, limit: 10});
    mockResolver(fetchBody1);
    await collection.ready();

    setupMockPromise();
    const fetchPromise2 = collection.fetchPrevPage();

    const [fetchBody2, models2] = makeModels(10, { offset: 20, limit: 10 });
    mockResolver(fetchBody2);
    const fetchModels2 = await fetchPromise2;
    expect(fetchModels2).toEqual([...models2, ...models1]);
    expect(collection.models()).toEqual(fetchModels2);
});

if('should fetch the previous page and not add duplicates', async () => {
    // The situation this is testing is actually slightly pathological and
    // not easy to handle.  This strategy really only works if the data
    // doesn't change often.
    setupMocks();
    const collection = new CollectionBase('/table1');

    const [fetchBody1, models1] = makeModels(10, { offset: 20, limit: 10 });
    mockResolver(fetchBody1);
    await collection.ready();

    setupMockPromise();
    const fetchPromise2 = collection.fetchPrevPage();

    const [fetchBody2, models2] = makeModels(8, { offset: 10, limit: 10 });
    fetchBody2.data.push(...fetchBody1.data.slice(-2));
    models2.push(...models1.slice(-2));
    mockResolver(fetchBody2);
    const fetchModels2 = await fetchPromise2;
    expect(fetchModels2).toEqual([...models2.slice(2), ...models1]);
    expect(collection.models()).toEqual(fetchModels2);
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