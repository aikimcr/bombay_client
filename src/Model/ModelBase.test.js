//
// Models must:
// - Fetch based on a unique id
// - Set the data fields on instantiate
// - Allow changing of field values.
import * as Network from "../Network/Network";
// jest.mock('../Network/Network'); // This doesn't actually work here.

import casual from 'casual';

import ModelBase from './ModelBase';

it('should instantiate a model', async () => {
    // const { resolve } = Network._setupMocks();
    const model = new ModelBase(null, {
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
    // const { resolve } = Network._setupMocks();
    const model = ModelBase.from({
        id: 63,
        name: 'Plover',
    });


    expect(ModelBase.isModel(model)).toBeTruthy();
    expect(model.get('id')).toBe(63)
    expect(model.get('name')).toBe('Plover');
});

// // ToDO: Mocking is not working on getFromURLString here.
it('should fetch a model', async () => {
    const [mockPromise, mockResolve] = makeResolvablePromise();
    // The mock is not recognized unless it is done this way. 
    Network.getFromURLString = jest.fn((url) => {
        return mockPromise;
    });

    const [fetchBody, fetchModel] = makeAModel();
   
    const model = new ModelBase(fetchBody.url);
    const fetchPromise = model.ready();
    mockResolve(fetchBody);
    const fetchDef = await fetchPromise;
    expect(model.toJSON()).toEqual(fetchBody);
    expect(model.toJSON()).toEqual(fetchModel.toJSON());
    expect(fetchDef).toEqual(fetchBody);

    expect(Network.getFromURLString).toBeCalledTimes(1);
    expect(Network.getFromURLString).toBeCalledWith(fetchBody.url);
});

it('should save changes to the model', async () => {
    const [mockPromise, mockResolve] = makeResolvablePromise();
    // The mock is not recognized unless it is done this way.
    Network.putToURLString = jest.fn((url, body) => {
        return mockPromise;
    });

    const [oldBody, oldModel] = makeAModel();
    const model = ModelBase.from(oldBody);
    expect(model.toJSON()).toEqual(oldBody);

    const newName = casual.uniqueName('table1');
    debugger;
    model.set('name', newName);
    expect(model.toJSON()).not.toEqual(oldBody);
    expect(model.get('name')).toEqual(newName);

    const savePromise = model.save();
    mockResolve({...oldBody, name: newName});
    const newBody = await savePromise;
    expect(newBody).not.toEqual(oldBody);
    expect(newBody.name).toEqual(newName);
    
    expect(Network.putToURLString).toBeCalledTimes(1);
    expect(Network.putToURLString).toBeCalledWith(oldBody.url, {...oldBody, name: newName});
});