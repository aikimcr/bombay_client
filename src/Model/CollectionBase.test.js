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
import * as Network from "../Network/Network";
jest.mock('../Network/Network');

import ModelBase from './ModelBase';
import CollectionBase from './CollectionBase';

it('should fetch the first page', async () => {
    const { resolve } = Network._setupMocks();
    
    const collection = new CollectionBase('/table');
    const [fetchBody, models] = makeModels(10);
    resolve(fetchBody);
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
    const { resolve: resolve1 } = Network._setupMocks();

    const collection = new CollectionBase('/table1');

    const [fetchBody1, models1] = makeModels(10, {});
    resolve1(fetchBody1);
    const fetchedModels1 = await collection.ready();

    const { resolve: resolve2 } = Network._setupMockPromise();
    const fetchPromise2 = collection.fetchNextPage();
    const [fetchBody2, models2] = makeModels(10, {offset: 10, limit: 10});
    resolve2(fetchBody2);
    
    const fetchModels2 = await fetchPromise2;
    expect(fetchModels2).toEqual([...models1, ...models2]);
    expect(collection.models()).toEqual(fetchModels2);
});

it('should fetch the next page and not add duplicates', async () => {
    // The situation this is testing is actually slightly pathological and
    // not easy to handle.  This strategy really only works if the data
    // doesn't change often.
    const { resolve: resolve1 } = Network._setupMocks();
    const collection = new CollectionBase('/table1');

    const [fetchBody1, models1] = makeModels(10, {});
    resolve1(fetchBody1);
    await collection.ready();

    const { resolve: resolve2 } = Network._setupMockPromise();
    const fetchPromise2 = collection.fetchNextPage();
    const [fetchBody2, models2] = makeModels(8, { offset: 10, limit: 10 });
    fetchBody2.data.unshift(...fetchBody1.data.slice(-2));
    models2.unshift(...models1.slice(-2));
    resolve2(fetchBody2);

    const fetchModels2 = await fetchPromise2;
    expect(fetchModels2).toEqual([...models1, ...models2.slice(2)]);
    expect(collection.models()).toEqual(fetchModels2);
});

it('should handle a 404 at the end of the last page gracefully', async () => {
    const { resolve: resolve1 } = Network._setupMocks();
    const collection = new CollectionBase('/table1');

    const [fetchBody1, models1] = makeModels(10, {});
    resolve1(fetchBody1);
    await collection.ready();

    const { resolve: resolve2 } = Network._setupMockPromise();
    const fetchPromise2 = collection.fetchNextPage();

    const [fetchBody2, models2] = makeModels(10, { offset: 10, limit: 10 });
    resolve2(fetchBody2);
    const fetchModels2 = await fetchPromise2;
    expect(fetchModels2).toEqual([...models1, ...models2]);
    expect(collection.models()).toEqual(fetchModels2);

    const { reject } = Network._setupMockPromise();
    const fetchPromise3 = collection.fetchNextPage();
    reject({status: 404, message: 'Not Found'});
    const fetchModels3 = await fetchPromise3;
    expect(fetchModels3).toEqual(fetchModels2);
    expect(collection.models()).toEqual(fetchModels2);
});

it('should fetch the previous page', async () => {
    const { resolve: resolve1 } = Network._setupMocks();
    const collection = new CollectionBase('/table1');

    const [fetchBody1, models1] = makeModels(10, {offset: 30, limit: 10});
    resolve1(fetchBody1);
    await collection.ready();

    const { resolve: resolve2 } = Network._setupMockPromise();
    const fetchPromise2 = collection.fetchPrevPage();

    const [fetchBody2, models2] = makeModels(10, { offset: 20, limit: 10 });
    resolve2(fetchBody2);
    const fetchModels2 = await fetchPromise2;
    expect(fetchModels2).toEqual([...models2, ...models1]);
    expect(collection.models()).toEqual(fetchModels2);
});

if('should fetch the previous page and not add duplicates', async () => {
    // The situation this is testing is actually slightly pathological and
    // not easy to handle.  This strategy really only works if the data
    // doesn't change often.
    const { resolve: resolve1 } = Network._setupMocks();
    const collection = new CollectionBase('/table1');

    const [fetchBody1, models1] = makeModels(10, { offset: 20, limit: 10 });
    resolve1(fetchBody1);
    await collection.ready();

    const { resolve: resolve2 } = Network._setupMockPromise();
    const fetchPromise2 = collection.fetchPrevPage();

    const [fetchBody2, models2] = makeModels(8, { offset: 10, limit: 10 });
    fetchBody2.data.push(...fetchBody1.data.slice(-2));
    models2.push(...models1.slice(-2));
    resolve2(fetchBody2);
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