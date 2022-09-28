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

import ArtistModel from './ArtistModel';
import CollectionBase from './CollectionBase';
import ArtistCollection from './ArtistCollection';


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

    return [result, models];
}

it('should not recognize a base model as an artist model', async () => {
    // If the class extension is done correctly, Javascript should just handle this.
    setupMocks();
    const baseCollection = new CollectionBase({});

    setupMockPromise();
    const artistCollection = new ArtistCollection({});

    expect(CollectionBase.isCollection(baseCollection)).toBeTruthy();
    expect(CollectionBase.isCollection(artistCollection)).toBeTruthy();

    expect(ArtistCollection.isCollection(baseCollection)).toBeFalsy();
    expect(ArtistCollection.isCollection(artistCollection)).toBeTruthy();
});