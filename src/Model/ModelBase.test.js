//
// Models must:
// - Fetch based on a unique id
// - Set the data fields on instantiate
// - Allow changing of field values.

import * as Network from '../Network/Network';

import casual from 'casual';

let mockPromise;
let mockResolver;
let mockRejector;

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

function makeAModel() {
    const id = casual.nextId('table1');
    const name = casual.uniqueName('table1');
    const url = Network.buildURL({ path: `/table1/${id}` });

    const def = { id, name, url };
    return [def, ModelBase.from(def)];
}

it('should instantiate a model', async () => {
    const model = new ModelBase({
        id: 119,
        name: 'xyzzy',
    });

    expect(ModelBase.isModel(model)).toBeTruthy();
    expect(model.get('id')).toBe(119)
    expect(model.get('name')).toBe('xyzzy');

    // Method under test must be wrapped in a function or the throw is not caught.
    expect(() => model.get('shoesize')).toThrowError('No field "shoesize" is set');
    model.set('shoesize', 36);
    expect(model.get('shoesize')).toBe(36);
})

it('should create a model from a definition', async () => {
    const model = ModelBase.from({
        id: 63,
        name: 'Plover',
    });


    expect(ModelBase.isModel(model)).toBeTruthy();
    expect(model.get('id')).toBe(63)
    expect(model.get('name')).toBe('Plover');
});

it('should fetch a model', async () => {
    setupMocks();
    const [fetchBody, model] = makeAModel();
   
    const fetchPromise = ModelBase.fetch(fetchBody.url);
    mockResolver(fetchBody);
    const fetchedModel = await fetchPromise;
    expect(ModelBase.isModel(fetchedModel)).toBeTruthy();
    expect(fetchedModel).toEqual(model);
});