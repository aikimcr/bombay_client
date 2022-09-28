//
// Models must:
// - Fetch based on a unique id
// - Set the data fields on instantiate
// - Allow changing of field values.
import * as Network from "../Network/Network";
jest.mock('../Network/Network');

import ModelBase from './ModelBase';

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

// ToDO: Mocking is not working on getFDromURLString here.
// it('should fetch a model', async () => {
//     const { resolve } = Network._setupMocks();
//     debugger;
//     const [fetchBody, model] = makeAModel();
   
//     const fetchPromise = ModelBase.fetch(fetchBody.url);
//     resolve(fetchBody);
//     const fetchedModel = await fetchPromise;
//     expect(ModelBase.isModel(fetchedModel)).toBeTruthy();
//     expect(fetchedModel).toEqual(model);
// });